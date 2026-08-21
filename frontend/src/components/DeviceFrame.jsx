import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function DeviceFrame({ children }) {
  const { deviceFrameMode, setDeviceFrameMode } = useApp();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      hours = hours % 12 || 12;
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${hours}:${minutesStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen ${deviceFrameMode ? 'bg-[#181615] flex flex-col items-center justify-center p-2 md:p-8' : 'w-full'}`}>
      
      {/* Floating Viewport Switcher for Desktop / Reviewers */}
      <div className="hidden md:flex fixed top-4 right-4 z-50 bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-md border border-outline-variant/40 rounded-full px-3 py-1.5 shadow-xl items-center gap-2">
        <span className="font-label-sm text-[11px] font-bold text-on-surface-variant dark:text-secondary-fixed-dim px-1">
          View Mode:
        </span>
        <button
          onClick={() => setDeviceFrameMode(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-xs font-bold transition-all ${
            !deviceFrameMode
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-primary'
          }`}
          title="Responsive full screen view"
        >
          <span className="material-symbols-outlined text-sm">desktop_windows</span>
          <span>Responsive</span>
        </button>

        <button
          onClick={() => setDeviceFrameMode(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-xs font-bold transition-all ${
            deviceFrameMode
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:text-primary'
          }`}
          title="Simulated iPhone 15 Pro mobile frame view"
        >
          <span className="material-symbols-outlined text-sm">smartphone</span>
          <span>Mobile Device</span>
        </button>
      </div>

      {/* Conditional Mobile Device Bezel Frame */}
      {deviceFrameMode ? (
        <div className="relative w-full max-w-[400px] h-[860px] bg-black rounded-[52px] p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-[5px] border-[#383533] flex flex-col overflow-hidden ring-1 ring-white/20">
          
          {/* Hardware Buttons on side */}
          <div className="absolute -left-[9px] top-28 w-[4px] h-10 bg-[#4a4744] rounded-l-sm"></div>
          <div className="absolute -left-[9px] top-44 w-[4px] h-12 bg-[#4a4744] rounded-l-sm"></div>
          <div className="absolute -left-[9px] top-60 w-[4px] h-12 bg-[#4a4744] rounded-l-sm"></div>
          <div className="absolute -right-[9px] top-36 w-[4px] h-16 bg-[#4a4744] rounded-r-sm"></div>

          {/* Screen Inner Viewport */}
          <div className="relative w-full h-full bg-background dark:bg-inverse-surface rounded-[40px] overflow-y-auto hide-scrollbar flex flex-col">
            
            {/* iOS Dynamic Island & Status Bar */}
            <div className="sticky top-0 left-0 w-full z-50 h-11 bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-md px-6 flex items-center justify-between pointer-events-none select-none">
              <span className="font-label-sm text-xs font-bold text-on-surface dark:text-white">
                {currentTime || '9:41'}
              </span>

              {/* Dynamic Island */}
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10"></div>
                <div className="w-2 h-2 rounded-full bg-[#052b05]"></div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-on-surface dark:text-white">
                <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
                <span className="material-symbols-outlined text-[14px]">wifi</span>
                <span className="material-symbols-outlined text-[16px]">battery_full</span>
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 w-full pb-10">
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="sticky bottom-0 left-0 w-full h-5 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md flex items-center justify-center pointer-events-none z-50">
              <div className="w-32 h-1 bg-on-surface/40 dark:bg-white/40 rounded-full"></div>
            </div>

          </div>
        </div>
      ) : (
        /* Full responsive viewport */
        <div className="w-full flex-1">
          {children}
        </div>
      )}

    </div>
  );
}
