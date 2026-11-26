import React from 'react';
import { ArrowUpDown, Bike, Car, ChevronRight } from 'lucide-react';
import { SAVED_LOCATIONS } from '../data/mockData';
import {
  ActiveSearchRoute,
  Language,
  LocationItem,
  MockUser,
  PinMode,
  RideOption,
  SortMode,
  ThemeMode,
  VehicleType,
} from '../types';
import { t } from '../utils/i18n';
import { LatLngPoint } from '../utils/roadRiders';
import { TopNavbar } from './AppNavbar';
import { ProviderBadge } from './ProviderBadge';
import { RouteMapView } from './RouteMapView';

interface MapComparisonScreenProps {
  route: ActiveSearchRoute;
  rides: RideOption[];
  roadPaths: LatLngPoint[][];
  activeProviderCount: number;
  currentUser: MockUser | null;
  selectedRideId: string | null;
  sortMode: SortMode;
  vehicleType: VehicleType;
  pinMode: PinMode;
  isLoading: boolean;
  lang: Language;
  theme: ThemeMode;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onChangeSortMode: (mode: SortMode) => void;
  onChangeVehicleType: (type: VehicleType) => void;
  onChangePinMode: (mode: PinMode) => void;
  onPinLocation: (target: 'pickup' | 'destination', location: LocationItem) => void;
  onSelectQuickRoute: (pickup: LocationItem, destination: LocationItem) => void;
  onRouteMetricsResolved: (distanceKm: number, durationMinutes?: number) => void;
  onRoadPathsResolved: (paths: LatLngPoint[][]) => void;
  onReshuffleRiders: () => void;
  onOpenLocationPicker: (focusField: 'pickup' | 'destination') => void;
  onSwapLocations: () => void;
  onSelectRide: (ride: RideOption) => void;
  onHighlightRide: (ride: RideOption) => void;
  onOpenProviderSettings: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const MapComparisonScreen: React.FC<MapComparisonScreenProps> = ({
  route,
  rides,
  roadPaths,
  activeProviderCount,
  currentUser,
  selectedRideId,
  sortMode,
  vehicleType,
  pinMode,
  isLoading,
  lang,
  theme,
  onToggleLanguage,
  onToggleTheme,
  onChangeSortMode,
  onChangeVehicleType,
  onChangePinMode,
  onPinLocation,
  onSelectQuickRoute,
  onRouteMetricsResolved,
  onRoadPathsResolved,
  onReshuffleRiders,
  onOpenLocationPicker,
  onSwapLocations,
  onSelectRide,
  onHighlightRide,
  onOpenProviderSettings,
  onOpenLogin,
  onLogout,
}) => {
  const highlightedId = selectedRideId ?? rides[0]?.id ?? null;
  const strings = t(lang);

  const quickRoutePresets = [
    {
      label:
        lang === 'th'
          ? 'เทศบาลเมืองบางกรวย → มจพ. พระนครเหนือ'
          : 'Bang Kruai Municipality → KMUTNB',
      pickup: SAVED_LOCATIONS[0],
      destination: SAVED_LOCATIONS[1],
    },
    {
      label:
        lang === 'th'
          ? 'มจพ. พระนครเหนือ → MRT บางซื่อ'
          : 'KMUTNB → MRT Bang Sue',
      pickup: SAVED_LOCATIONS[1],
      destination: SAVED_LOCATIONS[2],
    },
    {
      label:
        lang === 'th'
          ? 'เทศบาลเมืองบางกรวย → เซ็นทรัล ลาดพร้าว'
          : 'Bang Kruai Municipality → Central Ladprao',
      pickup: SAVED_LOCATIONS[0],
      destination: SAVED_LOCATIONS[3],
    },
  ];

  return (
    <div className="min-h-[100dvh] sm:min-h-[820px] flex flex-col bg-white dark:bg-[#111827] transition-colors">
      {/* Top Navbar with Brand Icon, Search, Settings & Navigation Drawer */}
      <TopNavbar
        title={strings.selectPickupAndDest}
        subtitle={strings.compareProviders(activeProviderCount)}
        activeProviderCount={activeProviderCount}
        currentUser={currentUser}
        quickRoutes={quickRoutePresets}
        lang={lang}
        theme={theme}
        onToggleLanguage={onToggleLanguage}
        onToggleTheme={onToggleTheme}
        onOpenProviderSettings={onOpenProviderSettings}
        onOpenLocationPicker={onOpenLocationPicker}
        onStartPinMode={(mode) => onChangePinMode(mode)}
        onSelectQuickRoute={onSelectQuickRoute}
        onOpenLogin={onOpenLogin}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-5 pt-3.5 pb-5 flex flex-col gap-3.5">
        {/* Route Input Card (Warm Cream / Dark Warm Surface) */}
        <section
          aria-label={strings.yourRoute}
          className="relative bg-[#FFF5EC] dark:bg-[#1D1915] rounded-[14px] p-1.5 border border-[#FF6B00]/12 dark:border-[#FF6B00]/25 transition-colors"
        >
          <div className="flex items-center">
            <div className="flex-1 min-w-0">
              {/* Pickup Row */}
              <button
                type="button"
                onClick={() => onOpenLocationPicker('pickup')}
                className="w-full min-h-[44px] px-3 py-2 flex items-center gap-3 rounded-[10px] hover:bg-white/60 dark:hover:bg-white/5 active:bg-white/80 dark:active:bg-white/10 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
              >
                <span className="relative flex flex-col items-center justify-center shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] ring-3 ring-[#FF6B00]/20" />
                </span>
                <span className="text-[14px] font-medium text-[#111827] dark:text-[#F3F4F6] truncate">
                  <span className="text-[#FF6B00] font-semibold mr-1">{strings.pickupLabel}</span>
                  {route.pickup.name}
                </span>
              </button>

              {/* Hairline Divider with connector dot line */}
              <div className="relative mx-3 border-t border-[#FF6B00]/12 dark:border-white/10">
                <span
                  aria-hidden="true"
                  className="absolute left-[4px] -top-[9px] w-[2px] h-[18px] border-l-[1.5px] border-dashed border-[#D1A98A] dark:border-gray-600"
                />
              </div>

              {/* Destination Row */}
              <button
                type="button"
                onClick={() => onOpenLocationPicker('destination')}
                className="w-full min-h-[44px] px-3 py-2 flex items-center gap-3 rounded-[10px] hover:bg-white/60 dark:hover:bg-white/5 active:bg-white/80 dark:active:bg-white/10 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#111827] dark:bg-[#E2E8F0] ring-3 ring-[#111827]/12 dark:ring-white/20 shrink-0" />
                <span className="text-[14px] font-medium text-[#111827] dark:text-[#F3F4F6] truncate">
                  <span className="text-[#4B5563] dark:text-[#9CA3AF] font-semibold mr-1">
                    {strings.destLabel}
                  </span>
                  {route.destination.name}
                </span>
              </button>
            </div>

            {/* Quick Swap Locations Button */}
            <button
              type="button"
              onClick={onSwapLocations}
              className="w-11 h-11 mr-1 rounded-xl bg-white dark:bg-[#1F2937] hover:bg-[#FFF9F4] dark:hover:bg-[#283548] text-[#FF6B00] border border-[#FF6B00]/15 dark:border-white/10 flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
              aria-label={strings.swapLocations}
              title={strings.swapLocations}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Interactive Google Maps Viewport with Pinning */}
        <section aria-label={strings.brandName}>
          <RouteMapView
            route={route}
            rides={rides}
            roadPaths={roadPaths}
            selectedRideId={highlightedId}
            isLoading={isLoading}
            pinMode={pinMode}
            vehicleType={vehicleType}
            lang={lang}
            theme={theme}
            onChangePinMode={onChangePinMode}
            onPinLocation={onPinLocation}
            onRouteMetricsResolved={onRouteMetricsResolved}
            onRoadPathsResolved={onRoadPathsResolved}
            onReshuffleRiders={onReshuffleRiders}
            onSelectRidePin={(ride) => onHighlightRide(ride)}
          />
          <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] mt-2 text-center leading-relaxed">
            {strings.tapToPinHelp}
          </p>
        </section>

