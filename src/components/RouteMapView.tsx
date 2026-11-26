import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AdvancedMarker,
  Map as GoogleMap,
  MapMouseEvent,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Crosshair, LocateFixed, MapPin, Maximize2, Minimize2, Minus, Plus, RefreshCw } from 'lucide-react';
import { ActiveSearchRoute, Language, LocationItem, PinMode, RideOption, ThemeMode, VehicleType } from '../types';
import { computeEtaMinutes } from '../data/mockData';
import { t } from '../utils/i18n';
import { checkAndNotifyMapsQuotaError } from '../utils/mapsQuota';
import {
  buildSurroundingRoadWaypoints,
  computeRoadPathMetrics,
  distanceMeters,
  extractRoadPointsFromRoute,
  LatLngPoint,
  samplePointAtDistance,
} from '../utils/roadRiders';

interface RouteMapViewProps {
  route: ActiveSearchRoute;
  rides: RideOption[];
  roadPaths: LatLngPoint[][];
  selectedRideId: string | null;
  isLoading: boolean;
  pinMode: PinMode;
  vehicleType: VehicleType;
  lang: Language;
  theme: ThemeMode;
  onChangePinMode: (mode: PinMode) => void;
  onPinLocation: (target: 'pickup' | 'destination', location: LocationItem) => void;
  onRouteMetricsResolved: (distanceKm: number, durationMinutes?: number) => void;
  onRoadPathsResolved: (paths: LatLngPoint[][]) => void;
  onReshuffleRiders: () => void;
  onSelectRidePin: (ride: RideOption) => void;
}

interface RouteOverlayProps {
  pickup: LocationItem;
  destination: LocationItem;
  vehicleType: VehicleType;
  onRouteMetricsResolved: (distanceKm: number, durationMinutes?: number) => void;
  onRoadPathsResolved: (paths: LatLngPoint[][]) => void;
}

/**
 * Computes and renders the real road route using the modern Maps JS SDK Routes API
 * (`google.maps.routes.Route.computeRoutes`), strictly avoiding legacy DirectionsService.
 * Doc reference: https://developers.google.com/maps/documentation/javascript/routes?utm_campaign=gmp_mcp_codeassist_v1_aistudio
 */
