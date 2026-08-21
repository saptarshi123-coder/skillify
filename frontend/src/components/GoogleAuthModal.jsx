import React, { useState } from 'react';
import { useApp, extractNameFromEmail } from '../context/AppContext';

export default function GoogleAuthModal({ isOpen, onClose }) {
  const { loginWithGoogle, showToast } = useApp();
  const [gmailInput, setGmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const derivedName = customName.trim() || (gmailInput.trim() ? extractNameFromEmail(gmailInput.trim()) : '');

  const handleSelectAccount = (accountData) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      loginWithGoogle(accountData);
      setIsAuthenticating(false);
      onClose();
    }, 600);
  };

  const handleGmailSubmit = (e) => {
    e.preventDefault();
    const email = gmailInput.trim();
    if (!email) {
      showToast("Please enter your Gmail address", "error");
      return;
    }
    if (!password.trim()) {
      showToast("Please enter your Google password", "error");
      return;
    }
    const finalName = customName.trim() || extractNameFromEmail(email);
    handleSelectAccount({
      name: finalName,
      email: email.includes('@') ? email : `${email}@gmail.com`,
      password: password.trim()
    });
  };

  const demoAccounts = [
    { email: "developer.tech@gmail.com" },
    { email: "student.coder@gmail.com" },
    { email: "guest.engineer@gmail.com" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-inverse-surface rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/60 space-y-4 relative text-on-surface dark:text-inverse-on-surface">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Google Header */}
        <div className="flex items-center gap-3 border-b border-surface-variant/40 pb-3">
          <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <div>
            <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
              Sign in with Google
            </h3>
            <p className="text-[11px] text-secondary">
              Enter your Gmail and password to sign in
            </p>
          </div>
        </div>

        {isAuthenticating ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-primary">Authenticating with Google OAuth...</p>
            <p className="text-[10px] text-secondary">Verifying credentials & loading profile</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Direct Gmail Input Form */}
            <form onSubmit={handleGmailSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                  Your Gmail Address
                </label>
                <input
                  type="email"
                  required
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  placeholder="e.g. saptarshi@gmail.com"
                  className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-primary transition-colors text-on-surface dark:text-inverse-on-surface"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                    Google Password
                  </label>
                  <span className="text-[10px] text-secondary">Required</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 pl-3 pr-10 text-xs outline-none focus:border-primary transition-colors text-on-surface dark:text-inverse-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-base">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Live Preview of extracted name */}
              {gmailInput.trim() && (
                <div className="p-2.5 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-2.5 animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {derivedName ? derivedName.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-primary truncate">
                      {derivedName}
                    </p>
                    <p className="text-[10px] text-secondary">Name auto-detected from Gmail</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Sign In with Google</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            <div className="flex items-center gap-2 my-1 opacity-70">
              <div className="flex-1 h-px bg-outline-variant"></div>
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Or 1-Tap Quick Accounts</span>
              <div className="flex-1 h-px bg-outline-variant"></div>
            </div>

            {/* Quick 1-Tap Account Selector */}
            <div className="space-y-1.5">
              {demoAccounts.map((acc, idx) => {
                const name = extractNameFromEmail(acc.email);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setGmailInput(acc.email);
                      setPassword("Skillify@2026");
                      handleSelectAccount({ name, email: acc.email, password: "Skillify@2026" });
                    }}
                    className="p-2.5 rounded-xl border border-surface-variant/60 hover:border-primary hover:bg-surface-container/50 transition-all cursor-pointer flex items-center gap-2.5 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-headline text-xs font-bold truncate">{name}</p>
                      <p className="text-[10px] text-secondary truncate">{acc.email}</p>
                    </div>
                    <span className="material-symbols-outlined text-xs text-secondary">chevron_right</span>
                  </div>
                );
              })}

              {/* Guest Account */}
              <div
                onClick={() => handleSelectAccount({ name: "Guest User", email: "guest@skillify.ai" })}
                className="p-2.5 rounded-xl border border-dashed border-outline-variant/60 hover:border-primary hover:bg-surface-container/50 transition-all cursor-pointer flex items-center gap-2.5 active:scale-98"
              >
                <div className="w-8 h-8 rounded-full bg-surface-variant/50 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-xs font-bold truncate">Continue as Guest</p>
                  <p className="text-[10px] text-secondary truncate">guest@skillify.ai</p>
                </div>
                <span className="text-[9px] font-bold bg-surface-variant text-secondary px-2 py-0.5 rounded-full">
                  Guest
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-surface-variant/30 text-[10px] text-secondary text-center">
          Skillify automatically syncs your Google profile name, email, and learning progress.
        </div>

      </div>
    </div>
  );
}
