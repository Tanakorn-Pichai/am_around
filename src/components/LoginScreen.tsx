import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProviderType, Language, MockUser, ThemeMode } from '../types';
import { t } from '../utils/i18n';
import { AmAroundBrandLockup } from './AmAroundLogo';

interface LoginScreenProps {
  onLoginSuccess: (user: MockUser) => void;
  onSkipAsGuest: () => void;
  lang: Language;
  theme: ThemeMode;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
}

interface PresetAccount {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarBg: string;
}

const GOOGLE_PRESETS: PresetAccount[] = [
  {
    id: 'mock_google_1',
    name: 'สมชาย ใจดี',
    email: 'somchai.jaidee@gmail.com',
    avatarInitials: 'สช',
    avatarBg: '#EA4335',
  },
  {
    id: 'mock_google_2',
    name: 'พิมพ์ชนก สุขสันต์',
    email: 'pimchanok.s@gmail.com',
    avatarInitials: 'พช',
    avatarBg: '#4285F4',
  },
];

const FACEBOOK_PRESETS: PresetAccount[] = [
  {
    id: 'mock_fb_1',
    name: 'ณัฐพล วงศ์สุวรรณ',
    email: 'nattapon.w@facebook.com',
    avatarInitials: 'ณพ',
    avatarBg: '#1877F2',
  },
  {
    id: 'mock_fb_2',
    name: 'กานต์ธิดา รัตนกุล',
    email: 'kantida.r@facebook.com',
    avatarInitials: 'กธ',
    avatarBg: '#0C5DC7',
  },
];

const GoogleLogoSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.51h6.45c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.85c2.25-2.07 3.57-5.13 3.57-8.8z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.85-2.98c-1.07.72-2.44 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.27v3.08C3.25 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.25 14.29A7.19 7.19 0 0 1 4.87 12c0-.79.14-1.56.38-2.29V6.63H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l3.98-3.08z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.94 1.19 15.23 0 12 0 7.31 0 3.25 2.7 1.27 6.63l3.98 3.08C6.2 6.87 8.86 4.75 12 4.75z"
    />
  </svg>
);

