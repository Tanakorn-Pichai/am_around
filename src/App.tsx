import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AnimatePresence, motion } from 'motion/react';
import { HandoffConfirmationScreen } from './components/HandoffConfirmationScreen';
import { LocationPickerModal } from './components/LocationPickerModal';
import { LoginScreen } from './components/LoginScreen';
import { MapComparisonScreen } from './components/MapComparisonScreen';
import { ProviderSelectionScreen } from './components/ProviderSelectionScreen';
import {
  buildRouteAndRides,
  convertRidesToVehicleType,
  DEFAULT_NEARBY_RIDES,
  DEFAULT_ROUTE,
  INITIAL_PROVIDERS,
  SAVED_LOCATIONS,
  snapRidesToRoadPaths,
  updateRideFaresForDistance,
} from './data/mockData';
import {
  ActiveSearchRoute,
  AppScreen,
  Language,
  LocationItem,
  MockUser,
  PinMode,
  Provider,
  ProviderId,
  RideOption,
  SortMode,
  ThemeMode,
  VehicleType,
} from './types';
import { getGoogleMapsApiKey } from './utils/mapsQuota';
import { LatLngPoint } from './utils/roadRiders';

const STORAGE_KEY_PROVIDERS = 'am_around_selected_providers_v1';
const STORAGE_KEY_MOCK_USER = 'am_around_mock_user_v1';
const STORAGE_KEY_THEME = 'am_around_theme_v1';
const STORAGE_KEY_LANG = 'am_around_lang_v1';
const MAPS_LIBRARIES: string[] = ['marker', 'places', 'routes'];

function loadInitialTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

function loadInitialLang(): Language {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY_LANG);
    if (saved === 'th' || saved === 'en') return saved;
    return 'th';
  } catch {
    return 'th';
  }
}

function loadInitialMockUser(): MockUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_MOCK_USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MockUser>;
    if (
      parsed &&
      typeof parsed.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.avatarInitials === 'string' &&
      typeof parsed.avatarBg === 'string' &&
      (parsed.provider === 'google' ||
        parsed.provider === 'facebook' ||
        parsed.provider === 'email')
    ) {
      return parsed as MockUser;
    }
    return null;
  } catch {
    return null;
  }
}

function loadInitialProviders(): Provider[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PROVIDERS);
    if (!raw) return INITIAL_PROVIDERS;
    const savedIds = JSON.parse(raw) as ProviderId[];
    if (!Array.isArray(savedIds) || savedIds.length === 0) return INITIAL_PROVIDERS;
    return INITIAL_PROVIDERS.map((p) => ({
      ...p,
      isSelected: savedIds.includes(p.id),
    }));
  } catch {
    return INITIAL_PROVIDERS;
  }
}

