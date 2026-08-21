import React from 'react';
import { useApp } from '../context/AppContext';

export default function ExitAppModal() {
  const { isExitModalOpen, setIsExitModalOpen, confirmExitApp } = useApp();

  if (!isExitModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-surface-variant/40 space-y-4 relative text-center">
        
        {/* Icon Header */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-inner border border-primary/20">
          <span className="material-symbols-outlined text-2xl font-bold">
            power_settings_new
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="font-headline text-base font-bold text-on-surface dark:text-inverse-on-surface">
            Exit Skillify AI?
          </h3>
          <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">
            Are you sure you want to close and exit the application?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setIsExitModalOpen(false)}
            className="flex-1 py-2.5 px-3 rounded-xl border border-outline-variant/60 dark:border-outline text-xs font-bold text-on-surface dark:text-inverse-on-surface hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmExitApp}
            className="flex-1 py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md shadow-primary/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Exit App</span>
          </button>
        </div>

      </div>
    </div>
  );
}
