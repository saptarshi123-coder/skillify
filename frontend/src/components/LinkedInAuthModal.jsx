import React, { useState } from 'react';
import { useApp, extractNameFromEmail } from '../context/AppContext';

export default function LinkedInAuthModal({ isOpen, onClose }) {
  const { loginWithLinkedIn, showToast } = useApp();
  const [linkedinInput, setLinkedinInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const derivedName = customName.trim() || (linkedinInput.trim() ? extractNameFromEmail(linkedinInput.trim()) : '');

  const handleSelectAccount = (accountData) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      loginWithLinkedIn(accountData);
      setIsAuthenticating(false);
      onClose();
    }, 600);
  };

  const handleLinkedInSubmit = (e) => {
    e.preventDefault();
    const email = linkedinInput.trim();
    if (!email) {
      showToast("Please enter your LinkedIn email address", "error");
      return;
    }
    if (!password.trim()) {
      showToast("Please enter your LinkedIn password", "error");
      return;
    }
    const finalName = customName.trim() || extractNameFromEmail(email);
    handleSelectAccount({
      name: finalName,
      email: email.includes('@') ? email : `${email}@linkedin.com`,
      password: password.trim(),
      major: "Software Engineering & Systems"
    });
  };

  const demoAccounts = [
    { name: "Senior Software Engineer", email: "lead.developer@linkedin.com" },
    { name: "Tech Fellow", email: "tech.fellow@linkedin.com" },
    { name: "Fullstack Architect", email: "fullstack.engineer@linkedin.com" }
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

        {/* LinkedIn Header */}
        <div className="flex items-center gap-3 border-b border-surface-variant/40 pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white shrink-0 shadow-sm">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
              Sign in with LinkedIn
            </h3>
            <p className="text-[11px] text-secondary">
              Enter your LinkedIn email and password to connect
            </p>
          </div>
        </div>

        {isAuthenticating ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#0A66C2] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-[#0A66C2]">Connecting to LinkedIn Identity API...</p>
            <p className="text-[10px] text-secondary">Verifying credentials & loading profile</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Direct LinkedIn Email Input Form */}
            <form onSubmit={handleLinkedInSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                  LinkedIn Email or Username
                </label>
                <input
                  type="text"
                  required
                  value={linkedinInput}
                  onChange={(e) => setLinkedinInput(e.target.value)}
                  placeholder="e.g. your.name@linkedin.com"
                  className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-[#0A66C2] transition-colors text-on-surface dark:text-inverse-on-surface"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                    LinkedIn Password
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
                    className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 pl-3 pr-10 text-xs outline-none focus:border-[#0A66C2] transition-colors text-on-surface dark:text-inverse-on-surface"
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
              {linkedinInput.trim() && (
                <div className="p-2.5 bg-[#0A66C2]/10 rounded-xl border border-[#0A66C2]/30 flex items-center gap-2.5 animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    {derivedName ? derivedName.charAt(0).toUpperCase() : 'L'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#0A66C2] truncate">
                      {derivedName}
                    </p>
                    <p className="text-[10px] text-secondary">Name detected from LinkedIn handle</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Sign In with LinkedIn</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            <div className="flex items-center gap-2 my-1 opacity-70">
              <div className="flex-1 h-px bg-outline-variant"></div>
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Or 1-Tap Quick Profiles</span>
              <div className="flex-1 h-px bg-outline-variant"></div>
            </div>

            {/* Quick 1-Tap Profile Selector */}
            <div className="space-y-1.5">
              {demoAccounts.map((acc, idx) => {
                const name = extractNameFromEmail(acc.email);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setLinkedinInput(acc.email);
                      setPassword("Skillify@2026");
                      handleSelectAccount({ name, email: acc.email, password: "Skillify@2026", major: "Software Engineering" });
                    }}
                    className="p-2.5 rounded-xl border border-surface-variant/60 hover:border-[#0A66C2] hover:bg-surface-container/50 transition-all cursor-pointer flex items-center gap-2.5 active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0A66C2]/15 text-[#0A66C2] flex items-center justify-center font-bold text-xs shrink-0">
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

              {/* Guest / Demo Option */}
              <div
                onClick={() => handleSelectAccount({ name: "Guest Developer", email: "guest.dev@linkedin.com" })}
                className="p-2.5 rounded-xl border border-dashed border-outline-variant/60 hover:border-[#0A66C2] hover:bg-surface-container/50 transition-all cursor-pointer flex items-center gap-2.5 active:scale-98"
              >
                <div className="w-8 h-8 rounded-full bg-surface-variant/50 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                  <span className="material-symbols-outlined text-sm">badge</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-xs font-bold truncate">Continue as LinkedIn Guest</p>
                  <p className="text-[10px] text-secondary truncate">guest.dev@linkedin.com</p>
                </div>
                <span className="text-[9px] font-bold bg-[#0A66C2]/10 text-[#0A66C2] px-2 py-0.5 rounded-full">
                  LinkedIn
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-surface-variant/30 text-[10px] text-secondary text-center">
          Skillify connects with LinkedIn to verify your professional coding skills and certifications.
        </div>

      </div>
    </div>
  );
}
