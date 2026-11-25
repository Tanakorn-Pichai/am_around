export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface RoadPathMetrics {
  points: LatLngPoint[];
  cumulativeMeters: number[];
  totalMeters: number;
}

export interface SampledRoadPlacement {
  point: LatLngPoint;
  pathIndex: number | null;
  distanceAlongPath: number;
}

/**
 * Haversine distance in meters between two lat/lng coordinates.
 */
export function distanceMeters(a: LatLngPoint, b: LatLngPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng *
      sinLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Offset a lat/lng point by distanceMeters at a bearing in radians.
 */
export function offsetPoint(
  origin: LatLngPoint,
  meters: number,
  bearingRad: number
): LatLngPoint {
  const latRad = (origin.lat * Math.PI) / 180;
  const dLat = (meters * Math.cos(bearingRad)) / 111320;
  const dLng = (meters * Math.sin(bearingRad)) / (111320 * Math.cos(latRad));
  return {
    lat: origin.lat + dLat,
    lng: origin.lng + dLng,
  };
}

/**
 * Builds 4 randomized compass points around pickup so a single Routes API call
 * traces real surrounding roads in all directions.
 */
export function buildSurroundingRoadWaypoints(pickup: LatLngPoint): LatLngPoint[] {
  const baseAngle = Math.random() * Math.PI * 2;
  return [0, 1, 2, 3].map((idx) => {
    const jitterAngle = (Math.random() - 0.5) * (Math.PI / 5);
    const angle = baseAngle + idx * (Math.PI / 2) + jitterAngle;
    const radius = 520 + Math.random() * 480; // 520m - 1000m from pickup
    return offsetPoint(pickup, radius, angle);
  });
}

/**
 * Safely extracts plain { lat, lng } road points from a Routes API Route result.
 */
export function extractRoadPointsFromRoute(route: {
  path?: Array<{ lat: number | (() => number); lng: number | (() => number) }>;
  createPolylines?: () => google.maps.Polyline[];
}): LatLngPoint[] {
  const result: LatLngPoint[] = [];

  if (Array.isArray(route.path) && route.path.length > 0) {
    for (const pt of route.path) {
      const lat = typeof pt.lat === 'function' ? pt.lat() : pt.lat;
      const lng = typeof pt.lng === 'function' ? pt.lng() : pt.lng;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        result.push({ lat, lng });
      }
    }
    return result;
  }

  if (typeof route.createPolylines === 'function') {
    const polys = route.createPolylines();
    for (const poly of polys) {
      const arr = poly.getPath().getArray();
      for (const pt of arr) {
        result.push({ lat: pt.lat(), lng: pt.lng() });
      }
      poly.setMap(null);
    }
  }

  return result;
}

/**
 * Precomputes cumulative real-world road distances (meters) along a continuous polyline.
 */
export function computeRoadPathMetrics(points: LatLngPoint[]): RoadPathMetrics {
  const cumulativeMeters: number[] = [];
  let total = 0;

  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      total += distanceMeters(points[i - 1], points[i]);
    }
    cumulativeMeters.push(total);
  }

  return {
    points,
    cumulativeMeters,
    totalMeters: total,
  };
}

/**
 * Interpolates the exact lat/lng point at `targetMeters` along a continuous road polyline.
 */
export function samplePointAtDistance(
  metrics: RoadPathMetrics,
  targetMeters: number
): LatLngPoint {
  const { points, cumulativeMeters, totalMeters } = metrics;
  if (points.length === 0) return { lat: 0, lng: 0 };
  if (points.length === 1 || totalMeters <= 0 || targetMeters <= 0) {
    return points[0];
  }
  if (targetMeters >= totalMeters) {
    return points[points.length - 1];
  }

  // Binary search for segment [lo, lo + 1] containing targetMeters
  let lo = 0;
  let hi = cumulativeMeters.length - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulativeMeters[mid] <= targetMeters) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const d0 = cumulativeMeters[lo];
  const d1 = cumulativeMeters[lo + 1];
  const segLen = d1 - d0;
  if (segLen <= 0.0001) return points[lo];

  const t = (targetMeters - d0) / segLen;
  const p0 = points[lo];
  const p1 = points[lo + 1];
  return {
    lat: p0.lat + (p1.lat - p0.lat) * t,
    lng: p0.lng + (p1.lng - p0.lng) * t,
  };
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Samples `count` distinct, well-separated, randomized placements lying on real continuous
 * road polylines around `pickup`, preserving each placement's exact pathIndex and meter offset
 * so selected riders can cruise smoothly along real road distances.
 */
