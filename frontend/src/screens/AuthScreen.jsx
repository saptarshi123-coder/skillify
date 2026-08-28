import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import GoogleAuthModal from '../components/GoogleAuthModal';

export default function AuthScreen() {
  const {
    loginWithGoogle,
    loginWithGitHub,
    loginWithEmail,
    signupWithEmail,
    navigate
  } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    major: 'Computer Science Major'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      await signupWithEmail(formData.name, formData.email, formData.password);
    } else {
      await loginWithEmail(formData.email, formData.password);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-margin-mobile bg-surface dark:bg-inverse-surface transition-colors py-10">
      <main className="w-full max-w-[440px] bg-surface-container-lowest dark:bg-surface-container-high rounded-[28px] p-6 md:p-8 shadow-[0_12px_32px_rgba(154,0,2,0.08)] flex flex-col items-center relative overflow-hidden border border-outline-variant/30">
        
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-primary to-primary-container"></div>

        {/* Logo Container */}
        <div className="mb-4 mt-2 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary-container/10 dark:bg-primary-container/20 flex items-center justify-center border-2 border-primary/20 shadow-inner">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6 w-full">
          <h1 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-primary-container dark:text-primary-fixed tracking-tight">
            {isSignUp ? "Create Account" : "Welcome"}
          </h1>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant dark:text-secondary-fixed-dim mt-1">
            {isSignUp
              ? "Join Skillify to test your code & earn certifications."
              : "Log in to continue your coding journey."}
          </p>
        </div>

        {/* Social Login Buttons Matching Stitch Design */}
        <div className="w-full flex flex-col gap-3 mb-6">
          
          {/* Google Login Button */}
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="group relative w-full flex items-center justify-center gap-3 py-3 px-5 rounded-full border-[1.5px] border-outline-variant/80 dark:border-outline hover:border-primary bg-surface-container-lowest dark:bg-surface-container-high text-on-surface dark:text-inverse-on-surface hover:bg-primary/5 transition-all duration-300 transform hover:-translate-y-[2px] shadow-sm font-label-md text-sm font-bold active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isSignUp ? "Sign up with Google" : "Continue with Google"}</span>
          </button>


          {/* GitHub Login Button */}
          <button
            type="button"
            onClick={loginWithGitHub}
            className="group relative w-full flex items-center justify-center gap-3 py-3 px-5 rounded-full border-[1.5px] border-outline-variant/80 dark:border-outline hover:border-primary bg-surface-container-lowest dark:bg-surface-container-high text-on-surface dark:text-inverse-on-surface hover:bg-primary/5 transition-all duration-300 transform hover:-translate-y-[2px] shadow-sm font-label-md text-sm font-bold active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>{isSignUp ? "Sign up with GitHub" : "Continue with GitHub"}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 mb-5 opacity-60">
          <div className="h-px bg-outline-variant flex-1"></div>
          <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">or with email</span>
          <div className="h-px bg-outline-variant flex-1"></div>
        </div>

        {/* Email Login / Signup Form */}
        {!showEmailForm ? (
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="w-full py-3 px-5 rounded-full border border-primary text-primary font-label-md text-sm font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 mb-4 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">mail</span>
            <span>{isSignUp ? "Sign up with Email Address" : "Sign in with Email Address"}</span>
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-3 mb-4 animate-fadeIn">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-surface-container dark:bg-surface-container-highest border border-outline-variant rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@gmail.com"
                className="w-full bg-surface-container dark:bg-surface-container-highest border border-outline-variant rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-surface-container dark:bg-surface-container-highest border border-outline-variant rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white font-label-md text-sm font-bold rounded-xl hover:bg-primary-container transition-all shadow-md mt-2 cursor-pointer"
            >
              {isSignUp ? "Complete Registration" : "Sign In to Account"}
            </button>
          </form>
        )}

        {/* Switch Sign in / Sign up */}
        <div className="text-center w-full mt-2">
          <p className="font-body-md text-xs text-on-surface-variant">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setShowEmailForm(false);
              }}
              className="font-label-md text-xs font-bold text-primary hover:underline transition-colors ml-1 cursor-pointer"
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>

        {/* Demo Fast Bypass */}
        <div className="mt-4 pt-4 border-t border-surface-variant/50 w-full text-center">
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className="text-[11px] font-semibold text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <span>Skip to Dashboard (Guest Mode)</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

      </main>

      {/* Google OAuth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />

    </div>
  );
}
