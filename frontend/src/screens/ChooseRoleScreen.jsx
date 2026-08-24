import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ChooseRoleScreen() {
  const { selectUserRole, showToast } = useApp();
  const [selectedRole, setSelectedRole] = useState(null); // 'student' | 'recruiter'

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      showToast('Please select a path to continue', 'error');
      return;
    }
    selectUserRole(selectedRole);
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-4 md:p-8 selection:bg-primary-container selection:text-on-primary-container animate-fadeIn">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 md:gap-10 py-6">
        
        {/* Header */}
        <header className="text-center space-y-3 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-inner mb-2">
            <span className="material-symbols-outlined text-3xl font-bold">alt_route</span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-black text-on-surface dark:text-inverse-on-surface tracking-tight">
            Choose Your Path
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">
            Are you here to learn and build, or to discover and hire verified talent?
          </p>
        </header>

        {/* Role Cards Selection Area */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
          
          {/* Student Card */}
          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            className={`role-card text-left bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-6 md:p-7 flex flex-col justify-between gap-5 transition-all duration-300 relative overflow-hidden group cursor-pointer border-2 ${
              selectedRole === 'student'
                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg -translate-y-1 ring-2 ring-primary/30'
                : 'border-outline-variant/40 hover:border-primary/40 hover:shadow-md'
            }`}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start justify-between">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                selectedRole === 'student' ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
              }`}>
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  school
                </span>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedRole === 'student' ? 'border-primary bg-primary text-white' : 'border-outline-variant/60'
              }`}>
                {selectedRole === 'student' && (
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                Learner & Builder
              </span>
              <h2 className="font-headline text-lg font-bold text-on-surface dark:text-inverse-on-surface">
                I am a Student
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">
                Build verified skills, take AI quizzes, earn cryptographic badges, publish projects, and generate ATS resumes.
              </p>
            </div>

            <div className={`pt-2 flex items-center text-primary font-bold text-xs transition-opacity ${
              selectedRole === 'student' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <span>Select Student Path</span>
              <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </div>
          </button>

          {/* HR / Recruiter Card */}
          <button
            type="button"
            onClick={() => handleRoleSelect('recruiter')}
            className={`role-card text-left bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-6 md:p-7 flex flex-col justify-between gap-5 transition-all duration-300 relative overflow-hidden group cursor-pointer border-2 ${
              selectedRole === 'recruiter'
                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg -translate-y-1 ring-2 ring-primary/30'
                : 'border-outline-variant/40 hover:border-primary/40 hover:shadow-md'
            }`}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start justify-between">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                selectedRole === 'recruiter' ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
              }`}>
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  work
                </span>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedRole === 'recruiter' ? 'border-primary bg-primary text-white' : 'border-outline-variant/60'
              }`}>
                {selectedRole === 'recruiter' && (
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                Talent & Hiring
              </span>
              <h2 className="font-headline text-lg font-bold text-on-surface dark:text-inverse-on-surface">
                I am an HR / Recruiter
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">
                Discover pre-assessed student developers, review verified portfolios & scores, list internships, and manage applications.
              </p>
            </div>

            <div className={`pt-2 flex items-center text-primary font-bold text-xs transition-opacity ${
              selectedRole === 'recruiter' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <span>Select Recruiter Path</span>
              <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </div>
          </button>

        </main>

        {/* Footer / Continue Action */}
        <footer className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            disabled={!selectedRole}
            onClick={handleContinue}
            className={`w-full max-w-sm py-3.5 px-8 rounded-2xl font-headline text-xs font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              selectedRole
                ? 'bg-gradient-to-r from-primary to-primary-container text-white hover:shadow-lg active:scale-95'
                : 'bg-surface-container-high text-secondary opacity-50 cursor-not-allowed'
            }`}
          >
            <span>Continue as {selectedRole === 'recruiter' ? 'Recruiter' : selectedRole === 'student' ? 'Student' : 'Selected Path'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

          <p className="text-[11px] text-secondary text-center">
            You can always switch your perspective anytime in Settings.
          </p>
        </footer>

      </div>
    </div>
  );
}