export function sampleDistinctRoadPlacements(
  roadPaths: LatLngPoint[][],
  pickup: LatLngPoint,
  destination: LatLngPoint,
  count: number
): SampledRoadPlacement[] {
  const allSamples: SampledRoadPlacement[] = [];

  roadPaths.forEach((rawPath, pathIndex) => {
    if (rawPath.length < 2) return;
    const metrics = computeRoadPathMetrics(rawPath);
    if (metrics.totalMeters < 20) return;

    const stepMeters = 45;
    for (let d = 0; d <= metrics.totalMeters; d += stepMeters) {
      const point = samplePointAtDistance(metrics, d);
      allSamples.push({
        point,
        pathIndex,
        distanceAlongPath: d,
      });
    }
  });

  // Filter to natural nearby zone around pickup and avoid overlapping pickup/destination labels
  const deduped: SampledRoadPlacement[] = [];
  for (const item of allSamples) {
    const distToPickup = distanceMeters(item.point, pickup);
    const distToDest = distanceMeters(item.point, destination);
    if (distToPickup < 190 || distToPickup > 1800) continue;
    if (distToDest < 140) continue;

    let tooClose = false;
    for (let i = Math.max(0, deduped.length - 12); i < deduped.length; i++) {
      if (distanceMeters(deduped[i].point, item.point) < 40) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) deduped.push(item);
  }

  let candidates = deduped;
  if (candidates.length < count) {
    candidates = allSamples.filter((item) => {
      const distToPickup = distanceMeters(item.point, pickup);
      return distToPickup >= 120 && distToPickup <= 3200;
    });
  }

  // Bucket candidates into 6 compass sectors around pickup for balanced spatial spread
  const sectors: SampledRoadPlacement[][] = [[], [], [], [], [], []];
  for (const item of candidates) {
    const angle = Math.atan2(item.point.lng - pickup.lng, item.point.lat - pickup.lat);
    const norm = (angle + Math.PI * 2) % (Math.PI * 2);
    const sectorIdx = Math.min(5, Math.floor((norm / (Math.PI * 2)) * 6));
    sectors[sectorIdx].push(item);
  }

  const orderedPool: SampledRoadPlacement[] = [];
  const shuffledSectors = shuffleArray(sectors.map((s) => shuffleArray(s)));
  const maxLen = Math.max(0, ...shuffledSectors.map((s) => s.length));
  for (let round = 0; round < maxLen; round++) {
    for (const s of shuffledSectors) {
      if (round < s.length) orderedPool.push(s[round]);
    }
  }

  const picked: SampledRoadPlacement[] = [];
  const separationSteps = [290, 210, 140, 80, 30];

  for (const minSep of separationSteps) {
    if (picked.length >= count) break;
    for (const item of orderedPool) {
      if (picked.length >= count) break;
      const isFarEnough = picked.every(
        (p) => distanceMeters(p.point, item.point) >= minSep
      );
      if (isFarEnough) {
        picked.push(item);
      }
    }
  }

  // Fallback for any remaining slots if roadPaths were unavailable
  const fallbackBaseAngle = Math.random() * Math.PI * 2;
  while (picked.length < count) {
    const idx = picked.length;
    const angle =
      fallbackBaseAngle +
      (idx * Math.PI * 2) / count +
      (Math.random() - 0.5) * 0.38;
    const radius = 320 + Math.random() * 680;
    picked.push({
      point: offsetPoint(pickup, radius, angle),
      pathIndex: null,
      distanceAlongPath: 0,
    });
  }

  return shuffleArray(picked);
}
