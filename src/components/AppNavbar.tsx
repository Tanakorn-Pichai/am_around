import React, { useState } from 'react';
import {
  ChevronRight,
  MapPin,
  Menu,
  Navigation,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LocationItem } from '../types';
import { AmAroundIcon } from './AmAroundLogo';

interface QuickRoutePreset {
  label: string;
  pickup: LocationItem;
  destination: LocationItem;
}

interface TopNavbarProps {
  title: string;
  subtitle: string;
  activeProviderCount: number;
  quickRoutes: QuickRoutePreset[];
  onOpenProviderSettings: () => void;
  onOpenLocationPicker: (focusField: 'pickup' | 'destination') => void;
  onStartPinMode: (mode: 'pickup' | 'destination') => void;
  onSelectQuickRoute: (pickup: LocationItem, destination: LocationItem) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  title,
  subtitle,
  activeProviderCount,
  quickRoutes,
  onOpenProviderSettings,
  onOpenLocationPicker,
  onStartPinMode,
  onSelectQuickRoute,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="แถบนำทางหลัก"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EFEAE4] shadow-[0_2px_10px_rgba(17,24,39,0.04)] px-4 h-[64px] flex items-center justify-between gap-2"
      >
        {/* Left: Brand Icon + Page Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenProviderSettings}
            className="w-11 h-11 -ml-1 rounded-[12px] flex items-center justify-center shrink-0 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
            aria-label="am around ตั้งค่าผู้ให้บริการ"
            title={`เลือกผู้ให้บริการ (${activeProviderCount} แอป)`}
          >
            <AmAroundIcon size={40} className="rounded-[10px] shadow-xs" />
          </button>

          <div className="min-w-0">
            <h1 className="font-display text-[18px] font-bold text-[#111827] leading-tight truncate">
              {title}
            </h1>
            <p className="text-[12px] text-[#6B7280] leading-tight mt-0.5 tabular-nums truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Functional Navbar Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
              menuOpen
                ? 'bg-[#FF6B00] text-white'
                : 'bg-[#FFF5EC] text-[#FF6B00] hover:bg-[#FFEAD6]'
            }`}
            aria-label={menuOpen ? 'ปิดเมนูนำทาง' : 'เปิดเมนูนำทาง'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Slide-down Navbar Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px]"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="menu"
              aria-label="เมนูนำทาง am around"
              className="fixed top-[64px] sm:top-[88px] left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[416px] z-40 bg-white rounded-[20px] shadow-[0_16px_40px_rgba(17,24,39,0.16)] border border-[#EFEAE4] overflow-hidden"
            >
              {/* Brand Row */}
              <div className="px-4 py-3 bg-[#FFF5EC] border-b border-[#FF6B00]/12 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AmAroundIcon size={28} className="rounded-[7px]" />
                  <span className="font-display font-bold text-[15px] text-[#111827]">
                    am around
                  </span>
                </div>
                <span className="text-[12px] text-[#6B7280] tabular-nums">
                  เปิดใช้งาน {activeProviderCount} แอป
                </span>
              </div>

              {/* Navigation Links */}
              <div className="p-2 flex flex-col gap-0.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenLocationPicker('pickup');
                  }}
                  className="w-full min-h-[46px] px-3 py-2 rounded-[12px] hover:bg-[#FFF5EC] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-[18px] h-[18px] text-[#FF6B00]" />
                    <span className="text-[14px] font-medium text-[#111827]">
                      ค้นหาจุดรับและปลายทาง
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onStartPinMode('pickup');
                  }}
                  className="w-full min-h-[46px] px-3 py-2 rounded-[12px] hover:bg-[#FFF5EC] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-[18px] h-[18px] text-[#FF6B00]" />
                    <span className="text-[14px] font-medium text-[#111827]">
                      ปักหมุดจุดรับบน Google Maps
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenProviderSettings();
                  }}
                  className="w-full min-h-[46px] px-3 py-2 rounded-[12px] hover:bg-[#FFF5EC] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="w-[18px] h-[18px] text-[#FF6B00]" />
                    <span className="text-[14px] font-medium text-[#111827]">
                      จัดการผู้ให้บริการเรียกรถ
                    </span>
                  </div>
                  <span className="text-[12px] text-[#6B7280] tabular-nums">
                    {activeProviderCount} แอป
                  </span>
                </button>
              </div>

              {/* Popular Commute Shortcuts */}
              {quickRoutes.length > 0 && (
                <div className="px-4 pt-2.5 pb-3.5 border-t border-[#F3F4F6] bg-[#FAFAFB]">
                  <div className="text-[11px] font-semibold text-[#6B7280] mb-2">
                    เส้นทางยอดนิยม
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {quickRoutes.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onSelectQuickRoute(preset.pickup, preset.destination);
                        }}
                        className="w-full min-h-[40px] px-3 py-1.5 rounded-[10px] bg-white hover:bg-[#FFF5EC] border border-[#ECE8E2] flex items-center gap-2 text-left text-[13px] font-medium text-[#111827] transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