const RouteOverlay: React.FC<RouteOverlayProps> = ({
  pickup,
  destination,
  vehicleType,
  onRouteMetricsResolved,
  onRoadPathsResolved,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const lastReportedKeyRef = useRef<string>('');
  const lastRoadPoolKeyRef = useRef<string>('');
  const surroundingCacheRef = useRef<{ key: string; points: LatLngPoint[] } | null>(null);

  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
  }, []);

  useEffect(() => {
    if (!map) return;

    let cancelled = false;
    clearPolylines();

    const origin = { lat: pickup.lat, lng: pickup.lng };
    const dest = { lat: destination.lat, lng: destination.lng };
    const routeKey = `${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}->${dest.lat.toFixed(5)},${dest.lng.toFixed(5)}`;
    const metricsKey = `${routeKey}|${vehicleType}`;

    const drawFallbackLine = () => {
      if (cancelled || !map) return;
      const halo = new google.maps.Polyline({
        path: [origin, dest],
        geodesic: true,
        strokeColor: '#FFFFFF',
        strokeOpacity: 0.9,
        strokeWeight: 7,
        zIndex: 1,
        map,
      });
      const main = new google.maps.Polyline({
        path: [origin, dest],
        geodesic: true,
        strokeColor: '#FF6B00',
        strokeOpacity: 0.95,
        strokeWeight: 4,
        zIndex: 2,
        map,
      });
      polylinesRef.current = [halo, main];

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(dest);
      map.fitBounds(bounds, { top: 52, right: 44, bottom: 44, left: 44 });
    };

    if (!routesLib || !routesLib.Route) {
      drawFallbackLine();
      return () => {
        cancelled = true;
        clearPolylines();
      };
    }

    const routeClass = routesLib.Route as unknown as {
      computeRoutes: (req: Record<string, unknown>) => Promise<{
        routes?: Array<{
          distanceMeters?: number;
          durationMillis?: number;
          viewport?: google.maps.LatLngBounds;
          path?: Array<{ lat: number | (() => number); lng: number | (() => number) }>;
          createPolylines?: () => google.maps.Polyline[];
        }>;
      }>;
    };

    const computeWithMode = async (travelMode: 'TWO_WHEELER' | 'DRIVING') => {
      const request = {
        origin,
        destination: dest,
        travelMode,
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
        internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
      };
      return routeClass.computeRoutes(request);
    };

    (async () => {
      try {
        let res =
          vehicleType === 'car'
            ? await computeWithMode('DRIVING')
            : await computeWithMode('TWO_WHEELER').catch(() => null);
        if (!res?.routes || res.routes.length === 0) {
          res = await computeWithMode('DRIVING');
        }
        if (cancelled) return;

        const primaryRoute = res?.routes?.[0];
        if (!primaryRoute) {
          drawFallbackLine();
          return;
        }

        const created: google.maps.Polyline[] = [];
        if (typeof primaryRoute.createPolylines === 'function') {
          const haloPolylines = primaryRoute.createPolylines();
          haloPolylines.forEach((p) => {
            p.setOptions({
              strokeColor: '#FFFFFF',
              strokeOpacity: 0.92,
              strokeWeight: 8,
              zIndex: 1,
            });
            p.setMap(map);
            created.push(p);
          });

          const orangePolylines = primaryRoute.createPolylines();
          orangePolylines.forEach((p) => {
            p.setOptions({
              strokeColor: '#FF6B00',
              strokeOpacity: 1,
              strokeWeight: 4.8,
              zIndex: 2,
            });
            p.setMap(map);
            created.push(p);
          });
        } else if (primaryRoute.path && primaryRoute.path.length > 0) {
          const literalPath = extractRoadPointsFromRoute(primaryRoute);
          const halo = new google.maps.Polyline({
            path: literalPath,
            strokeColor: '#FFFFFF',
            strokeOpacity: 0.92,
            strokeWeight: 8,
            zIndex: 1,
            map,
          });
          const main = new google.maps.Polyline({
            path: literalPath,
            strokeColor: '#FF6B00',
            strokeOpacity: 1,
            strokeWeight: 4.8,
            zIndex: 2,
            map,
          });
          created.push(halo, main);
        } else {
          drawFallbackLine();
          return;
        }

        polylinesRef.current = created;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, { top: 52, right: 44, bottom: 44, left: 44 });
        }

        if (primaryRoute.distanceMeters && lastReportedKeyRef.current !== metricsKey) {
          lastReportedKeyRef.current = metricsKey;
          const distKm = Math.round((primaryRoute.distanceMeters / 1000) * 10) / 10;
          const durMin = primaryRoute.durationMillis
            ? Math.max(1, Math.round(primaryRoute.durationMillis / 60000))
            : undefined;
          onRouteMetricsResolved(distKm, durMin);
        }

        // Gather real road vertices around pickup (cached per pickup coordinate) to snap riders onto roads
        if (lastRoadPoolKeyRef.current !== routeKey) {
          lastRoadPoolKeyRef.current = routeKey;
          const mainRoadPoints = extractRoadPointsFromRoute(primaryRoute);
          const pickupKey = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}`;

          let surroundingPoints: LatLngPoint[] = [];
          if (surroundingCacheRef.current?.key === pickupKey) {
            surroundingPoints = surroundingCacheRef.current.points;
          } else {
            try {
              const waypoints = buildSurroundingRoadWaypoints(origin);
              const surroundingRes = await routeClass.computeRoutes({
                origin: waypoints[0],
                destination: waypoints[3],
                intermediates: [
                  { location: waypoints[1], via: true },
                  { location: waypoints[2], via: true },
                ],
                travelMode: 'DRIVING',
                fields: ['path'],
                internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
              });
              const surroundingRoute = surroundingRes?.routes?.[0];
              if (surroundingRoute) {
                surroundingPoints = extractRoadPointsFromRoute(surroundingRoute);
                if (surroundingPoints.length > 0) {
                  surroundingCacheRef.current = {
                    key: pickupKey,
                    points: surroundingPoints,
                  };
                }
              }
            } catch (surroundingErr) {
              checkAndNotifyMapsQuotaError(surroundingErr);
            }
          }

          if (!cancelled) {
            const continuousPaths: LatLngPoint[][] = [];
            if (surroundingPoints.length >= 2) continuousPaths.push(surroundingPoints);
            if (mainRoadPoints.length >= 2) continuousPaths.push(mainRoadPoints);
            if (continuousPaths.length > 0) {
              onRoadPathsResolved(continuousPaths);
            }
          }
        }
      } catch (err) {
        checkAndNotifyMapsQuotaError(err);
        drawFallbackLine();
      }
    })();

    return () => {
      cancelled = true;
      clearPolylines();
    };
  }, [
    map,
    routesLib,
    pickup.lat,
    pickup.lng,
    destination.lat,
    destination.lng,
    vehicleType,
    clearPolylines,
    onRouteMetricsResolved,
    onRoadPathsResolved,
  ]);

  return null;
};

interface MapInnerControlsProps {
  pickup: LocationItem;
  destination: LocationItem;
  lang: Language;
  theme: ThemeMode;
  onLocateUser: () => void;
  onReshuffleRiders: () => void;
  isLocating: boolean;
  isFullscreen: boolean;
}

const MapInnerControls: React.FC<MapInnerControlsProps> = ({
  pickup,
  destination,
  lang,
  theme: _theme,
  onLocateUser,
  onReshuffleRiders,
  isLocating,
  isFullscreen,
}) => {
  const map = useMap();
  const [isShuffling, setIsShuffling] = useState(false);
  const strings = t(lang);

  const handleZoomIn = () => {
    if (!map) return;
    const current = map.getZoom() ?? 14;
    map.setZoom(Math.min(20, current + 1));
  };

  const handleZoomOut = () => {
    if (!map) return;
    const current = map.getZoom() ?? 14;
    map.setZoom(Math.max(5, current - 1));
  };

  const handleFitRoute = () => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: pickup.lat, lng: pickup.lng });
    bounds.extend({ lat: destination.lat, lng: destination.lng });
    map.fitBounds(bounds, { top: 52, right: 44, bottom: 44, left: 44 });
  };

  const handleReshuffleClick = () => {
    setIsShuffling(true);
    onReshuffleRiders();
    window.setTimeout(() => setIsShuffling(false), 380);
  };

  return (
    <div
      className={`absolute ${
        isFullscreen ? 'bottom-7 right-4' : 'bottom-2.5 right-2.5'
      } z-10 flex flex-col gap-1.5`}
    >
      <button
        type="button"
        onClick={handleReshuffleClick}
        className="w-8 h-8 rounded-lg bg-white/95 dark:bg-[#1E293B]/95 hover:bg-white dark:hover:bg-[#334155] text-[#FF6B00] shadow-sm border border-black/10 dark:border-white/10 flex items-center justify-center active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
        aria-label={strings.reshuffleTooltip}
        title={strings.reshuffleTooltip}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
      </button>
      <button
        type="button"
        onClick={handleZoomIn}
        className="w-8 h-8 rounded-lg bg-white/95 dark:bg-[#1E293B]/95 hover:bg-white dark:hover:bg-[#334155] text-[#374151] dark:text-[#E2E8F0] shadow-sm border border-black/10 dark:border-white/10 flex items-center justify-center active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
        aria-label={strings.zoomIn}
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={handleZoomOut}
        className="w-8 h-8 rounded-lg bg-white/95 dark:bg-[#1E293B]/95 hover:bg-white dark:hover:bg-[#334155] text-[#374151] dark:text-[#E2E8F0] shadow-sm border border-black/10 dark:border-white/10 flex items-center justify-center active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
        aria-label={strings.zoomOut}
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={handleFitRoute}
        className="w-8 h-8 rounded-lg bg-white/95 dark:bg-[#1E293B]/95 hover:bg-white dark:hover:bg-[#334155] text-[#FF6B00] shadow-sm border border-black/10 dark:border-white/10 flex items-center justify-center active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
        aria-label={strings.fitRoute}
        title={strings.fitRoute}
      >
        <LocateFixed className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onLocateUser}
        disabled={isLocating}
        className="w-8 h-8 rounded-lg bg-white/95 dark:bg-[#1E293B]/95 hover:bg-white dark:hover:bg-[#334155] text-[#111827] dark:text-[#F3F4F6] shadow-sm border border-black/10 dark:border-white/10 flex items-center justify-center active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] disabled:opacity-50 cursor-pointer"
        aria-label={strings.currentGps}
        title={strings.currentGps}
      >
        <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-[#FF6B00]' : ''}`} />
      </button>
    </div>
  );
};

