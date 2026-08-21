import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Navbar({ title, showBack = false, onBack }) {
  const { navigate, goBack, userProfile, darkMode, setDarkMode } = useApp();

  const handleBack = () => {
    if (onBack) onBack();
    else goBack();
  };

  return (
    <header className="sticky top-0 left-0 w-full z-40 bg-surface/95 backdrop-blur-md border-b border-surface-variant/40 shadow-sm h-14 flex items-center justify-between px-4 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack ? (
          <button
            onClick={handleBack}
            aria-label="Go Back"
            className="w-9 h-9 flex items-center justify-center text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full active:scale-95 transition-all -ml-1 shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/30 active:scale-95 transition-transform shrink-0 shadow-sm cursor-pointer"
          >
            <img
              alt={userProfile.name}
              src={userProfile.avatar}
              className="w-full h-full object-cover"
            />
          </button>
        )}

        <h1 className="font-headline font-bold text-base md:text-lg text-primary truncate">
          {title || "Skillify"}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Quick Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-symbols-outlined text-xl">
            {darkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Badges Button */}
        <button
          onClick={() => navigate('badges')}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-500/20 dark:to-orange-500/20 text-white hover:opacity-95 px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-95 border border-amber-400/60 dark:border-amber-400/50 shadow-xs"
          title="Badges & Achievements"
        >
          <span className="material-symbols-outlined text-base icon-filled text-amber-100 dark:text-amber-400">workspace_premium</span>
          <span className="font-label-sm text-[11px] font-bold text-white">Badges</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => navigate('settings')}
          className="w-8 h-8 flex items-center justify-center text-on-surface-variant dark:text-secondary-fixed-dim hover:text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
          title="Settings"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
      </div>
    </header>
  );
}
