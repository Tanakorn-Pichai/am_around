import React from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Globe,
  LogIn,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { Language, MockUser, Provider, ProviderId, ThemeMode } from '../types';
import { t } from '../utils/i18n';
import { AmAroundBrandLockup } from './AmAroundLogo';
import { ProviderBadge } from './ProviderBadge';

interface ProviderSelectionScreenProps {
  providers: Provider[];
  currentUser: MockUser | null;
  lang: Language;
  theme: ThemeMode;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onToggleProvider: (id: ProviderId) => void;
  onConfirm: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  isReturningEdit?: boolean;
  onCancelEdit?: () => void;
}

export const ProviderSelectionScreen: React.FC<ProviderSelectionScreenProps> = ({
  providers,
  currentUser,
  lang,
  theme,
  onToggleLanguage,
  onToggleTheme,
  onToggleProvider,
  onConfirm,
  onOpenLogin,
  onLogout,
  isReturningEdit = false,
  onCancelEdit,
}) => {
  const selectedCount = providers.filter((p) => p.isSelected).length;
  const isValid = selectedCount >= 1;
  const strings = t(lang);

  return (
    <div className="min-h-[100dvh] sm:min-h-[820px] flex flex-col bg-white dark:bg-[#111827] transition-colors">
      {/* Top Orange Brand Header */}
      <header className="bg-gradient-to-br from-[#FF7A00] to-[#FF6B00] text-white px-5 pt-6 pb-7 rounded-b-[28px] shadow-[0_6px_20px_rgba(255,107,0,0.18)]">
        <div className="flex items-center justify-between gap-2 mb-5">
          <AmAroundBrandLockup variant="onOrange" iconSize={44} />

          <div className="flex items-center gap-1.5">
            {/* Quick Lang Toggle */}
            <button
              type="button"
              onClick={onToggleLanguage}
              className="h-8 px-2 rounded-full bg-white/18 hover:bg-white/28 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              title={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            >
              <Globe className="w-3 h-3" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Quick Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-full bg-white/18 hover:bg-white/28 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title={theme === 'dark' ? strings.lightMode : strings.darkMode}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-200" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={onLogout}
                className="h-8 px-2.5 rounded-full bg-white/18 hover:bg-white/28 text-white text-[12px] font-medium flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                title={`${strings.logout} (${currentUser.name})`}
                aria-label={strings.logout}
              >
                <span className="w-5 h-5 rounded-full bg-white text-[#FF6B00] font-display font-bold text-[10px] flex items-center justify-center shrink-0">
                  {currentUser.avatarInitials}
                </span>
                <LogOut className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="h-8 px-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>{strings.login}</span>
              </button>
            )}

            {isReturningEdit && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="min-h-[36px] min-w-[36px] -mr-1 flex items-center justify-center rounded-full text-white/95 hover:bg-white/18 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                aria-label={strings.back}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h1 className="font-display text-[22px] font-bold leading-snug tracking-[-0.01em] text-balance">
          {strings.whichAppToRide}
        </h1>
        <p className="text-[14px] text-white/90 mt-1 font-normal">
          {strings.brandTagline}
        </p>
      </header>

      {/* Provider Selection List */}
      <main className="flex-1 px-5 pt-6 pb-4 flex flex-col">
        <div className="flex items-baseline justify-between mb-3.5">
          <h2 className="font-display text-[17px] font-bold text-[#111827] dark:text-[#F9FAFB]">
            {strings.selectProvidersTitle}
          </h2>
          <span className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] tabular-nums">
            {strings.selectedCountOfTotal(selectedCount, providers.length)}
          </span>
        </div>

        <div className="flex flex-col gap-2.5" role="group" aria-label={strings.selectProvidersTitle}>
          {providers.map((provider) => {
            const active = provider.isSelected;
            return (
              <button
                key={provider.id}
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => onToggleProvider(provider.id)}
                className={`w-full h-[56px] px-4 rounded-[12px] flex items-center justify-between transition-all duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-1 cursor-pointer ${
                  active
                    ? 'bg-[#FFF5EC] dark:bg-[#1E1B18] ring-1 ring-[#FF6B00]/40'
                    : 'bg-[#FFF5EC]/70 dark:bg-[#182030] hover:bg-[#FFF5EC] dark:hover:bg-[#20293D] ring-1 ring-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <ProviderBadge
                    shortCode={provider.shortCode}
                    badgeColor={provider.badgeColor}
                    name={provider.name}
                    size="md"
                  />
                  <span className="text-[15px] font-semibold text-[#111827] dark:text-[#F9FAFB] truncate">
                    {provider.name}
                  </span>
                </div>

                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 ${
                    active
                      ? 'bg-[#16A34A] text-white scale-100 shadow-2xs'
                      : 'bg-white dark:bg-[#111827] border-[1.5px] border-[#D1D5DB] dark:border-gray-600 text-transparent'
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
        <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] mt-4 leading-relaxed">
          {strings.providerFootnote}
        </p>

        {/* Validation Helper when 0 selected */}
        {!isValid && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-[12px] bg-[#FEF2F2] dark:bg-[#2A1517] border border-[#FECACA] dark:border-[#7F1D1D]/50 px-3.5 py-2.5 text-[13px] text-[#B91C1C] dark:text-[#FCA5A5]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{strings.providerMinOne}</span>
          </div>
        )}
      </main>

      {/* Bottom Primary CTA */}
      <footer className="px-5 pt-2 pb-6 bg-white dark:bg-[#111827] transition-colors">
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
          {isReturningEdit ? strings.saveAndCompare : strings.confirmAndCompare}
        </button>
      </footer>
    </div>
  );
};
