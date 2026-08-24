import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import GoogleAuthModal from '../components/GoogleAuthModal';
import LinkedInAuthModal from '../components/LinkedInAuthModal';

export default function LoginScreen() {
  const { loginWithLinkedIn, loginWithEmail, navigate, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email address", "error");
      return;
    }
    if (!password.trim()) {
      showToast("Please enter your password", "error");
      return;
    }
    setIsLoading(true);
    try {
      await loginWithEmail(email.trim(), password.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-surface flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-primary text-white mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
              school
            </span>
          </div>
          <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tight">
            Skillify
          </h1>
          <p className="text-xs text-secondary font-medium">
            Accelerate your tech career with verified skills
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-6 shadow-card border border-surface-variant/40 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="font-headline text-base font-bold text-on-surface dark:text-inverse-on-surface">
              Welcome Back
            </h2>
            <p className="text-[11px] text-secondary">
              Sign in with your social account or email and password
            </p>
          </div>

          {/* Social OAuth Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* Google */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full py-3 px-4 bg-surface dark:bg-inverse-surface/40 hover:bg-surface-container border border-outline-variant/60 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span className="text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                Continue with Google
              </span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => setIsLinkedInModalOpen(true)}
              className="w-full py-3 px-4 bg-surface dark:bg-inverse-surface/40 hover:bg-surface-container border border-outline-variant/60 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span className="text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                Continue with LinkedIn
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-outline-variant/50"></div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Or Email & Password</span>
            <div className="flex-1 h-px bg-outline-variant/50"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-primary transition-colors text-on-surface dark:text-inverse-on-surface"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Password</label>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary-container text-white font-headline text-xs font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] mt-2 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-sm">{isLoading ? 'progress_activity' : 'lock_open'}</span>
              <span>{isLoading ? 'Signing In...' : 'Sign In with Password'}</span>
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="pt-2 text-center text-xs text-secondary">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('signup')}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Demo Fast Bypass */}
        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="w-full text-center text-xs text-secondary hover:text-primary font-semibold py-2 cursor-pointer"
        >
          ⚡ Fast Google Sign-In & Create Account
        </button>

      </div>

      {/* Google OAuth Account Picker Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />

      {/* LinkedIn OAuth Modal */}
      <LinkedInAuthModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
      />
    </div>
  );
}
