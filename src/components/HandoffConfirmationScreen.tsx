import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Bike,
  Car,
  CheckCircle2,
  Download,
  Info,
  Loader2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ActiveSearchRoute, Language, Provider, RideOption, ThemeMode } from '../types';
import { t } from '../utils/i18n';
import { AmAroundIcon } from './AmAroundLogo';
import { ProviderBadge } from './ProviderBadge';

interface HandoffConfirmationScreenProps {
  route: ActiveSearchRoute;
  ride: RideOption;
  provider: Provider;
  lang: Language;
  theme: ThemeMode;
  onBack: () => void;
}

type HandoffState = 'idle' | 'launching' | 'fallback' | 'downloaded';

export const HandoffConfirmationScreen: React.FC<HandoffConfirmationScreenProps> = ({
  route,
  ride,
  provider,
  lang,
  theme: _theme,
  onBack,
}) => {
  const [handoffState, setHandoffState] = useState<HandoffState>('idle');
  const strings = t(lang);

  useEffect(() => {
    if (handoffState !== 'launching') return;
    // Simulate attempting native URI deep-link (e.g., grab://open) and timing out in web preview
    const timer = window.setTimeout(() => {
      setHandoffState('fallback');
    }, 1350);
    return () => window.clearTimeout(timer);
  }, [handoffState]);

  const handleLaunchProvider = () => {
    setHandoffState('launching');
  };

  return (
    <div className="min-h-[100dvh] sm:min-h-[820px] flex flex-col bg-white dark:bg-[#111827] relative transition-colors">
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-11 h-11 -ml-2 -mt-1 rounded-full hover:bg-[#F5F5F7] dark:hover:bg-white/10 text-[#111827] dark:text-[#F3F4F6] flex items-center justify-center shrink-0 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
            aria-label={strings.backToCompare}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-[21px] font-bold text-[#111827] dark:text-[#F9FAFB] leading-snug text-balance">
              {strings.continueIn(provider.name)}
            </h1>
            <p className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-snug">
              {strings.checkBeforeLaunch}
            </p>
          </div>
        </div>

        <div className="shrink-0 pt-0.5">
          <AmAroundIcon size={40} className="rounded-[10px] shadow-xs" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 pt-3 pb-7 flex flex-col gap-3.5">
        {/* Route Summary Card (Warm Cream) */}
        <section
          aria-label={strings.yourRoute}
          className="rounded-[16px] bg-[#FFF5EC] dark:bg-[#1E1B18] p-4 border border-[#FF6B00]/12 dark:border-[#FF6B00]/25"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
              {strings.yourRoute}
            </h2>
            <span className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] tabular-nums">
              ~{route.distanceKm.toFixed(1)} {lang === 'th' ? 'กม.' : 'km'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] shrink-0" />
              <span className="text-[15px] font-semibold text-[#111827] dark:text-[#F3F4F6] leading-snug">
                {route.pickup.name}
              </span>
            </div>

            <div className="pl-[1px] flex items-center">
              <ArrowDown className="w-4 h-4 text-[#FF6B00]" aria-hidden="true" />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111827] dark:bg-[#E2E8F0] shrink-0" />
              <span className="text-[15px] font-semibold text-[#111827] dark:text-[#F3F4F6] leading-snug">
                {route.destination.name}
              </span>
            </div>
          </div>
        </section>

        {/* Selected Ride Summary Card */}
        <section
          aria-label={strings.selectedRideDetails}
          className="rounded-[16px] bg-[#F5F5F7] dark:bg-[#182030] px-4 py-4 flex items-center justify-between gap-3 border border-transparent dark:border-white/5"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <ProviderBadge
              shortCode={provider.shortCode}
              badgeColor={provider.badgeColor}
              name={provider.name}
              size="lg"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[16px] font-bold text-[#111827] dark:text-[#F9FAFB] truncate">
                  {ride.serviceName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#111827] text-[11px] font-semibold text-[#FF6B00] dark:text-[#FF8A33] border border-[#FF6B00]/15 shrink-0">
                  {ride.vehicleType === 'car' ? (
                    <Car className="w-3 h-3" />
                  ) : (
                    <Bike className="w-3 h-3" />
                  )}
                  <span>{ride.vehicleType === 'car' ? strings.car : strings.motorbike}</span>
                </span>
              </div>
              <div className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 tabular-nums">
                {strings.waitApproxMinutes(ride.etaMinutes)}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-display text-[24px] font-extrabold text-[#111827] dark:text-[#F9FAFB] tabular-nums leading-none">
              ฿{ride.estimatedFare}
            </div>
            <div className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              {strings.estimatedPrice}
            </div>
          </div>
        </section>

        {/* Price Notice Banner */}
        <section
          aria-label={strings.priceDisclaimerTitle}
          className="rounded-[12px] bg-[#FFF5EC] dark:bg-[#1E1B18] px-3.5 py-3 flex items-start gap-2.5 border border-[#FF6B00]/12 dark:border-[#FF6B00]/25"
        >
          <Info className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[13px] text-[#374151] dark:text-[#D1D5DB] leading-relaxed">
            {strings.priceDisclaimerBody}
          </p>
        </section>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLaunchProvider}
            className="w-full h-[54px] rounded-full bg-[#FF6B00] hover:bg-[#EA6200] text-white font-display text-[16px] font-semibold flex items-center justify-center gap-2 shadow-[0_8px_18px_rgba(255,107,0,0.28)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 cursor-pointer"
          >
            <span>{strings.launchApp(provider.name)}</span>
            <ArrowUpRight className="w-5 h-5 stroke-[2.4]" />
          </button>
        </div>

        {/* Visual Process Indicator */}
        <div className="flex justify-center py-0.5" aria-hidden="true">
          <div className="w-8 h-8 rounded-full bg-[#FFF5EC] dark:bg-[#1E1B18] flex items-center justify-center text-[#FF6B00]">
            <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Next Steps Soft Mint Box */}
        <section
          aria-label="Next steps"
          className="rounded-[16px] bg-[#EAF7EE] dark:bg-[#13241C] px-4 py-4 border border-[#16A34A]/12 dark:border-[#16A34A]/25"
        >
          <p className="text-[13px] font-semibold text-[#15803D] dark:text-[#4ADE80] mb-1">
            {lang === 'th' ? `ขั้นตอนถัดไปใน ${provider.name}:` : `Next steps in ${provider.name}:`}
          </p>
          <p className="text-[14px] font-medium text-[#14532D] dark:text-[#86EFAC] leading-relaxed">
            {lang === 'th'
              ? 'ตรวจสอบราคา → กดยืนยัน → ชำระเงิน'
              : 'Review fare → Confirm ride → Complete payment'}
          </p>
        </section>
      </main>

      {/* Deep-Link Launch Simulation Overlay */}
      <AnimatePresence>
        {handoffState === 'launching' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-6"
            role="status"
            aria-live="polite"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-[320px] rounded-[20px] bg-white dark:bg-[#182030] p-6 text-center shadow-2xl border border-transparent dark:border-white/10"
            >
              <div className="flex justify-center mb-3.5">
                <div className="relative">
                  <ProviderBadge
                    shortCode={provider.shortCode}
                    badgeColor={provider.badgeColor}
                    name={provider.name}
                    size="lg"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#182030] flex items-center justify-center shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 text-[#FF6B00] animate-spin" />
                  </span>
                </div>
              </div>
              <p className="font-display text-[17px] font-bold text-[#111827] dark:text-white">
                {strings.openingApp}
              </p>
              <p className="text-[12px] text-[#6B7280] dark:text-gray-400 mt-1">
                {provider.deepLinkScheme}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Not Installed Fallback Bottom Sheet */}
      <AnimatePresence>
        {(handoffState === 'fallback' || handoffState === 'downloaded') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center"
            onClick={() => setHandoffState('idle')}
            role="dialog"
            aria-modal="true"
            aria-label={strings.cannotOpenApp(provider.name)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] bg-white dark:bg-[#182030] rounded-t-[24px] sm:rounded-[24px] px-5 pt-3 pb-6 shadow-2xl border border-transparent dark:border-white/10"
            >
              {/* Drag handle */}
              <div className="w-10 h-1.5 rounded-full bg-[#E5E7EB] dark:bg-gray-700 mx-auto mb-5" />

              {handoffState === 'fallback' ? (
                <>
                  <div className="flex items-start gap-3.5 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFF5EC] dark:bg-[#251A12] text-[#FF6B00] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-[18px] font-bold text-[#111827] dark:text-white leading-snug">
                        {strings.cannotOpenApp(provider.name)}
                      </h2>
                      <p className="text-[13px] text-[#6B7280] dark:text-gray-400 mt-1 leading-relaxed">
                        {strings.appNotInstalledHelp}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => setHandoffState('downloaded')}
                      className="w-full h-[48px] rounded-full bg-[#FF6B00] hover:bg-[#EA6200] text-white font-display text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{strings.downloadFromStore}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setHandoffState('idle');
                        onBack();
                      }}
                      className="w-full h-[48px] rounded-full bg-[#F5F5F7] dark:bg-[#20293D] hover:bg-[#EBEBEF] dark:hover:bg-[#28354E] text-[#111827] dark:text-white font-display text-[15px] font-semibold active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {strings.backToCompare}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-[#EAF7EE] dark:bg-[#13241C] text-[#16A34A] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-[18px] font-bold text-[#111827] dark:text-white">
                    {provider.name}
                  </h2>
                  <p className="text-[13px] text-[#6B7280] dark:text-gray-400 mt-1 mb-5">
                    {provider.fallbackUrl}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <a
                      href={provider.fallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-[48px] rounded-full bg-[#FF6B00] hover:bg-[#EA6200] text-white font-display text-[15px] font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{strings.openWebVersion}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setHandoffState('idle');
                        onBack();
                      }}
                      className="w-full h-[46px] rounded-full bg-[#F5F5F7] dark:bg-[#20293D] hover:bg-[#EBEBEF] dark:hover:bg-[#28354E] text-[#111827] dark:text-white font-display text-[14px] font-semibold cursor-pointer"
                    >
                      {strings.backToCompare}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