export default function App() {
  const googleMapsApiKey = useMemo(() => getGoogleMapsApiKey(), []);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const [theme, setTheme] = useState<ThemeMode>(loadInitialTheme);
  const [lang, setLang] = useState<Language>(loadInitialLang);
  // Keep APIProvider's language immutable for the page session to prevent Google Maps JS API reload warnings
  const initialMapsLanguageRef = useRef<Language>(lang);

  const [currentUser, setCurrentUser] = useState<MockUser | null>(loadInitialMockUser);
  const [screen, setScreen] = useState<AppScreen>(() =>
    loadInitialMockUser() ? 'providers' : 'login'
  );
  const [returnScreenAfterLogin, setReturnScreenAfterLogin] = useState<AppScreen>('providers');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [providers, setProviders] = useState<Provider[]>(loadInitialProviders);

  const [activeRoute, setActiveRoute] = useState<ActiveSearchRoute>(DEFAULT_ROUTE);
  const [allRides, setAllRides] = useState<RideOption[]>(DEFAULT_NEARBY_RIDES);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [handoffRide, setHandoffRide] = useState<RideOption | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('fastest');
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorbike');
  const [pinMode, setPinMode] = useState<PinMode>('view');
  const [isDiscovering, setIsDiscovering] = useState(false);

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [locationFocusField, setLocationFocusField] = useState<'pickup' | 'destination'>('pickup');

  // Synchronize HTML root class and local storage for Dark Mode
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // Ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Synchronize local storage for Language
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {
      // Ignore
    }
  }, [lang]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleToggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'th' ? 'en' : 'th'));
  }, []);

  const [roadPaths, setRoadPaths] = useState<LatLngPoint[][]>([]);
  const discoveryTimerRef = useRef<number | null>(null);
  const roadPathsRef = useRef<LatLngPoint[][]>([]);
  const activeRouteRef = useRef<ActiveSearchRoute>(activeRoute);
  activeRouteRef.current = activeRoute;
  const vehicleTypeRef = useRef<VehicleType>(vehicleType);
  vehicleTypeRef.current = vehicleType;

  // Listen to global Tier 1 & Tier 2 Google Maps Platform quota events
  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const triggerDiscoveryRefresh = useCallback(() => {
    if (discoveryTimerRef.current) {
      window.clearTimeout(discoveryTimerRef.current);
    }
    setIsDiscovering(true);
    discoveryTimerRef.current = window.setTimeout(() => {
      setIsDiscovering(false);
    }, 800);
  }, []);

  useEffect(() => {
    return () => {
      if (discoveryTimerRef.current) {
        window.clearTimeout(discoveryTimerRef.current);
      }
    };
  }, []);

  // Persist selected provider IDs
  useEffect(() => {
    try {
      const selectedIds = providers.filter((p) => p.isSelected).map((p) => p.id);
      if (selectedIds.length > 0) {
        window.localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(selectedIds));
      }
    } catch {
      // Ignore storage errors
    }
  }, [providers]);

  const activeProviderIds = useMemo(
    () => new Set(providers.filter((p) => p.isSelected).map((p) => p.id)),
    [providers]
  );

  const visibleRides = useMemo(() => {
    const filtered = allRides.filter((ride) => activeProviderIds.has(ride.providerId));
    return [...filtered].sort((a, b) => {
      if (sortMode === 'cheapest') {
        if (a.estimatedFare !== b.estimatedFare) return a.estimatedFare - b.estimatedFare;
        return a.etaMinutes - b.etaMinutes;
      }
      if (a.etaMinutes !== b.etaMinutes) return a.etaMinutes - b.etaMinutes;
      return a.estimatedFare - b.estimatedFare;
    });
  }, [allRides, activeProviderIds, sortMode]);

  const handleLoginSuccess = (user: MockUser) => {
    setCurrentUser(user);
    try {
      window.localStorage.setItem(STORAGE_KEY_MOCK_USER, JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
    setScreen(hasCompletedOnboarding ? returnScreenAfterLogin : 'providers');
  };

  const handleSkipAsGuest = () => {
    setScreen(hasCompletedOnboarding ? returnScreenAfterLogin : 'providers');
  };

  const handleOpenLogin = () => {
    if (screen !== 'login') {
      setReturnScreenAfterLogin(screen);
    }
    setScreen('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRideId(null);
    setHandoffRide(null);
    setPinMode('view');
    try {
      window.localStorage.removeItem(STORAGE_KEY_MOCK_USER);
    } catch {
      // Ignore storage errors
    }
    setScreen('login');
  };

  const handleToggleProvider = (id: ProviderId) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p))
    );
  };

  const handleConfirmProviders = () => {
    if (activeProviderIds.size === 0) return;
    setHasCompletedOnboarding(true);
    setSelectedRideId(null);
    setScreen('map');
    triggerDiscoveryRefresh();
  };

  const handleOpenLocationPicker = (focusField: 'pickup' | 'destination') => {
    setPinMode('view');
    setLocationFocusField(focusField);
    setIsLocationPickerOpen(true);
  };

  const handleChangeVehicleType = useCallback(
    (nextType: VehicleType) => {
      if (nextType === vehicleTypeRef.current) return;
      vehicleTypeRef.current = nextType;
      setVehicleType(nextType);
      setSelectedRideId(null);
      const currentRoute = activeRouteRef.current;
      const isDefaultPrdRoute =
        currentRoute.pickup.id === 'loc_01' && currentRoute.destination.id === 'loc_02';
      setAllRides((prevRides) =>
        convertRidesToVehicleType(prevRides, currentRoute.distanceKm, nextType, isDefaultPrdRoute)
      );
      if (discoveryTimerRef.current) {
        window.clearTimeout(discoveryTimerRef.current);
      }
      setIsDiscovering(true);
      discoveryTimerRef.current = window.setTimeout(() => {
        setIsDiscovering(false);
      }, 360);
    },
    []
  );

  const handleConfirmRoute = useCallback(
    (pickup: LocationItem, destination: LocationItem) => {
      const { route, rides } = buildRouteAndRides(
        pickup,
        destination,
        undefined,
        vehicleTypeRef.current
      );
      roadPathsRef.current = [];
      setRoadPaths([]);
      setActiveRoute(route);
      setAllRides(rides);
      setSelectedRideId(null);
      setIsLocationPickerOpen(false);
      setPinMode('view');
      triggerDiscoveryRefresh();
    },
    [triggerDiscoveryRefresh]
  );

  const handlePinLocation = useCallback(
    (target: 'pickup' | 'destination', location: LocationItem) => {
      const prev = activeRouteRef.current;
      const nextPickup = target === 'pickup' ? location : prev.pickup;
      const nextDest = target === 'destination' ? location : prev.destination;
      const isPickupMoved =
        Math.abs(nextPickup.lat - prev.pickup.lat) > 0.00001 ||
        Math.abs(nextPickup.lng - prev.pickup.lng) > 0.00001;
      const isDestMoved =
        Math.abs(nextDest.lat - prev.destination.lat) > 0.00001 ||
        Math.abs(nextDest.lng - prev.destination.lng) > 0.00001;
      const isCoordinateChanged = isPickupMoved || isDestMoved;

      const { route, rides } = buildRouteAndRides(
        nextPickup,
        nextDest,
        isCoordinateChanged ? undefined : prev.distanceKm,
        vehicleTypeRef.current
      );

      setActiveRoute({
        ...route,
        durationMinutes: isCoordinateChanged ? undefined : prev.durationMinutes,
      });

      if (isPickupMoved) {
        roadPathsRef.current = [];
        setRoadPaths([]);
      }

      if (isCoordinateChanged) {
        setAllRides(rides);
        setSelectedRideId(null);
        triggerDiscoveryRefresh();
      }
    },
    [triggerDiscoveryRefresh]
  );

  const handleRouteMetricsResolved = useCallback(
    (distanceKm: number, durationMinutes?: number) => {
      const current = activeRouteRef.current;
      const isDefaultPrdRoute =
        current.pickup.id === 'loc_01' && current.destination.id === 'loc_02';

      setActiveRoute((prev) => ({
        ...prev,
        distanceKm: isDefaultPrdRoute
          ? prev.distanceKm
          : Math.max(0.3, Math.round(distanceKm * 10) / 10),
        durationMinutes,
      }));

      if (!isDefaultPrdRoute) {
        setAllRides((prevRides) => updateRideFaresForDistance(prevRides, distanceKm));
      }
    },
    []
  );

  const handleRoadPathsResolved = useCallback((paths: LatLngPoint[][]) => {
    roadPathsRef.current = paths;
    setRoadPaths(paths);
    const currentRoute = activeRouteRef.current;
    setAllRides((prevRides) =>
      snapRidesToRoadPaths(
        prevRides,
        paths,
        currentRoute.pickup,
        currentRoute.destination,
        false
      )
    );
  }, []);

  const handleReshuffleRiders = useCallback(() => {
    const currentRoute = activeRouteRef.current;
    setAllRides((prevRides) =>
      snapRidesToRoadPaths(
        prevRides,
        roadPathsRef.current,
        currentRoute.pickup,
        currentRoute.destination,
        false
      )
    );
  }, []);

  const handleSwapLocations = () => {
    const { route, rides } = buildRouteAndRides(
      activeRoute.destination,
      activeRoute.pickup,
      undefined,
      vehicleTypeRef.current
    );
    roadPathsRef.current = [];
    setRoadPaths([]);
    setActiveRoute(route);
    setAllRides(rides);
    setSelectedRideId(null);
    setPinMode('view');
    triggerDiscoveryRefresh();
  };

  const handleStartPinOnMap = (target: 'pickup' | 'destination') => {
    setIsLocationPickerOpen(false);
    setPinMode(target);
  };

  const handleSelectRide = (ride: RideOption) => {
    setSelectedRideId(ride.id);
    setHandoffRide(ride);
    setScreen('handoff');
  };

  const handleHighlightRide = (ride: RideOption) => {
    setSelectedRideId(ride.id);
  };

  const handoffProvider = useMemo(() => {
    if (!handoffRide) return providers[0];
    return providers.find((p) => p.id === handoffRide.providerId) ?? providers[0];
  }, [handoffRide, providers]);

  return (
    <APIProvider
      apiKey={googleMapsApiKey}
      language={initialMapsLanguageRef.current}
      region="TH"
      libraries={MAPS_LIBRARIES}
    >
      {/* Top-level non-intrusive Google Maps Platform Demo Quota Banner */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 dark:text-amber-100 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <div className="min-h-[100dvh] w-full bg-[#F4F1ED] dark:bg-[#0B0F19] sm:py-6 sm:px-4 flex justify-center items-start transition-colors">
        {/* Mobile-First Portrait App Shell */}
        <div className="w-full max-w-[440px] min-h-[100dvh] sm:min-h-[820px] bg-white dark:bg-[#111827] sm:rounded-[30px] sm:shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:border sm:border-black/5 dark:sm:border-white/10 overflow-hidden relative transition-colors">
          <AnimatePresence mode="wait" initial={false}>
            {screen === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <LoginScreen
                  lang={lang}
                  theme={theme}
                  onToggleLanguage={handleToggleLanguage}
                  onToggleTheme={handleToggleTheme}
                  onLoginSuccess={handleLoginSuccess}
                  onSkipAsGuest={handleSkipAsGuest}
                  canGoBack={hasCompletedOnboarding}
                  onBack={() => setScreen(returnScreenAfterLogin)}
                />
              </motion.div>
            )}

            {screen === 'providers' && (
              <motion.div
                key="providers"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProviderSelectionScreen
                  providers={providers}
                  currentUser={currentUser}
                  lang={lang}
                  theme={theme}
                  onToggleLanguage={handleToggleLanguage}
                  onToggleTheme={handleToggleTheme}
                  onToggleProvider={handleToggleProvider}
                  onConfirm={handleConfirmProviders}
                  onOpenLogin={handleOpenLogin}
                  onLogout={handleLogout}
                  isReturningEdit={hasCompletedOnboarding}
                  onCancelEdit={() => setScreen('map')}
                />
              </motion.div>
            )}

            {screen === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <MapComparisonScreen
                  route={activeRoute}
                  rides={visibleRides}
                  roadPaths={roadPaths}
                  activeProviderCount={activeProviderIds.size}
                  currentUser={currentUser}
                  selectedRideId={selectedRideId}
                  sortMode={sortMode}
                  vehicleType={vehicleType}
                  pinMode={pinMode}
                  isLoading={isDiscovering}
                  lang={lang}
                  theme={theme}
                  onToggleLanguage={handleToggleLanguage}
                  onToggleTheme={handleToggleTheme}
                  onChangeSortMode={setSortMode}
                  onChangeVehicleType={handleChangeVehicleType}
                  onChangePinMode={setPinMode}
                  onPinLocation={handlePinLocation}
                  onSelectQuickRoute={handleConfirmRoute}
                  onRouteMetricsResolved={handleRouteMetricsResolved}
                  onRoadPathsResolved={handleRoadPathsResolved}
                  onReshuffleRiders={handleReshuffleRiders}
                  onOpenLocationPicker={handleOpenLocationPicker}
                  onSwapLocations={handleSwapLocations}
                  onSelectRide={handleSelectRide}
                  onHighlightRide={handleHighlightRide}
                  onOpenProviderSettings={() => setScreen('providers')}
                  onOpenLogin={handleOpenLogin}
                  onLogout={handleLogout}
                />
              </motion.div>
            )}

            {screen === 'handoff' && handoffRide && (
              <motion.div
                key="handoff"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <HandoffConfirmationScreen
                  route={activeRoute}
                  ride={handoffRide}
                  provider={handoffProvider}
                  lang={lang}
                  theme={theme}
                  onBack={() => setScreen('map')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Screen 3: Location Search & Picker Modal */}
          <AnimatePresence>
            {isLocationPickerOpen && (
              <LocationPickerModal
                isOpen={isLocationPickerOpen}
                initialFocus={locationFocusField}
                currentPickup={activeRoute.pickup}
                currentDestination={activeRoute.destination}
                savedLocations={SAVED_LOCATIONS}
                lang={lang}
                theme={theme}
                onClose={() => setIsLocationPickerOpen(false)}
                onConfirmRoute={handleConfirmRoute}
                onStartPinOnMap={handleStartPinOnMap}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </APIProvider>
  );
}
