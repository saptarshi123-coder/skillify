import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  return null;
  const { toast } = useApp();

  if (!toast || !toast.show || !toast.message) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 animate-bounce">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-md ${isError
            ? 'bg-error-container text-on-error-container border-error/30'
            : 'bg-primary text-on-primary border-primary-container shadow-primary/20'
          }`}
      >
        <span className="material-symbols-outlined text-xl">
          {isError ? 'error' : 'check_circle'}
        </span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
