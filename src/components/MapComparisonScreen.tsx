import React from 'react';
import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { SAVED_LOCATIONS } from '../data/mockData';
import { ActiveSearchRoute, LocationItem, PinMode, RideOption, SortMode } from '../types';
import { LatLngPoint } from '../utils/roadRiders';
import { TopNavbar } from './AppNavbar';
import { ProviderBadge } from './ProviderBadge';
import { RouteMapView } from './RouteMapView';

interface MapComparisonScreenProps {
  route: ActiveSearchRoute;
  rides: RideOption[];
  roadPaths: LatLngPoint[][];
  activeProviderCount: number;
  selectedRideId: string | null;
  sortMode: SortMode;
  pinMode: PinMode;
  isLoading: boolean;
  onChangeSortMode: (mode: SortMode) => void;
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
}

const QUICK_ROUTE_PRESETS = [
  {
    label: 'เทศบาลเมืองบางกรวย → มจพ. พระนครเหนือ',
    pickup: SAVED_LOCATIONS[0],
    destination: SAVED_LOCATIONS[1],
  },
  {
    label: 'มจพ. พระนครเหนือ → MRT บางซื่อ',
    pickup: SAVED_LOCATIONS[1],
    destination: SAVED_LOCATIONS[2],
  },
  {
    label: 'เทศบาลเมืองบางกรวย → เซ็นทรัล ลาดพร้าว',
    pickup: SAVED_LOCATIONS[0],
    destination: SAVED_LOCATIONS[3],
  },
];