        {/* Ride Comparison Section */}
        <section aria-label={strings.compareNearbyRides} className="pt-1 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-display text-[17px] font-bold text-[#111827] dark:text-[#F9FAFB]">
              {strings.compareNearbyRides}
            </h2>

            {/* Segmented Sort Control */}
            <div
              className="inline-flex items-center p-0.5 bg-[#F3F4F6] dark:bg-[#1F2937] rounded-lg shrink-0 border border-black/5 dark:border-white/10"
              role="tablist"
              aria-label={strings.fastest}
            >
              <button
                type="button"
                role="tab"
                aria-selected={sortMode === 'fastest'}
                onClick={() => onChangeSortMode('fastest')}
                className={`px-2.5 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
                  sortMode === 'fastest'
                    ? 'bg-white dark:bg-[#374151] text-[#FF6B00] dark:text-[#FF8A33] shadow-xs font-semibold'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                {strings.fastest}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sortMode === 'cheapest'}
                onClick={() => onChangeSortMode('cheapest')}
                className={`px-2.5 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
                  sortMode === 'cheapest'
                    ? 'bg-white dark:bg-[#374151] text-[#FF6B00] dark:text-[#FF8A33] shadow-xs font-semibold'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                {strings.cheapest}
              </button>
            </div>
          </div>

          {/* Vehicle Type Segmented Tabs: Motorbike / Car */}
          <div
            className="grid grid-cols-2 p-1 bg-[#F3F4F6] dark:bg-[#1F2937] rounded-xl border border-black/5 dark:border-white/10 mb-3 gap-1"
            role="tablist"
            aria-label={strings.vehicleTypeLabel}
          >
            <button
              type="button"
              role="tab"
              aria-selected={vehicleType === 'motorbike'}
              onClick={() => onChangeVehicleType('motorbike')}
              className={`min-h-[38px] px-3 py-1.5 rounded-[9px] text-[13px] font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
                vehicleType === 'motorbike'
                  ? 'bg-white dark:bg-[#374151] text-[#FF6B00] dark:text-[#FF8A33] shadow-xs font-semibold'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4 shrink-0" />
              <span>{strings.motorbike}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={vehicleType === 'car'}
              onClick={() => onChangeVehicleType('car')}
              className={`min-h-[38px] px-3 py-1.5 rounded-[9px] text-[13px] font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
                vehicleType === 'car'
                  ? 'bg-white dark:bg-[#374151] text-[#FF6B00] dark:text-[#FF8A33] shadow-xs font-semibold'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              <Car className="w-4 h-4 shrink-0" />
              <span>{strings.car}</span>
            </button>
          </div>

          {/* Loading State: 3 Shimmer Skeleton Cards */}
          {isLoading ? (
            <div className="flex flex-col gap-2.5" aria-busy="true" aria-label={strings.searchingNearby}>
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="w-full h-[74px] rounded-[12px] px-4 py-3.5 bg-[#F5F5F7] dark:bg-[#1F2937] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full shimmer-bg shrink-0" />
                    <div className="flex flex-col gap-2">
                      <div className="w-28 h-4 rounded-md shimmer-bg" />
                      <div className="w-20 h-3 rounded-md shimmer-bg" />
                    </div>
                  </div>
                  <div className="w-14 h-6 rounded-md shimmer-bg" />
                </div>
              ))}
            </div>
          ) : rides.length === 0 ? (
            <div className="rounded-[14px] bg-[#FFF5EC] dark:bg-[#1E1B18] p-5 text-center border border-[#FF6B00]/15">
              <p className="text-[14px] font-medium text-[#111827] dark:text-white">
                {strings.noActiveProviders}
              </p>
              <button
                type="button"
                onClick={onOpenProviderSettings}
                className="mt-3 px-4 py-2 rounded-full bg-[#FF6B00] text-white text-[13px] font-semibold cursor-pointer shadow-sm hover:bg-[#EA6200]"
              >
                {strings.selectProvidersBtn}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {rides.map((ride, index) => {
                const isActive = highlightedId === ride.id;
                const isFirstHighlight = index === 0;
                const highlightCard = isActive || (selectedRideId === null && isFirstHighlight);

                return (
                  <button
                    key={ride.id}
                    type="button"
                    onClick={() => onSelectRide(ride)}
                    className={`w-full px-4 py-3.5 rounded-[12px] flex items-center justify-between gap-3 text-left transition-all duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-1 cursor-pointer ${
                      highlightCard
                        ? 'bg-[#FFF8F1] dark:bg-[#251A12] border-[1.5px] border-[#FF6B00]'
                        : 'bg-[#F5F5F7] dark:bg-[#182030] hover:bg-[#EFEFF2] dark:hover:bg-[#20293D] border-[1.5px] border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProviderBadge
                        shortCode={ride.driverPin.shortCode}
                        badgeColor={ride.driverPin.badgeColor}
                        name={ride.providerName}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-semibold text-[#111827] dark:text-[#F9FAFB] truncate">
                            {ride.serviceName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 tabular-nums">
                          <span className={highlightCard ? 'text-[#C24E00] dark:text-[#FFA654] font-medium' : ''}>
                            {strings.waitMinutes(ride.etaMinutes)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{strings.distanceAway(ride.distanceKm)}</span>
                          {index === 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#FF6B00] dark:text-[#FF8A33] font-medium">
                                {sortMode === 'fastest' ? strings.fastest : strings.cheapest}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-display text-[22px] font-extrabold text-[#111827] dark:text-[#F9FAFB] tabular-nums leading-none">
                        ฿{ride.estimatedFare}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ${highlightCard ? 'text-[#FF6B00]' : 'text-[#9CA3AF]'}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
