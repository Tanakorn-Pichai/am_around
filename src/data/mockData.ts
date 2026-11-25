import { ActiveSearchRoute, LocationItem, Provider, RideOption } from '../types';
import {
  computeRoadPathMetrics,
  distanceMeters,
  LatLngPoint,
  offsetPoint,
  sampleDistinctRoadPlacements,
} from '../utils/roadRiders';

export const APP_CONFIG = {
  brandName: 'am around',
  currency: 'THB',
  currencySymbol: '฿',
  defaultCenter: {
    lat: 13.8142,
    lng: 100.4985,
  },
};

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'grab',
    name: 'Grab',
    shortCode: 'G',
    badgeColor: '#00B14F',
    isSelected: true,
    deepLinkScheme: 'grab://open',
    fallbackUrl: 'https://grab.com',
    serviceName: 'GrabBike',
  },
  {
    id: 'lineman',
    name: 'LINE MAN RIDE',
    shortCode: 'L',
    badgeColor: '#06C755',
    isSelected: false,
    deepLinkScheme: 'lineman://ride',
    fallbackUrl: 'https://lineman.line.me',
    serviceName: 'LINE MAN Bike',
  },
  {
    id: 'bolt',
    name: 'Bolt',
    shortCode: 'B',
    badgeColor: '#34D186',
    isSelected: true,
    deepLinkScheme: 'bolt://ride',
    fallbackUrl: 'https://bolt.eu',
    serviceName: 'Bolt Motorbike',
  },
  {
    id: 'indrive',
    name: 'inDrive',
    shortCode: 'i',
    badgeColor: '#1E1E1E',
    isSelected: false,
    deepLinkScheme: 'indrive://open',
    fallbackUrl: 'https://indrive.com',
    serviceName: 'inDrive Moto',
  },
  {
    id: 'maxim',
    name: 'Maxim',
    shortCode: 'M',
    badgeColor: '#FF5733',
    isSelected: true,
    deepLinkScheme: 'maxim://order',
    fallbackUrl: 'https://taximaxim.com',
    serviceName: 'Maxim Bike',
  },
  {
    id: 'tada',
    name: 'TADA',
    shortCode: 'T',
    badgeColor: '#2B59FF',
    isSelected: false,
    deepLinkScheme: 'tada://ride',
    fallbackUrl: 'https://tada.global',
    serviceName: 'TADA Bike',
  },
];

export const SAVED_LOCATIONS: LocationItem[] = [
  {
    id: 'loc_01',
    name: 'เทศบาลเมืองบางกรวย',
    shortName: 'เทศบาลบางกรวย',
    district: 'บางกรวย, นนทบุรี',
    lat: 13.8051,
    lng: 100.4728,
    isRecent: true,
  },
  {
    id: 'loc_02',
    name: 'มจพ. พระนครเหนือ',
    shortName: 'มจพ.',
    district: 'บางซื่อ, กรุงเทพมหานคร',
    lat: 13.8191,
    lng: 100.5143,
    isRecent: true,
  },
  {
    id: 'loc_03',
    name: 'MRT บางซื่อ (ทางออก 2)',
    shortName: 'MRT บางซื่อ',
    district: 'บางซื่อ, กรุงเทพมหานคร',
    lat: 13.8025,
    lng: 100.5372,
    isRecent: true,
  },
  {
    id: 'loc_04',
    name: 'เซ็นทรัล ลาดพร้าว',
    shortName: 'เซ็นทรัล ลาดพร้าว',
    district: 'จตุจักร, กรุงเทพมหานคร',
    lat: 13.8161,
    lng: 100.5608,
    isRecent: false,
  },
];

export const DEFAULT_ROUTE: ActiveSearchRoute = {
  pickup: SAVED_LOCATIONS[0],
  destination: SAVED_LOCATIONS[1],
  distanceKm: 6.4,
  routePolyline: [
    [13.8051, 100.4728],
    [13.8095, 100.481],
    [13.814, 100.4955],
    [13.8172, 100.506],
    [13.8191, 100.5143],
  ],
};

