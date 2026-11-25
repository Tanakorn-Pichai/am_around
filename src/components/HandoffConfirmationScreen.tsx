import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Info,
  Loader2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ActiveSearchRoute, Provider, RideOption } from '../types';
import { AmAroundIcon } from './AmAroundLogo';
import { ProviderBadge } from './ProviderBadge';

interface HandoffConfirmationScreenProps {
  route: ActiveSearchRoute;
  ride: RideOption;
  provider: Provider;
  onBack: () => void;
}

type HandoffState = 'idle' | 'launching' | 'fallback' | 'downloaded';

export const HandoffConfirmationScreen: React.FC<HandoffConfirmationScreenProps> = ({
  route,
  ride,
  provider,
  onBack,
}) => {
  const [handoffState, setHandoffState] = useState<HandoffState>('idle');

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
    <div className="min-h-[100dvh] sm:min-h-[820px] flex flex-col bg-white relative">
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-11 h-11 -ml-2 -mt-1 rounded-full hover:bg-[#F5F5F7] text-[#111827] flex items-center justify-center shrink-0 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
            aria-label="กลับไปหน้ารายการเปรียบเทียบ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-[21px] font-bold text-[#111827] leading-snug text-balance">
              ดำเนินการต่อใน {provider.name}
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-0.5 leading-snug">
              ตรวจสอบรายละเอียดก่อนเปิดแอปผู้ให้บริการ
            </p>
          </div>
        </div>

        <div className="shrink-0 pt-0.5">
          <AmAroundIcon size={40} className="rounded-[10px] shadow-xs" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 pt-3 pb-7 flex flex-col gap-3.5">
        {/* Route Summary Card (Warm Cream #FFF5EC) */}
        <section
          aria-label="เส้นทางของคุณ"
          className="rounded-[16px] bg-[#FFF5EC] p-4 border border-[#FF6B00]/12"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-[#6B7280]">เส้นทางของคุณ</h2>
            <span className="text-[12px] text-[#6B7280] tabular-nums">
              ~{route.distanceKm.toFixed(1)} กม.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] shrink-0" />
              <span className="text-[15px] font-semibold text-[#111827] leading-snug">
                {route.pickup.name}
              </span>
            </div>

            <div className="pl-[1px] flex items-center">
              <ArrowDown className="w-4 h-4 text-[#FF6B00]" aria-hidden="true" />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111827] shrink-0" />
              <span className="text-[15px] font-semibold text-[#111827] leading-snug">
                {route.destination.name}
              </span>
            </div>
          </div>
        </section>

        {/* Selected Ride Summary Card (Light Gray #F5F5F7) */}
        <section
          aria-label="รายละเอียดรถที่เลือก"
          className="rounded-[16px] bg-[#F5F5F7] px-4 py-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <ProviderBadge
              shortCode={provider.shortCode}
              badgeColor={provider.badgeColor}
              name={provider.name}
              size="lg"
            />
            <div className="min-w-0">
              <div className="text-[16px] font-bold text-[#111827] truncate">
                {ride.serviceName}
              </div>
              <div className="text-[13px] text-[#6B7280] mt-0.5 tabular-nums">
                รอประมาณ {ride.etaMinutes} นาที
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-display text-[24px] font-extrabold text-[#111827] tabular-nums leading-none">
              ฿{ride.estimatedFare}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">ราคาโดยประมาณ</div>
          </div>
        </section>

        {/* Price Notice Banner (Warm Cream #FFF5EC) */}
        <section
          aria-label="หมายเหตุราคา"
          className="rounded-[12px] bg-[#FFF5EC] px-3.5 py-3 flex items-start gap-2.5"
        >
          <Info className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[13px] text-[#374151] leading-relaxed">
            ราคาแสดงก่อนเปลี่ยนแอป — ยอดจริงให้ตรวจสอบใน{' '}
            <span className="font-semibold text-[#111827]">{provider.name}</span> อีกครั้ง
          </p>
        </section>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLaunchProvider}
            className="w-full h-[54px] rounded-full bg-[#FF6B00] hover:bg-[#EA6200] text-white font-display text-[16px] font-semibold flex items-center justify-center gap-2 shadow-[0_8px_18px_rgba(255,107,0,0.28)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 cursor-pointer"
          >
            <span>เปิด {provider.name} เพื่อเรียกรถ</span>
            <ArrowUpRight className="w-5 h-5 stroke-[2.4]" />
          </button>
        </div>

        {/* Visual Process Indicator (Downward Orange Arrow) */}
        <div className="flex justify-center py-0.5" aria-hidden="true">
          <div className="w-8 h-8 rounded-full bg-[#FFF5EC] flex items-center justify-center text-[#FF6B00]">
            <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Next Steps Soft Mint-Green Instruction Box (#EAF7EE) */}
        <section
          aria-label="ขั้นตอนถัดไป"
          className="rounded-[16px] bg-[#EAF7EE] px-4 py-4 border border-[#16A34A]/12"
        >
          <p className="text-[13px] font-semibold text-[#15803D] mb-1">
            ขั้นตอนถัดไปใน {provider.name}:
          </p>
          <p className="text-[14px] font-medium text-[#14532D] leading-relaxed">
            ตรวจสอบราคา → กดยืนยัน → ชำระเงิน
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-6"
            role="status"
            aria-live="polite"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-[320px] rounded-[20px] bg-white p-6 text-center shadow-2xl"
            >
              <div className="flex justify-center mb-3.5">
                <div className="relative">
                  <ProviderBadge
                    shortCode={provider.shortCode}
                    badgeColor={provider.badgeColor}
                    name={provider.name}
                    size="lg"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 text-[#FF6B00] animate-spin" />
                  </span>
                </div>
              </div>
              <p className="font-display text-[17px] font-bold text-[#111827]">
                กำลังเปิดแอป {provider.name}...
              </p>
              <p className="text-[12px] text-[#6B7280] mt-1">
                ส่งต่อจุดรับและปลายทางไปยัง {provider.deepLinkScheme}
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center"
            onClick={() => setHandoffState('idle')}
            role="dialog"
            aria-modal="true"
            aria-label={`ไม่พบแอป ${provider.name}`}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] bg-white rounded-t-[24px] sm:rounded-[24px] px-5 pt-3 pb-6 shadow-2xl"
            >
              {/* Drag handle */}
              <div className="w-10 h-1.5 rounded-full bg-[#E5E7EB] mx-auto mb-5" />

              {handoffState === 'fallback' ? (
                <>
                  <div className="flex items-start gap-3.5 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFF5EC] text-[#FF6B00] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-[18px] font-bold text-[#111827] leading-snug">
                        ไม่พบแอป {provider.name} ในเครื่องของคุณ
                      </h2>
                      <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">
                        คุณสามารถติดตั้งแอป {provider.name} เพื่อดำเนินการเรียกรถต่อ หรือกลับไปเลือกผู้ให้บริการอื่นที่มีในเครื่องได้ทันที
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => setHandoffState('downloaded')}
                      className="w-full h-[48px] rounded-full bg-[#FF6B00] hover:bg-[#EA6200] text-white font-display text-[15px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลด {provider.name}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setHandoffState('idle');
                        onBack();
                      }}
                      className="w-full h-[48px] rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[#111827] font-display text-[15px] font-semibold active:scale-[0.98] transition-all"
                    >
                      เลือกผู้ให้บริการอื่น
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-[#EAF7EE] text-[#16A34A] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-[18px] font-bold text-[#111827]">
                    พร้อมเชื่อมต่อไปยังหน้าดาวน์โหลด {provider.name}
                  </h2>
                  <p className="text-[13px] text-[#6B7280] mt-1 mb-5">
                    ลิงก์อย่างเป็นทางการ: {provider.fallbackUrl}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <a
                      href={provider.fallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-[48px] rounded-full bg-[#FF6B00] hover:bg-[#EA6200] text-white font-display text-[15px] font-semibold flex items-center justify-center gap-2"
                    >
                      <span>ไปที่เว็บไซต์ {provider.name}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setHandoffState('idle');
                        onBack();
                      }}
                      className="w-full h-[46px] rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[#111827] font-display text-[14px] font-semibold"
                    >
                      กลับไปเลือกผู้ให้บริการอื่น
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
