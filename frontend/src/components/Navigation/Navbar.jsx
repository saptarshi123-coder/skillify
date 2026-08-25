import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Navbar({ title, showBack = false, onBack }) {
  const { navigate, goBack, userProfile, userRole, darkMode, setDarkMode } = useApp();

  const isRecruiter = userRole === 'recruiter' || userRole === 'hr';

  const handleBack = () => {
    if (onBack) onBack();
    else goBack();
  };

  return (
    <header className="sticky top-0 left-0 w-full z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200 dark:border-[#222222] shadow-xs dark:shadow-none h-14 flex items-center justify-between px-4 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack ? (
          <button
            onClick={handleBack}
            aria-label="Go Back"
            className="w-8 h-8 flex items-center justify-center text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full active:scale-95 transition-all -ml-1 shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        ) : (
          <button
            onClick={() => navigate(isRecruiter ? 'recruiter-profile' : 'profile')}
            className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 dark:border-white/20 active:scale-95 transition-transform shrink-0 cursor-pointer"
          >
            <img
              alt={userProfile.name}
              src={userProfile.avatar}
              className="w-full h-full object-cover"
            />
          </button>
        )}

        <h1 className="font-headline font-bold text-sm md:text-base text-[#D71921] uppercase tracking-wider truncate">
          {title || "SKILLIFY"}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Quick Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-[#A0A0A0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-symbols-outlined text-lg">
            {darkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Badges Button (Only visible in Student Mode; removed in HR Mode) */}
        {!isRecruiter && (
          <button
            onClick={() => navigate('badges')}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-black/60 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-[#A0A0A0] dark:hover:text-white px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-95 border border-slate-300 dark:border-white/20"
            title="Badges & Achievements"
          >
            <span className="material-symbols-outlined text-xs">workspace_premium</span>
            <span className="font-mono text-[10px] uppercase font-bold">Badges</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={() => navigate('settings')}
          className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-[#A0A0A0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
          title="Settings"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
        </button>
      </div>
    </header>
  );
}