export const MapComparisonScreen: React.FC<MapComparisonScreenProps> = ({
  route,
  rides,
  roadPaths,
  activeProviderCount,
  selectedRideId,
  sortMode,
  pinMode,
  isLoading,
  onChangeSortMode,
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
}) => {
  const highlightedId = selectedRideId ?? rides[0]?.id ?? null;

  return (
    <div className="min-h-[100dvh] sm:min-h-[820px] flex flex-col bg-white">
      {/* Top Navbar with Brand Icon, Search & Navigation Drawer */}
      <TopNavbar
        title="เลือกจุดรับและปลายทาง"
        subtitle={`เปรียบเทียบ ${activeProviderCount} ผู้ให้บริการ`}
        activeProviderCount={activeProviderCount}
        quickRoutes={QUICK_ROUTE_PRESETS}
        onOpenProviderSettings={onOpenProviderSettings}
        onOpenLocationPicker={onOpenLocationPicker}
        onStartPinMode={(mode) => onChangePinMode(mode)}
        onSelectQuickRoute={onSelectQuickRoute}
      />

      {/* Main Content */}
      <main className="flex-1 px-5 pt-3.5 pb-5 flex flex-col gap-3.5">
        {/* Route Input Card (Warm Cream #FFF5EC) */}
        <section
          aria-label="เส้นทางการเดินทาง"
          className="relative bg-[#FFF5EC] rounded-[14px] p-1.5 border border-[#FF6B00]/12"
        >
          <div className="flex items-center">
            <div className="flex-1 min-w-0">
              {/* Pickup Row */}
              <button
                type="button"
                onClick={() => onOpenLocationPicker('pickup')}
                className="w-full min-h-[44px] px-3 py-2 flex items-center gap-3 rounded-[10px] hover:bg-white/60 active:bg-white/80 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <span className="relative flex flex-col items-center justify-center shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] ring-3 ring-[#FF6B00]/20" />
                </span>
                <span className="text-[14px] font-medium text-[#111827] truncate">
                  <span className="text-[#FF6B00] font-semibold mr-1">รับ:</span>
                  {route.pickup.name}
                </span>
              </button>

              {/* Hairline Divider with connector dot line */}
              <div className="relative mx-3 border-t border-[#FF6B00]/12">
                <span
                  aria-hidden="true"
                  className="absolute left-[4px] -top-[9px] w-[2px] h-[18px] border-l-[1.5px] border-dashed border-[#D1A98A]"
                />
              </div>

              {/* Destination Row */}
              <button
                type="button"
                onClick={() => onOpenLocationPicker('destination')}
                className="w-full min-h-[44px] px-3 py-2 flex items-center gap-3 rounded-[10px] hover:bg-white/60 active:bg-white/80 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#111827] ring-3 ring-[#111827]/12 shrink-0" />
                <span className="text-[14px] font-medium text-[#111827] truncate">
                  <span className="text-[#4B5563] font-semibold mr-1">ส่ง:</span>
                  {route.destination.name}
                </span>
              </button>
            </div>

            {/* Quick Swap Locations Button */}
            <button
              type="button"
              onClick={onSwapLocations}
              className="w-11 h-11 mr-1 rounded-xl bg-white hover:bg-[#FFF9F4] text-[#FF6B00] border border-[#FF6B00]/15 flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              aria-label="สลับจุดรับและปลายทาง"
              title="สลับจุดรับและปลายทาง"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Interactive Google Maps Viewport with Pinning */}
        <section aria-label="แผนที่เปรียบเทียบรถ">
          <RouteMapView
            route={route}
            rides={rides}
            roadPaths={roadPaths}
            selectedRideId={highlightedId}
            isLoading={isLoading}
            pinMode={pinMode}
            onChangePinMode={onChangePinMode}
            onPinLocation={onPinLocation}
            onRouteMetricsResolved={onRouteMetricsResolved}
            onRoadPathsResolved={onRoadPathsResolved}
            onReshuffleRiders={onReshuffleRiders}
            onSelectRidePin={(ride) => onHighlightRide(ride)}
          />
          <p className="text-[12px] text-[#6B7280] mt-2 text-center">
            แตะโหมดปักหมุดหรือลากหมุดบนแผนที่ได้ · ตำแหน่งรถเป็นข้อมูลจำลองเพื่อเปรียบเทียบ
          </p>
        </section>

        {/* Ride Comparison Section */}
        <section aria-label="เปรียบเทียบรถใกล้คุณ" className="pt-1 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-display text-[17px] font-bold text-[#111827]">
              เปรียบเทียบรถใกล้คุณ
            </h2>

            {/* Segmented Sort Control */}
            <div
              className="inline-flex items-center p-0.5 bg-[#F3F4F6] rounded-lg shrink-0"
              role="tablist"
              aria-label="เรียงลำดับรถ"
            >
              <button
                type="button"
                role="tab"
                aria-selected={sortMode === 'fastest'}
                onClick={() => onChangeSortMode('fastest')}
                className={`px-2.5 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
                  sortMode === 'fastest'
                    ? 'bg-white text-[#FF6B00] shadow-xs font-semibold'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                ถึงไวสุด
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sortMode === 'cheapest'}
                onClick={() => onChangeSortMode('cheapest')}
                className={`px-2.5 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
                  sortMode === 'cheapest'
                    ? 'bg-white text-[#FF6B00] shadow-xs font-semibold'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                ราคาถูกสุด
              </button>
            </div>
          </div>

          {/* Loading State: 3 Shimmer Skeleton Cards */}
          {isLoading ? (
            <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="กำลังโหลดรายการรถใกล้คุณ">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="w-full h-[74px] rounded-[12px] px-4 py-3.5 bg-[#F5F5F7] flex items-center justify-between"
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
            <div className="rounded-[12px] bg-[#FFF5EC] p-5 text-center">
              <p className="text-[14px] font-medium text-[#111827]">
                ยังไม่มีผู้ให้บริการที่เปิดใช้งาน
              </p>
              <button
                type="button"
                onClick={onOpenProviderSettings}
                className="mt-3 px-4 py-2 rounded-full bg-[#FF6B00] text-white text-[13px] font-semibold"
              >
                เลือกผู้ให้บริการ
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
                    className={`w-full px-4 py-3.5 rounded-[12px] flex items-center justify-between gap-3 text-left transition-all duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-1 ${
                      highlightCard
                        ? 'bg-[#FFF8F1] border-[1.5px] border-[#FF6B00]'
                        : 'bg-[#F5F5F7] hover:bg-[#EFEFF2] border-[1.5px] border-transparent'
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
                          <span className="text-[15px] font-semibold text-[#111827] truncate">
                            {ride.serviceName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280] mt-0.5 tabular-nums">
                          <span className={highlightCard ? 'text-[#C24E00] font-medium' : ''}>
                            รอ ~{ride.etaMinutes} นาที
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>ห่าง {ride.distanceKm.toFixed(1)} กม.</span>
                          {index === 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#FF6B00] font-medium">
                                {sortMode === 'fastest' ? 'ไวสุด' : 'ถูกสุด'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-display text-[22px] font-extrabold text-[#111827] tabular-nums leading-none">
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
