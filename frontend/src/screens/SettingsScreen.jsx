import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';
import GoogleAuthModal from '../components/GoogleAuthModal';

export default function SettingsScreen() {
  const { darkMode, setDarkMode, navigate, showToast, userProfile, updateProfile, userRole, switchRole, logout } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const isGoogleConnected = userProfile.authProvider === 'google' && userProfile.email && !userProfile.email.includes('guest');

  const isRecruiter = userRole === 'recruiter' || userRole === 'hr';

  const handleDisconnectGoogle = () => {
    updateProfile({ authProvider: 'guest' });
    showToast("Google account disconnected");
  };


  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="Settings" />

      <main className="px-4 py-4 space-y-4 w-full">

        {/* Student Exposure Mode Section */}
        <section className="bg-gradient-to-r from-[#D71921]/15 via-slate-900 to-black rounded-3xl p-5 border border-[#D71921]/50 shadow-card dark:shadow-none space-y-3 text-white">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D71921] text-lg">rocket_launch</span>
              <h2 className="font-headline text-xs font-bold text-white uppercase tracking-wider">
                Student Exposure Mode
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#D71921] text-white px-2.5 py-0.5 rounded-full uppercase">
              Skill Up Portal
            </span>
          </div>

          <div className="flex items-center justify-between py-1 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#D71921] text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-xl">rocket_launch</span>
              </div>
              <div className="min-w-0">
                <p className="font-headline text-xs font-bold text-white truncate">
                  Exposure Mode
                </p>
                <p className="text-[10px] text-slate-300 truncate">
                  Project Ideas, Jobs, HR Outreach & Tracker
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                navigate('exposure-mode');
                showToast("🔥 Entered Student Exposure Mode!", "success");
              }}
              className="text-xs font-bold px-4 py-2 rounded-2xl transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5 bg-[#D71921] hover:bg-[#b0141b] text-white shadow-none"
            >
              <span>Switch to Exposure Mode</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>
        <section className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 space-y-3">
          <h2 className="font-headline text-xs font-bold text-primary border-b border-surface-variant/40 pb-2">
            Account & Security
          </h2>

          {/* Google Account */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-surface-container-highest dark:bg-surface-container-low flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">
                  Google Account
                </p>
                <p className="text-[10px] text-secondary truncate">
                  {isGoogleConnected ? userProfile.email : "Not Connected"}
                </p>
              </div>
            </div>

            {isGoogleConnected ? (
              <button
                onClick={handleDisconnectGoogle}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all shrink-0 bg-error/10 hover:bg-error/20 text-error cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => setIsGoogleModalOpen(true)}
                className="text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all shrink-0 bg-primary hover:bg-primary-container text-white cursor-pointer active:scale-95 shadow-xs"
              >
                Connect
              </button>
            )}
          </div>


          {/* Change Password */}
          <div
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-between py-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-xl p-1 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container-highest dark:bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">lock</span>
              </div>
              <div>
                <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                  Change Password
                </p>
                <p className="text-[10px] text-secondary">
                  Update your security login
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-base">chevron_right</span>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 space-y-3">
          <h2 className="font-headline text-xs font-bold text-primary border-b border-surface-variant/40 pb-2">
            App Preferences
          </h2>

          {/* Dark Mode */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container-highest dark:bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">dark_mode</span>
              </div>
              <div>
                <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                  Dark Mode Theme
                </p>
                <p className="text-[10px] text-secondary">
                  High contrast dark palette
                </p>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${darkMode ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'
                }`}
            >
              <div className="bg-white w-5 h-5 rounded-full shadow-md"></div>
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container-highest dark:bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">notifications</span>
              </div>
              <div>
                <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                  Quiz & Streak Alerts
                </p>
                <p className="text-[10px] text-secondary">
                  Daily study reminders
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setNotificationsEnabled(!notificationsEnabled);
                showToast(notificationsEnabled ? "Notifications muted" : "Notifications enabled");
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${notificationsEnabled ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'
                }`}
            >
              <div className="bg-white w-5 h-5 rounded-full shadow-md"></div>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container-highest dark:bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">language</span>
              </div>
              <div>
                <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                  Interface Language
                </p>
                <p className="text-[10px] text-secondary">
                  {selectedLanguage}
                </p>
              </div>
            </div>

            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                showToast(`Language set to ${e.target.value}`);
              }}
              className="bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl px-2 py-1 text-xs outline-none"
            >
              <option value="English (US)">English</option>
              <option value="Spanish (ES)">Spanish</option>
              <option value="French (FR)">French</option>
              <option value="German (DE)">German</option>
            </select>
          </div>
        </section>

        {/* Sign Out */}
        <section className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40">
          <button
            onClick={logout}
            className="w-full py-3 bg-error/10 hover:bg-error/20 text-error text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Sign Out from Skillify</span>
          </button>
        </section>

      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-outline-variant space-y-3">
            <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
              Change Security Password
            </h3>
            <input
              type="password"
              placeholder="Current Password"
              className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant rounded-xl py-2 px-3 text-xs outline-none"
            />
            <input
              type="password"
              placeholder="New Password (8+ chars)"
              className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant rounded-xl py-2 px-3 text-xs outline-none"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-2 border border-outline-variant rounded-xl text-xs font-bold text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  showToast("🔒 Password updated successfully!");
                }}
                className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google OAuth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />

    </div>
  );
}
