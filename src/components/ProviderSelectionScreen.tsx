import React from 'react';
import { AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { Provider, ProviderId } from '../types';
import { AmAroundBrandLockup } from './AmAroundLogo';
import { ProviderBadge } from './ProviderBadge';

interface ProviderSelectionScreenProps {
  providers: Provider[];
  onToggleProvider: (id: ProviderId) => void;
  onConfirm: () => void;
  isReturningEdit?: boolean;
  onCancelEdit?: () => void;
}

export const ProviderSelectionScreen: React.FC<ProviderSelectionScreenProps> = ({
  providers,
  onToggleProvider,
  onConfirm,
  isReturningEdit = false,
  onCancelEdit,
}) => {
  const selectedCount = providers.filter((p) => p.isSelected).length;
  const isValid = selectedCount >= 1;

  return (
    <div className="min-h-[100dvh] sm:min-h-[820px] flex flex-col bg-white">
      {/* Top Orange Brand Header */}
      <header className="bg-gradient-to-br from-[#FF7A00] to-[#FF6B00] text-white px-5 pt-6 pb-7 rounded-b-[28px] shadow-[0_6px_20px_rgba(255,107,0,0.18)]">
        <div className="flex items-center justify-between mb-5">
          <AmAroundBrandLockup variant="onOrange" iconSize={44} />
          {isReturningEdit && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="กลับหน้าแผนที่"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <h1 className="font-display text-[22px] font-bold leading-snug tracking-[-0.01em] text-balance">
          จะเดินทางกับแอปไหนดี?
        </h1>
        <p className="text-[14px] text-white/90 mt-1 font-normal">
          ดูรถใกล้ตัวและเปรียบเทียบก่อนเลือก
        </p>
      </header>

      {/* Provider Selection List */}
      <main className="flex-1 px-5 pt-6 pb-4 flex flex-col">
        <div className="flex items-baseline justify-between mb-3.5">
          <h2 className="font-display text-[17px] font-bold text-[#111827]">
            เลือกผู้ให้บริการ
          </h2>
          <span className="text-[12px] text-[#6B7280] tabular-nums">
            เลือกแล้ว {selectedCount} จาก {providers.length} แอป
          </span>
        </div>

        <div className="flex flex-col gap-2.5" role="group" aria-label="เลือกผู้ให้บริการเรียกรถ">
          {providers.map((provider) => {
            const active = provider.isSelected;
            return (
              <button
                key={provider.id}
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => onToggleProvider(provider.id)}
                className={`w-full h-[56px] px-4 rounded-[12px] flex items-center justify-between transition-all duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-1 ${
                  active
                    ? 'bg-[#FFF5EC] ring-1 ring-[#FF6B00]/30'
                    : 'bg-[#FFF5EC]/70 hover:bg-[#FFF5EC] ring-1 ring-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <ProviderBadge
                    shortCode={provider.shortCode}
                    badgeColor={provider.badgeColor}
                    name={provider.name}
                    size="md"
                  />
                  <span className="text-[15px] font-semibold text-[#111827] truncate">
                    {provider.name}
                  </span>
                </div>

                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 ${
                    active
                      ? 'bg-[#16A34A] text-white scale-100'
                      : 'bg-white border-[1.5px] border-[#D1D5DB] text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Disclaimer Footnote */}
        <p className="text-[12px] text-[#6B7280] mt-4 leading-relaxed">
          * ประเภทพาหนะและพื้นที่ให้บริการขึ้นกับแต่ละแอป
        </p>

        {/* Validation Helper when 0 selected */}
        {!isValid && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-[12px] bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-2.5 text-[13px] text-[#B91C1C]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>กรุณาเลือกผู้ให้บริการอย่างน้อย 1 แอป</span>
          </div>
        )}
      </main>

      {/* Bottom Primary CTA */}
      <footer className="px-5 pt-2 pb-6 bg-white">
        <button
          type="button"
          disabled={!isValid}
          onClick={onConfirm}
          className={`w-full h-[52px] rounded-full font-display text-[16px] font-semibold text-white transition-all duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 ${
            isValid
              ? 'bg-[#FF6B00] hover:bg-[#EA6200] active:scale-[0.98] shadow-[0_6px_16px_rgba(255,107,0,0.28)] cursor-pointer'
              : 'bg-[#FF6B00] opacity-50 cursor-not-allowed'
          }`}
        >
          {isReturningEdit ? 'บันทึกและดูรถใกล้ตัว' : 'ยืนยันและเปรียบเทียบรถใกล้ตัว'}
        </button>
      </footer>
    </div>
  );
};