const FacebookLogoSvg: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
    <path
      fill="#FFFFFF"
      d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.12 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.08 24 18.09 24 12.07z"
    />
  </svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onSkipAsGuest,
  lang,
  theme,
  onToggleLanguage,
  onToggleTheme,
  canGoBack = false,
  onBack,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeSocialSheet, setActiveSocialSheet] = useState<'google' | 'facebook' | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderType | null>(null);
  const strings = t(lang);

  const completeMockLogin = (user: MockUser) => {
    setLoadingProvider(user.provider);
    window.setTimeout(() => {
      setLoadingProvider(null);
      setActiveSocialSheet(null);
      onLoginSuccess(user);
    }, 450);
  };

  const handleSelectSocialPreset = (
    provider: 'google' | 'facebook',
    preset: PresetAccount
  ) => {
    completeMockLogin({
      ...preset,
      provider,
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError(strings.invalidEmail);
      return;
    }
    if (password.trim().length < 4) {
      setFormError(strings.invalidPassword);
      return;
    }
    setFormError('');

    const rawName = trimmedEmail.split('@')[0].replace(/[._-]+/g, ' ').trim();
    const displayName = rawName
      ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
      : lang === 'th'
      ? 'ผู้ใช้งาน'
      : 'User';
    const initials = displayName.slice(0, 2).toUpperCase();

    completeMockLogin({
      id: `mock_email_${Date.now()}`,
      name: displayName,
      email: trimmedEmail,
      avatarInitials: initials,
      avatarBg: '#FF6B00',
      provider: 'email',
    });
  };

  return (
    <div className="min-h-[100dvh] sm:min-h-[820px] flex flex-col bg-white dark:bg-[#111827] relative transition-colors">
      {/* Top Orange Brand Header */}
      <header className="bg-gradient-to-br from-[#FF7A00] to-[#FF6B00] text-white px-5 pt-6 pb-8 rounded-b-[28px] shadow-[0_6px_20px_rgba(255,107,0,0.18)]">
        <div className="flex items-center justify-between mb-6">
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

            {canGoBack && onBack && (
              <button
                type="button"
                onClick={onBack}
                className="min-h-[36px] min-w-[36px] -mr-1 flex items-center justify-center rounded-full text-white/95 hover:bg-white/18 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                aria-label={strings.back}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h1 className="font-display text-[24px] font-bold leading-snug tracking-[-0.01em]">
          {strings.loginTitle}
        </h1>
        <p className="text-[14px] text-white/90 mt-1.5 leading-relaxed">
          {strings.loginSubtitle}
        </p>
      </header>

      {/* Main Login Actions */}
      <main className="flex-1 px-5 pt-6 pb-6 flex flex-col justify-between">
        <div className="flex flex-col gap-3">
          {/* Email / Password Mockup Form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-[12px] font-semibold text-[#374151] dark:text-[#E2E8F0] mb-1.5"
              >
                {strings.emailLabel}
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full h-[48px] pl-10 pr-4 rounded-[12px] bg-[#F9FAFB] dark:bg-[#182030] border border-[#E5E7EB] dark:border-white/10 text-[14px] text-[#111827] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-[#1C263B] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-[12px] font-semibold text-[#374151] dark:text-[#E2E8F0] mb-1.5"
              >
                {strings.passwordLabel}
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder={strings.passwordPlaceholder}
                  autoComplete="current-password"
                  className="w-full h-[48px] pl-10 pr-11 rounded-[12px] bg-[#F9FAFB] dark:bg-[#182030] border border-[#E5E7EB] dark:border-white/10 text-[14px] text-[#111827] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-[#1C263B] focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {formError && (
              <p role="alert" className="text-[12px] font-medium text-[#DC2626] dark:text-[#F87171]">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={loadingProvider !== null}
              className="mt-1 w-full h-[50px] rounded-full bg-[#FF6B00] hover:bg-[#EA6200] text-white font-display text-[15px] font-semibold shadow-[0_6px_16px_rgba(255,107,0,0.26)] active:scale-[0.985] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            >
              {loadingProvider === 'email' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{strings.loggingIn}</span>
                </>
              ) : (
                <span>{strings.loginBtn}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-2">
            <div className="flex-1 border-t border-[#E5E7EB] dark:border-white/10" />
            <span className="px-3 text-[12px] text-[#9CA3AF] dark:text-gray-400 font-medium">
              {strings.orLoginWith}
            </span>
            <div className="flex-1 border-t border-[#E5E7EB] dark:border-white/10" />
          </div>

          {/* Social Login Buttons (Google & Facebook at bottom) */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => setActiveSocialSheet('google')}
              className="w-full h-[50px] px-4 rounded-[14px] bg-white dark:bg-[#182030] hover:bg-[#FAFAFB] dark:hover:bg-[#20293D] border border-[#E5E7EB] dark:border-white/10 shadow-2xs flex items-center justify-center gap-3 text-[15px] font-semibold text-[#111827] dark:text-white active:scale-[0.985] transition-all disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
            >
              <GoogleLogoSvg />
              <span>{strings.loginGoogle}</span>
            </button>

            <button
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => setActiveSocialSheet('facebook')}
              className="w-full h-[50px] px-4 rounded-[14px] bg-[#1877F2] hover:bg-[#166FE5] shadow-[0_4px_12px_rgba(24,119,242,0.24)] flex items-center justify-center gap-3 text-[15px] font-semibold text-white active:scale-[0.985] transition-all disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-1"
            >
              <FacebookLogoSvg />
              <span>{strings.loginFacebook}</span>
            </button>
          </div>
        </div>

        {/* Bottom Skip / Mockup Notice */}
        <div className="pt-6 text-center flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onSkipAsGuest}
            className="text-[13px] font-semibold text-[#6B7280] dark:text-gray-400 hover:text-[#FF6B00] dark:hover:text-[#FF8A33] py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            {strings.skipAsGuest}
          </button>
          <p className="text-[11px] text-[#9CA3AF] dark:text-gray-500">
            {strings.mockNotice}
          </p>
        </div>
      </main>

      {/* Mockup Google / Facebook Account Chooser Bottom Sheet */}
      <AnimatePresence>
        {activeSocialSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => !loadingProvider && setActiveSocialSheet(null)}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px]"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 36 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={
                activeSocialSheet === 'google'
                  ? strings.selectGoogleAccount
                  : strings.selectFacebookAccount
              }
              className="fixed bottom-0 sm:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[440px] sm:max-w-[416px] z-50 bg-white dark:bg-[#182030] rounded-t-[24px] sm:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-[#ECE8E2] dark:border-white/10 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#F3F4F6] dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {activeSocialSheet === 'google' ? (
                    <GoogleLogoSvg />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center">
                      <FacebookLogoSvg />
                    </span>
                  )}
                  <div>
                    <h2 className="font-display text-[15px] font-bold text-[#111827] dark:text-white leading-tight">
                      {activeSocialSheet === 'google'
                        ? strings.selectGoogleAccount
                        : strings.selectFacebookAccount}
                    </h2>
                    <p className="text-[11px] text-[#6B7280] dark:text-gray-400">
                      {strings.selectMockAccountSub}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={loadingProvider !== null}
                  onClick={() => setActiveSocialSheet(null)}
                  className="w-8 h-8 rounded-full hover:bg-[#F3F4F6] dark:hover:bg-white/10 flex items-center justify-center text-[#6B7280] dark:text-gray-400 cursor-pointer"
                  aria-label={strings.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-2.5">
                {(activeSocialSheet === 'google' ? GOOGLE_PRESETS : FACEBOOK_PRESETS).map(
                  (account) => {
                    const isSigningIn = loadingProvider === activeSocialSheet;
                    return (
                      <button
                        key={account.id}
                        type="button"
                        disabled={isSigningIn}
                        onClick={() => handleSelectSocialPreset(activeSocialSheet, account)}
                        className="w-full p-3 rounded-[14px] bg-[#F9FAFB] dark:bg-[#1E293B] hover:bg-[#FFF5EC] dark:hover:bg-[#283548] border border-[#ECE8E2] dark:border-white/10 hover:border-[#FF6B00]/35 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-full text-white font-display font-bold text-[14px] flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: account.avatarBg }}
                          >
                            {account.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-[#111827] dark:text-white truncate">
                              {account.name}
                            </div>
                            <div className="text-[12px] text-[#6B7280] dark:text-gray-400 truncate">
                              {account.email}
                            </div>
                          </div>
                        </div>

                        {isSigningIn ? (
                          <Loader2 className="w-4 h-4 text-[#FF6B00] animate-spin shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-[#D1D5DB] dark:text-gray-600 shrink-0" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="px-5 py-3 bg-[#FAFAFB] dark:bg-[#111827] border-t border-[#F3F4F6] dark:border-white/10 text-[11px] text-[#6B7280] dark:text-gray-400 text-center">
                {strings.mockAccountsNote}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