export const RouteMapView: React.FC<RouteMapViewProps> = ({
  route,
  rides,
  roadPaths,
  selectedRideId,
  isLoading,
  pinMode,
  vehicleType,
  lang,
  theme,
  onChangePinMode,
  onPinLocation,
  onRouteMetricsResolved,
  onRoadPathsResolved,
  onReshuffleRiders,
  onSelectRidePin,
}) => {
  const strings = t(lang);
  const placesLib = useMapsLibrary('places');
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveRiderState, setLiveRiderState] = useState<
    Record<string, { lat: number; lng: number; etaMinutes: number }>
  >({});

  // Lock background scroll & support Escape key when map is expanded to fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const pathMetricsList = useMemo(
    () => roadPaths.map((path) => computeRoadPathMetrics(path)),
    [roadPaths]
  );

  // Smoothly animate randomly chosen moving riders along real continuous road polylines
  // at realistic urban motorbike speeds (meters per second).
  useEffect(() => {
    setLiveRiderState({});
    if (isLoading || pathMetricsList.length === 0) return;

    interface ActiveMotion {
      id: string;
      pathIndex: number;
      distM: number;
      dir: 1 | -1;
      speedMps: number;
      lastPickupDistM: number;
    }

    const pickupPt: LatLngPoint = { lat: route.pickup.lat, lng: route.pickup.lng };
    const activeMotions: ActiveMotion[] = [];

    for (const ride of rides) {
      const motion = ride.driverPin.roadMotion;
      if (!ride.driverPin.isMoving || !motion) continue;
      const metrics = pathMetricsList[motion.pathIndex];
      if (!metrics || metrics.totalMeters < 50) continue;

      const startPt = samplePointAtDistance(metrics, motion.startDistanceM);
      activeMotions.push({
        id: ride.id,
        pathIndex: motion.pathIndex,
        distM: motion.startDistanceM,
        dir: motion.direction,
        speedMps: motion.speedMps,
        lastPickupDistM: distanceMeters(startPt, pickupPt),
      });
    }

    if (activeMotions.length === 0) return;

    let rafId = 0;
    let lastEmitTime = performance.now();

    // Emit initial positions immediately so moving indicators render on first frame
    const initialPositions: Record<
      string,
      { lat: number; lng: number; etaMinutes: number }
    > = {};
    for (const m of activeMotions) {
      const metrics = pathMetricsList[m.pathIndex];
      if (!metrics) continue;
      const pt = samplePointAtDistance(metrics, m.distM);
      const distKm = Math.max(0.2, m.lastPickupDistM / 1000);
      initialPositions[m.id] = {
        lat: pt.lat,
        lng: pt.lng,
        etaMinutes: computeEtaMinutes(distKm, vehicleType),
      };
    }
    setLiveRiderState(initialPositions);

    const tick = (now: number) => {
      // Throttle React state updates to ~20fps for silky real-road motion & low overhead
      if (now - lastEmitTime >= 50) {
        const stepSec = Math.min(0.3, Math.max(0, (now - lastEmitTime) / 1000));
        lastEmitTime = now;

        const nextPositions: Record<
          string,
          { lat: number; lng: number; etaMinutes: number }
        > = {};

        for (const m of activeMotions) {
          const metrics = pathMetricsList[m.pathIndex];
          if (!metrics || metrics.totalMeters <= 0) continue;

          m.distM += m.dir * m.speedMps * stepSec;

          if (m.distM >= metrics.totalMeters) {
            m.distM = metrics.totalMeters;
            m.dir = -1;
          } else if (m.distM <= 0) {
            m.distM = 0;
            m.dir = 1;
          }

          const pt = samplePointAtDistance(metrics, m.distM);
          const distToPickup = distanceMeters(pt, pickupPt);

          // Keep moving riders from overlapping right on top of the pickup badge
          if (distToPickup < 130 && distToPickup < m.lastPickupDistM) {
            m.dir = m.dir === 1 ? -1 : 1;
          }
          m.lastPickupDistM = distToPickup;

          const distKm = Math.max(0.2, distToPickup / 1000);
          const liveEta = computeEtaMinutes(distKm, vehicleType);

          nextPositions[m.id] = {
            lat: pt.lat,
            lng: pt.lng,
            etaMinutes: liveEta,
          };
        }

        setLiveRiderState(nextPositions);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [rides, pathMetricsList, isLoading, route.pickup.lat, route.pickup.lng, vehicleType]);

  /**
   * Resolves a dropped/dragged lat/lng into a human-readable Thai place name
   * using modern Places API (New) `Place.searchNearby` (zero legacy Geocoder, zero CORS).
   */
  const resolveAndCommitPin = useCallback(
    async (target: 'pickup' | 'destination', lat: number, lng: number) => {
      const coordShort = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const fallbackLabel = target === 'pickup' ? `หมุดจุดรับ (${coordShort})` : `หมุดปลายทาง (${coordShort})`;
      const fallbackShort = target === 'pickup' ? 'จุดรับที่ปัก' : 'ปลายทางที่ปัก';

      // Optimistically place the pin immediately for snappy UX
      const initialLoc: LocationItem = {
        id: `pin_${target}_${lat.toFixed(5)}_${lng.toFixed(5)}`,
        name: fallbackLabel,
        shortName: fallbackShort,
        district: `พิกัด ${coordShort}`,
        lat,
        lng,
        isPinned: true,
      };
      onPinLocation(target, initialLoc);

      if (!placesLib?.Place) return;

      setIsResolvingPin(true);
      try {
        const { places } = await placesLib.Place.searchNearby({
          fields: ['displayName', 'formattedAddress'],
          locationRestriction: {
            center: { lat, lng },
            radius: 120,
          },
          maxResultCount: 1,
        });

        const nearest = places?.[0];
        if (nearest?.displayName) {
          const cleanName = nearest.displayName;
          const shortName =
            cleanName.length > 14 ? `${cleanName.slice(0, 14)}…` : cleanName;
          onPinLocation(target, {
            id: `pin_${target}_${lat.toFixed(5)}_${lng.toFixed(5)}`,
            name: cleanName,
            shortName,
            district: nearest.formattedAddress || `พิกัด ${coordShort}`,
            lat,
            lng,
            isPinned: true,
          });
        }
      } catch (err) {
        checkAndNotifyMapsQuotaError(err);
      } finally {
        setIsResolvingPin(false);
      }
    },
    [placesLib, onPinLocation]
  );

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (pinMode === 'view') return;
      const latLng = event.detail?.latLng;
      if (!latLng) return;
      void resolveAndCommitPin(pinMode, latLng.lat, latLng.lng);
      onChangePinMode('view');
    },
    [pinMode, resolveAndCommitPin, onChangePinMode]
  );

  const handleMarkerDragEnd = useCallback(
    (target: 'pickup' | 'destination', event: google.maps.MapMouseEvent) => {
      const latLng = event.latLng;
      if (!latLng) return;
      void resolveAndCommitPin(target, latLng.lat(), latLng.lng());
    },
    [resolveAndCommitPin]
  );

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      void resolveAndCommitPin('pickup', 13.8051, 100.4728);
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        void resolveAndCommitPin('pickup', pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setIsLocating(false);
        // Fallback to Bang Kruai Municipality if browser geolocation is denied
        void resolveAndCommitPin('pickup', 13.8051, 100.4728);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, [resolveAndCommitPin]);

  return (
    <div className="flex flex-col gap-2">
      {/* Pin Mode Selector Bar */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="grid grid-cols-3 w-full p-1 bg-[#F3F4F6] dark:bg-[#1F2937] rounded-[12px] gap-1"
          role="tablist"
          aria-label={strings.dragOrViewMap}
        >
          <button
            type="button"
            role="tab"
            aria-selected={pinMode === 'view'}
            onClick={() => onChangePinMode('view')}
            className={`min-h-[36px] px-2 rounded-[9px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
              pinMode === 'view'
                ? 'bg-white dark:bg-[#374151] text-[#111827] dark:text-[#F9FAFB] shadow-xs font-semibold'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <span>{strings.dragOrViewMap}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={pinMode === 'pickup'}
            onClick={() => onChangePinMode(pinMode === 'pickup' ? 'view' : 'pickup')}
            className={`min-h-[36px] px-2 rounded-[9px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
              pinMode === 'pickup'
                ? 'bg-[#FF6B00] text-white shadow-xs font-semibold'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{strings.pinPickup}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={pinMode === 'destination'}
            onClick={() =>
              onChangePinMode(pinMode === 'destination' ? 'view' : 'destination')
            }
            className={`min-h-[36px] px-2 rounded-[9px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
              pinMode === 'destination'
                ? 'bg-[#111827] dark:bg-white text-white dark:text-[#111827] shadow-xs font-semibold'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{strings.pinDest}</span>
          </button>
        </div>
      </div>

      {/* Layout placeholder while map is promoted to fullscreen */}
      {isFullscreen && <div className="w-full h-[292px]" aria-hidden="true" />}

      {/* Real Google Maps Viewport (Explicit Height inline, Full Viewport when expanded) */}
      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 w-screen h-[100dvh] bg-[#ECE9E4] dark:bg-[#1A202C] overflow-hidden'
            : `relative w-full h-[292px] rounded-[16px] overflow-hidden border transition-colors ${
                pinMode === 'pickup'
                  ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/25'
                  : pinMode === 'destination'
                  ? 'border-[#111827] dark:border-white/50 ring-2 ring-[#111827]/20 dark:ring-white/20'
                  : 'border-[#E5E7EB] dark:border-white/10'
              } bg-[#ECE9E4] dark:bg-[#1A202C]`
        }
        role="region"
        aria-label={strings.brandName}
      >
        <GoogleMap
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: 13.812, lng: 100.493 }}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          colorScheme={theme === 'dark' ? 'DARK' : 'LIGHT'}
          gestureHandling="greedy"
          disableDefaultUI={true}
          clickableIcons={pinMode === 'view'}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onClick={handleMapClick}
        >
          {/* Real Road Route Polyline via Routes API */}
          <RouteOverlay
            pickup={route.pickup}
            destination={route.destination}
            vehicleType={vehicleType}
            onRouteMetricsResolved={onRouteMetricsResolved}
            onRoadPathsResolved={onRoadPathsResolved}
          />

          {/* Draggable Pickup Pin (Orange Dot + Radar Pulse while searching) */}
          <AdvancedMarker
            position={{ lat: route.pickup.lat, lng: route.pickup.lng }}
            draggable={true}
            onDragEnd={(e) => handleMarkerDragEnd('pickup', e)}
            zIndex={30}
            title={`${strings.pickupLocation}: ${route.pickup.name}`}
          >
            <div className="relative flex items-center justify-center cursor-grab active:cursor-grabbing">
              {isLoading && (
                <>
                  <span className="absolute w-10 h-10 rounded-full bg-[#FF6B00]/30 animate-ping" />
                  <span className="absolute w-7 h-7 rounded-full bg-[#FF6B00]/25" />
                </>
              )}
              <div className="relative flex flex-col items-center -translate-y-1">
                <div className="px-2 py-0.5 mb-1 rounded-md bg-[#FF6B00] text-white text-[10px] font-semibold shadow-sm whitespace-nowrap max-w-[116px] truncate">
                  {lang === 'th' ? 'รับ · ' : 'Pick · '}{route.pickup.shortName}
                </div>
                <div className="w-5 h-5 rounded-full bg-[#FF6B00] border-[3px] border-white shadow-md" />
              </div>
            </div>
          </AdvancedMarker>

          {/* Draggable Destination Pin (Dark Pin + Floating Tag) */}
          <AdvancedMarker
            position={{ lat: route.destination.lat, lng: route.destination.lng }}
            draggable={true}
            onDragEnd={(e) => handleMarkerDragEnd('destination', e)}
            zIndex={35}
            title={`${strings.destinationLocation}: ${route.destination.name}`}
          >
            <div className="relative flex flex-col items-center cursor-grab active:cursor-grabbing -translate-y-1">
              <div className="px-2.5 py-0.5 mb-1 rounded-full bg-[#111827] dark:bg-[#1E293B] text-white text-[11px] font-semibold shadow-md whitespace-nowrap max-w-[132px] truncate border border-transparent dark:border-white/10">
                {route.destination.shortName}
              </div>
              <div className="w-5 h-5 rounded-full bg-[#111827] dark:bg-[#E2E8F0] border-[3px] border-white dark:border-[#111827] shadow-md" />
            </div>
          </AdvancedMarker>

          {/* Nearby Provider Vehicle Pins (Snapped to Distinct Roads, Some Cruising Live) */}
          {!isLoading &&
            rides.map((ride) => {
              const isSelected = selectedRideId === ride.id;
              const live = liveRiderState[ride.id];
              const markerLat = live ? live.lat : ride.driverPin.lat;
              const markerLng = live ? live.lng : ride.driverPin.lng;
              const displayEta = live ? live.etaMinutes : ride.etaMinutes;
              const isMoving = Boolean(ride.driverPin.isMoving && live);

              return (
                <AdvancedMarker
                  key={ride.id}
                  position={{ lat: markerLat, lng: markerLng }}
                  onClick={() => onSelectRidePin(ride)}
                  zIndex={isSelected ? 26 : isMoving ? 19 : 16}
                  title={`${ride.serviceName} ${strings.waitMinutes(displayEta)}${
                    isMoving ? ` (${strings.movingOnRoad})` : ''
                  }`}
                >
                  <div className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105">
                    <div
                      className={`px-1.5 py-[1px] mb-0.5 rounded-full bg-white dark:bg-[#1E293B] text-[9.5px] font-semibold text-[#111827] dark:text-[#F3F4F6] shadow-xs tabular-nums border leading-tight flex items-center gap-1 ${
                        isSelected
                          ? 'border-[#FF6B00] text-[#FF6B00] dark:text-[#FF8A33]'
                          : 'border-black/10 dark:border-white/15'
                      }`}
                    >
                      {isMoving && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span>{displayEta} {strings.minuteShort}</span>
                    </div>
                    <div className="relative flex items-center justify-center">
                      {isMoving && (
                        <span
                          className="absolute w-7 h-7 rounded-full opacity-25 animate-ping"
                          style={{ backgroundColor: ride.driverPin.badgeColor }}
                          aria-hidden="true"
                        />
                      )}
                      <div
                        className={`relative rounded-full flex items-center justify-center font-display font-bold text-white border-2 border-white dark:border-[#1E293B] shadow-md transition-all ${
                          isSelected
                            ? 'w-7 h-7 text-[12px] ring-2 ring-[#FF6B00] ring-offset-1'
                            : 'w-6 h-6 text-[11px]'
                        }`}
                        style={{ backgroundColor: ride.driverPin.badgeColor }}
                      >
                        {ride.driverPin.shortCode}
                      </div>
                    </div>
                    <div
                      className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4.5px] -mt-[1px]"
                      style={{ borderTopColor: ride.driverPin.badgeColor }}
                    />
                  </div>
                </AdvancedMarker>
              );
            })}

          {/* Reshuffle / Zoom / Recenter / GPS Controls */}
          <MapInnerControls
            pickup={route.pickup}
            destination={route.destination}
            lang={lang}
            theme={theme}
            onLocateUser={handleLocateUser}
            onReshuffleRiders={onReshuffleRiders}
            isLocating={isLocating}
            isFullscreen={isFullscreen}
          />
        </GoogleMap>

        {/* Top-Left Status / Active Pinning Prompt */}
        <div
          className={`absolute ${
            isFullscreen ? 'top-4 left-4 right-28' : 'top-2.5 left-2.5 right-12'
          } z-10 pointer-events-none flex items-center gap-1.5`}
        >
          {pinMode !== 'view' ? (
            <div
              className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white shadow-md flex items-center gap-1.5 ${
                pinMode === 'pickup' ? 'bg-[#FF6B00]' : 'bg-[#111827] dark:bg-[#1F2937]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                {pinMode === 'pickup'
                  ? strings.tapMapToPinPickup
                  : strings.tapMapToPinDest}
              </span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-white/92 dark:bg-[#111827]/90 backdrop-blur-sm border border-black/8 dark:border-white/10 text-[11px] font-medium text-[#374151] dark:text-[#E5E7EB] tabular-nums shadow-xs">
              {isResolvingPin
                ? strings.resolvingLocation
                : isLoading
                ? strings.searchingNearby
                : `${strings.routeDistance(route.distanceKm)}${
                    route.durationMinutes ? ` · ${strings.routeDuration(route.durationMinutes)}` : ''
                  }`}
            </div>
          )}
        </div>

        {/* Top-Right Fullscreen Expand / Exit Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          className={`absolute z-10 flex items-center justify-center gap-1.5 shadow-sm border border-black/10 dark:border-white/10 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
            isFullscreen
              ? 'top-4 right-4 h-9 px-3 rounded-xl bg-white/95 dark:bg-[#1E293B]/95 hover:bg-white dark:hover:bg-[#334155] text-[#111827] dark:text-[#F9FAFB] text-[12px] font-semibold'
              : 'top-2.5 right-2.5 w-8 h-8 rounded-lg bg-white/95 dark:bg-[#1E293B]/95 hover:bg-white dark:hover:bg-[#334155] text-[#374151] dark:text-[#E2E8F0]'
          }`}
          aria-label={isFullscreen ? strings.exitFullscreen : strings.expandFullscreen}
          title={isFullscreen ? strings.exitFullscreen : strings.expandFullscreen}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>{strings.exitFullscreen}</span>
            </>
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Floating Pin Mode Selector inside Fullscreen Mode */}
        {isFullscreen && (
          <div className="absolute bottom-6 left-3 right-14 z-10 flex justify-center pointer-events-none">
            <div
              className="pointer-events-auto grid grid-cols-3 w-full max-w-[360px] p-1 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md rounded-[14px] gap-1 shadow-lg border border-black/10 dark:border-white/15"
              role="tablist"
              aria-label={strings.dragOrViewMap}
            >
              <button
                type="button"
                role="tab"
                aria-selected={pinMode === 'view'}
                onClick={() => onChangePinMode('view')}
                className={`min-h-[38px] px-2 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  pinMode === 'view'
                    ? 'bg-[#F3F4F6] dark:bg-[#374151] text-[#111827] dark:text-[#F9FAFB] shadow-xs font-semibold'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                <span>{strings.dragOrViewMap}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={pinMode === 'pickup'}
                onClick={() => onChangePinMode(pinMode === 'pickup' ? 'view' : 'pickup')}
                className={`min-h-[38px] px-2 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  pinMode === 'pickup'
                    ? 'bg-[#FF6B00] text-white shadow-xs font-semibold'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{strings.pinPickup}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={pinMode === 'destination'}
                onClick={() =>
                  onChangePinMode(pinMode === 'destination' ? 'view' : 'destination')
                }
                className={`min-h-[38px] px-2 rounded-[10px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  pinMode === 'destination'
                    ? 'bg-[#111827] dark:bg-white text-white dark:text-[#111827] shadow-xs font-semibold'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{strings.pinDest}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