export const DEFAULT_NEARBY_RIDES: RideOption[] = [
  {
    id: 'ride_01',
    providerId: 'grab',
    providerName: 'Grab',
    serviceName: 'GrabBike',
    vehicleType: 'motorbike',
    etaMinutes: 3,
    distanceKm: 0.6,
    estimatedFare: 95,
    currency: 'THB',
    isRecommended: true,
    driverPin: {
      shortCode: 'G',
      badgeColor: '#00B14F',
      lat: 13.8082,
      lng: 100.4765,
    },
  },
  {
    id: 'ride_02',
    providerId: 'maxim',
    providerName: 'Maxim',
    serviceName: 'Maxim Bike',
    vehicleType: 'motorbike',
    etaMinutes: 5,
    distanceKm: 0.9,
    estimatedFare: 80,
    currency: 'THB',
    isRecommended: false,
    driverPin: {
      shortCode: 'M',
      badgeColor: '#FF5733',
      lat: 13.8038,
      lng: 100.4702,
    },
  },
  {
    id: 'ride_03',
    providerId: 'bolt',
    providerName: 'Bolt',
    serviceName: 'Bolt Motorbike',
    vehicleType: 'motorbike',
    etaMinutes: 9,
    distanceKm: 1.1,
    estimatedFare: 85,
    currency: 'THB',
    isRecommended: false,
    driverPin: {
      shortCode: 'B',
      badgeColor: '#34D186',
      lat: 13.811,
      lng: 100.492,
    },
  },
  {
    id: 'ride_04',
    providerId: 'lineman',
    providerName: 'LINE MAN RIDE',
    serviceName: 'LINE MAN Bike',
    vehicleType: 'motorbike',
    etaMinutes: 6,
    distanceKm: 1.0,
    estimatedFare: 90,
    currency: 'THB',
    isRecommended: false,
    driverPin: {
      shortCode: 'L',
      badgeColor: '#06C755',
      lat: 13.807,
      lng: 100.483,
    },
  },
  {
    id: 'ride_05',
    providerId: 'tada',
    providerName: 'TADA',
    serviceName: 'TADA Bike',
    vehicleType: 'motorbike',
    etaMinutes: 11,
    distanceKm: 1.8,
    estimatedFare: 88,
    currency: 'THB',
    isRecommended: false,
    driverPin: {
      shortCode: 'T',
      badgeColor: '#2B59FF',
      lat: 13.8155,
      lng: 100.501,
    },
  },
  {
    id: 'ride_06',
    providerId: 'indrive',
    providerName: 'inDrive',
    serviceName: 'inDrive Moto',
    vehicleType: 'motorbike',
    etaMinutes: 7,
    distanceKm: 1.3,
    estimatedFare: 78,
    currency: 'THB',
    isRecommended: false,
    driverPin: {
      shortCode: 'i',
      badgeColor: '#1E1E1E',
      lat: 13.8124,
      lng: 100.4792,
    },
  },
];

const PROVIDER_FARE_MULTIPLIER: Record<string, number> = {
  grab: 1.0,
  maxim: 0.84,
  bolt: 0.89,
  lineman: 0.94,
  tada: 0.92,
  indrive: 0.82,
};

/**
 * Places each ride option at a distinct, randomized position snapped onto real continuous
 * road paths, and randomly assigns a subset of riders (~half) to cruise along the street
 * at realistic urban motorbike speeds (24–40 km/h).
 */
export function snapRidesToRoadPaths(
  rides: RideOption[],
  roadPaths: LatLngPoint[][],
  pickup: LocationItem,
  destination: LocationItem,
  preserveDefaultEtas = false
): RideOption[] {
  const placements = sampleDistinctRoadPlacements(
    roadPaths,
    { lat: pickup.lat, lng: pickup.lng },
    { lat: destination.lat, lng: destination.lng },
    rides.length
  );

  const pathLengths = roadPaths.map((p) => computeRoadPathMetrics(p).totalMeters);

  // Pick a randomized subset of eligible riders (roughly half, ensuring movement even with default 3 providers)
  const eligibleIndices = placements
    .map((pl, idx) =>
      pl.pathIndex !== null && (pathLengths[pl.pathIndex] ?? 0) >= 160 ? idx : -1
    )
    .filter((idx) => idx >= 0);

  const defaultProviderIds = new Set(['grab', 'bolt', 'maxim']);
  const eligibleDefault = eligibleIndices.filter((idx) =>
    defaultProviderIds.has(rides[idx]?.providerId)
  );
  const eligibleOther = eligibleIndices.filter(
    (idx) => !defaultProviderIds.has(rides[idx]?.providerId)
  );

  const movingSet = new Set<number>();
  const pickRandomFrom = (arr: number[]) =>
    arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  // Guarantee at least 1 moving rider in default group & 1 in other group when possible
  const firstDefault = pickRandomFrom(eligibleDefault);
  if (firstDefault !== null) movingSet.add(firstDefault);

  const firstOther = pickRandomFrom(eligibleOther);
  if (firstOther !== null) movingSet.add(firstOther);

  // Randomly add 1-2 more moving riders so 2-4 riders cruise while others stay parked
  const targetMovingCount = Math.min(
    eligibleIndices.length,
    Math.max(2, Math.floor(rides.length / 2) + (Math.random() < 0.35 ? 1 : 0))
  );
  const remaining = eligibleIndices
    .filter((idx) => !movingSet.has(idx))
    .sort(() => Math.random() - 0.5);

  for (const idx of remaining) {
    if (movingSet.size >= targetMovingCount) break;
    movingSet.add(idx);
  }

  const updated = rides.map((ride, idx) => {
    const placement = placements[idx];
    const pos = placement.point;
    const distMeters = distanceMeters({ lat: pickup.lat, lng: pickup.lng }, pos);
    const distKm = Math.max(0.2, Math.round((distMeters / 1000) * 10) / 10);
    const computedEta = Math.max(2, Math.min(14, Math.round(distKm * 5.2 + 1)));

    const isMoving = movingSet.has(idx) && placement.pathIndex !== null;
    // Realistic Bangkok motorbike speed: 6.8 - 11.2 m/s (~24 - 40 km/h)
    const speedMps = 6.8 + Math.random() * 4.4;
    const direction: 1 | -1 = Math.random() < 0.5 ? 1 : -1;

    return {
      ...ride,
      distanceKm: distKm,
      etaMinutes: preserveDefaultEtas ? ride.etaMinutes : computedEta,
      isRecommended: false,
      driverPin: {
        ...ride.driverPin,
        lat: pos.lat,
        lng: pos.lng,
        isMoving,
        roadMotion:
          isMoving && placement.pathIndex !== null
            ? {
                pathIndex: placement.pathIndex,
                startDistanceM: placement.distanceAlongPath,
                speedMps,
                direction,
              }
            : undefined,
      },
    };
  });

  // Mark fastest ETA ride as recommended
  let fastestIdx = 0;
  updated.forEach((r, i) => {
    if (r.etaMinutes < updated[fastestIdx].etaMinutes) {
      fastestIdx = i;
    }
  });
  if (updated[fastestIdx]) {
    updated[fastestIdx].isRecommended = true;
  }

  return updated;
}

