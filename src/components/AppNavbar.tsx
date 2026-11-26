import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  Globe,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Navigation,
  Search,
  SlidersHorizontal,
  Sun,
  UserCircle2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Language, LocationItem, MockUser, ThemeMode } from '../types';
import { t } from '../utils/i18n';
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
  currentUser: MockUser | null;
  quickRoutes: QuickRoutePreset[];
  lang: Language;
  theme: ThemeMode;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onOpenProviderSettings: () => void;
  onOpenLocationPicker: (focusField: 'pickup' | 'destination') => void;
  onStartPinMode: (mode: 'pickup' | 'destination') => void;
  onSelectQuickRoute: (pickup: LocationItem, destination: LocationItem) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  title,
  subtitle,
  activeProviderCount,
  currentUser,
  quickRoutes,
  lang,
  theme,
  onToggleLanguage,
  onToggleTheme,
  onOpenProviderSettings,
  onOpenLocationPicker,
  onStartPinMode,
  onSelectQuickRoute,
  onOpenLogin,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const strings = t(lang);

  // Lock background page scroll (and hide outer scrollbar) while menu popup is open
  useEffect(() => {
    if (!menuOpen) return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [menuOpen]);

  const providerLabel =
    currentUser?.provider === 'google'
      ? 'Google'
      : currentUser?.provider === 'facebook'
      ? 'Facebook'
      : 'Email';

  return (
    <>
      <nav
        aria-label={strings.brandName}
        className="sticky top-0 z-30 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-[#EFEAE4] dark:border-white/10 shadow-[0_2px_10px_rgba(17,24,39,0.04)] dark:shadow-none px-3.5 h-[64px] flex items-center justify-between gap-2 transition-colors"
      >
        {/* Left: Brand Icon + Page Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenProviderSettings}
            className="w-10 h-10 -ml-1 rounded-[12px] flex items-center justify-center shrink-0 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
            aria-label={`${strings.brandName} - ${strings.manageProviders}`}
            title={`${strings.manageProviders} (${activeProviderCount})`}
          >
            <AmAroundIcon size={38} className="rounded-[10px] shadow-xs" />
          </button>

          <div className="min-w-0">
            <h1 className="font-display text-[17px] sm:text-[18px] font-bold text-[#111827] dark:text-[#F9FAFB] leading-tight truncate">
              {title}
            </h1>
            <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] leading-tight mt-0.5 tabular-nums truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Controls (Lang + Dark Mode + Menu) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="h-9 px-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1F2937] hover:bg-[#EFEFF2] dark:hover:bg-[#374151] text-[#374151] dark:text-[#E5E7EB] text-[12px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer border border-black/5 dark:border-white/10"
            title={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            aria-label={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          >
            <Globe className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Quick Dark/Light Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl bg-[#F5F5F7] dark:bg-[#1F2937] hover:bg-[#EFEFF2] dark:hover:bg-[#374151] text-[#374151] dark:text-[#FBBF24] flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-black/5 dark:border-white/10"
            title={theme === 'dark' ? strings.lightMode : strings.darkMode}
            aria-label={theme === 'dark' ? strings.lightMode : strings.darkMode}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-[#4B5563]" />}
          </button>

          {/* Hamburger Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer ${
              menuOpen
                ? 'bg-[#FF6B00] text-white'
                : 'bg-[#FFF5EC] dark:bg-[#2A1D15] text-[#FF6B00] hover:bg-[#FFEAD6] dark:hover:bg-[#35251B]'
            }`}
            aria-label={menuOpen ? strings.closeMenu : strings.openMenu}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
              className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px] touch-none"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="menu"
              aria-label={strings.brandName}
              className="fixed top-[64px] sm:top-[88px] left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[416px] max-h-[min(440px,calc(100dvh-84px))] sm:max-h-[min(460px,calc(100dvh-112px))] z-40 bg-white dark:bg-[#111827] rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[#EFEAE4] dark:border-white/10 overflow-hidden flex flex-col"
            >
              {/* Brand & User Account Row (Pinned at top of popup) */}
              <div className="px-4 py-3.5 bg-[#FFF5EC] dark:bg-[#1F1D1A] border-b border-[#FF6B00]/12 dark:border-white/10 shrink-0">
                {currentUser ? (
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full text-white font-display font-bold text-[13px] flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: currentUser.avatarBg }}
                      >
                        {currentUser.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-bold text-[14px] text-[#111827] dark:text-[#F9FAFB] truncate">
                            {currentUser.name}
                          </span>
                          <span className="px-1.5 py-[1px] rounded-md bg-white dark:bg-[#2A231C] border border-[#FF6B00]/20 text-[10px] font-semibold text-[#C24E00] dark:text-[#FFA654] shrink-0">
                            {providerLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#251A1D] hover:bg-[#FEF2F2] dark:hover:bg-[#351C22] text-[#DC2626] dark:text-[#F87171] border border-[#FECACA] dark:border-[#7F1D1D]/40 text-[12px] font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{strings.logout}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserCircle2 className="w-9 h-9 text-[#FF6B00]/80 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-display font-bold text-[14px] text-[#111827] dark:text-[#F9FAFB]">
                          {strings.guestMode}
                        </div>
                        <div className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                          {strings.signInWithSocial}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#EA6200] text-white text-[12px] font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{strings.login}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Scrollable Inner Menu Body */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain popup-scrollbar">
                {/* Navigation Links */}
                <div className="p-2 flex flex-col gap-0.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenLocationPicker('pickup');
                  }}
                  className="w-full min-h-[46px] px-3 py-2 rounded-[12px] hover:bg-[#FFF5EC] dark:hover:bg-white/5 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-[18px] h-[18px] text-[#FF6B00]" />
                    <span className="text-[14px] font-medium text-[#111827] dark:text-[#F3F4F6]">
                      {strings.searchPickupAndDest}
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
                  className="w-full min-h-[46px] px-3 py-2 rounded-[12px] hover:bg-[#FFF5EC] dark:hover:bg-white/5 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-[18px] h-[18px] text-[#FF6B00]" />
                    <span className="text-[14px] font-medium text-[#111827] dark:text-[#F3F4F6]">
                      {strings.pinPickupOnMap}
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
                  className="w-full min-h-[46px] px-3 py-2 rounded-[12px] hover:bg-[#FFF5EC] dark:hover:bg-white/5 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="w-[18px] h-[18px] text-[#FF6B00]" />
                    <span className="text-[14px] font-medium text-[#111827] dark:text-[#F3F4F6]">
                      {strings.manageProviders}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] tabular-nums">
                    {strings.activeAppsCount(activeProviderCount)}
                  </span>
                </button>
              </div>

              {/* Settings Section (Theme & Language) */}
              <div className="p-3 border-t border-[#F3F4F6] dark:border-white/10 bg-[#FAFAFB] dark:bg-[#161F2E]/60 flex flex-col gap-2">
                <div className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider px-1">
                  {strings.settings}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Theme Mode Toggle Button */}
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="min-h-[42px] px-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-white/10 hover:border-[#FF6B00]/40 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-indigo-500" />
                      )}
                      <span className="text-[12px] font-semibold text-[#111827] dark:text-white">
                        {theme === 'dark' ? strings.darkMode : strings.lightMode}
                      </span>
                    </div>
                  </button>

                  {/* Language Toggle Button */}
                  <button
                    type="button"
                    onClick={onToggleLanguage}
                    className="min-h-[42px] px-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-white/10 hover:border-[#FF6B00]/40 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#FF6B00]" />
                      <span className="text-[12px] font-semibold text-[#111827] dark:text-white">
                        {lang === 'th' ? 'ไทย' : 'English'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Popular Commute Shortcuts */}
              {quickRoutes.length > 0 && (
                <div className="px-4 pt-2.5 pb-3.5 border-t border-[#F3F4F6] dark:border-white/10 bg-[#FAFAFB] dark:bg-[#111827]">
                  <div className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                    {strings.popularRoutes}
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
                        className="w-full min-h-[40px] px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1E293B] hover:bg-[#FFF5EC] dark:hover:bg-white/10 border border-[#ECE8E2] dark:border-white/10 flex items-center gap-2 text-left text-[13px] font-medium text-[#111827] dark:text-[#E5E7EB] transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