/**
 * Updates estimated fares for all ride options based on resolved road distance
 * without altering their road-snapped rider coordinates.
 */
export function updateRideFaresForDistance(
  rides: RideOption[],
  roadKm: number
): RideOption[] {
  const safeKm = Math.max(0.3, Math.round(roadKm * 10) / 10);
  const fareScale = Math.max(0.35, safeKm / 6.4);
  return rides.map((ride) => {
    const fareMult = PROVIDER_FARE_MULTIPLIER[ride.providerId] ?? 0.9;
    const estimatedFare = Math.max(
      25,
      Math.round((95 * fareScale * fareMult) / 5) * 5
    );
    return {
      ...ride,
      estimatedFare,
    };
  });
}

export function buildRouteAndRides(
  pickup: LocationItem,
  destination: LocationItem,
  overrideRoadKm?: number
): { route: ActiveSearchRoute; rides: RideOption[] } {
  const straightMeters = Math.max(
    400,
    distanceMeters(
      { lat: pickup.lat, lng: pickup.lng },
      { lat: destination.lat, lng: destination.lng }
    )
  );
  const isDefaultPrdRoute =
    pickup.id === 'loc_01' && destination.id === 'loc_02' && overrideRoadKm === undefined;

  const roadKm = isDefaultPrdRoute
    ? DEFAULT_ROUTE.distanceKm
    : overrideRoadKm !== undefined
    ? Math.max(0.3, Math.round(overrideRoadKm * 10) / 10)
    : Math.round(((straightMeters / 1000) * 1.35) * 10) / 10;

  const routePolyline: [number, number][] = [
    [pickup.lat, pickup.lng],
    [destination.lat, destination.lng],
  ];

  const fareScale = Math.max(0.35, roadKm / 6.4);

  // Initial spread across 6 distinct randomized compass sectors before real-road snap completes
  const baseAngle = Math.random() * Math.PI * 2;
  const rides: RideOption[] = DEFAULT_NEARBY_RIDES.map((base, idx) => {
    const angle = baseAngle + (idx * Math.PI * 2) / DEFAULT_NEARBY_RIDES.length + (Math.random() - 0.5) * 0.35;
    const radiusMeters = 300 + Math.random() * 650;
    const pt = offsetPoint({ lat: pickup.lat, lng: pickup.lng }, radiusMeters, angle);
    const distKm = Math.max(0.3, Math.round((radiusMeters / 1000) * 10) / 10);
    const fareMult = PROVIDER_FARE_MULTIPLIER[base.providerId] ?? 0.9;
    const estimatedFare = isDefaultPrdRoute
      ? base.estimatedFare
      : Math.max(25, Math.round((95 * fareScale * fareMult) / 5) * 5);
    const etaMinutes = isDefaultPrdRoute
      ? base.etaMinutes
      : Math.max(2, Math.min(13, Math.round(distKm * 5.2 + 1)));

    return {
      ...base,
      etaMinutes,
      distanceKm: isDefaultPrdRoute ? base.distanceKm : distKm,
      estimatedFare,
      isRecommended: false,
      driverPin: {
        ...base.driverPin,
        lat: pt.lat,
        lng: pt.lng,
      },
    };
  });

  let fastestIdx = 0;
  rides.forEach((r, idx) => {
    if (r.etaMinutes < rides[fastestIdx].etaMinutes) {
      fastestIdx = idx;
    }
  });
  rides[fastestIdx].isRecommended = true;

  return {
    route: {
      pickup,
      destination,
      distanceKm: roadKm,
      routePolyline,
    },
    rides,
  };
}
