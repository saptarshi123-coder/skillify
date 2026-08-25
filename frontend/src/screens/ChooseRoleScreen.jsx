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
    <div className="w-full min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-4 md:p-8 animate-fadeIn transition-colors">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 md:gap-10 py-6 font-mono">
        
        {/* Header */}
        <header className="text-center space-y-3 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-[#D71921] mx-auto flex items-center justify-center shadow-xs mb-2">
            <span className="material-symbols-outlined text-3xl">alt_route</span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Choose Your Path
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-[#8E959E] leading-relaxed">
            Are you here to learn and build, or to discover and hire verified talent?
          </p>
        </header>

        {/* Role Cards Selection Area */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
          
          {/* Student Card */}
          <button
            type="button"
            onClick={() => handleRoleSelect('student')}
            className={`role-card text-left bg-white dark:bg-[#14171A] rounded-3xl p-6 md:p-7 flex flex-col justify-between gap-5 transition-all duration-200 relative overflow-hidden group cursor-pointer border ${
              selectedRole === 'student'
                ? 'border-[#D71921] ring-1 ring-[#D71921] shadow-md dark:shadow-none'
                : 'border-slate-200 dark:border-[#24292F] hover:border-slate-400 dark:hover:border-[#3A3A3A] shadow-card dark:shadow-none'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors border ${
                selectedRole === 'student'
                  ? 'bg-[#D71921] border-[#D71921] text-white'
                  : 'bg-slate-100 dark:bg-[#191D22] border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-white group-hover:text-[#D71921]'
              }`}>
                <span className="material-symbols-outlined text-3xl">
                  school
                </span>
              </div>

              <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                selectedRole === 'student' ? 'border-[#D71921] bg-[#D71921] text-white' : 'border-slate-300 dark:border-[#383E47]'
              }`}>
                {selectedRole === 'student' && (
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] font-mono font-bold text-[#D71921] uppercase tracking-wider block">
                Learner & Builder
              </span>
              <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                I am a Student
              </h2>
              <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] leading-relaxed">
                Build verified skills, take AI quizzes, earn badges, publish projects, and generate ATS resumes.
              </p>
            </div>
          </button>

          {/* HR / Recruiter Card */}
          <button
            type="button"
            onClick={() => handleRoleSelect('recruiter')}
            className={`role-card text-left bg-white dark:bg-[#14171A] rounded-3xl p-6 md:p-7 flex flex-col justify-between gap-5 transition-all duration-200 relative overflow-hidden group cursor-pointer border ${
              selectedRole === 'recruiter'
                ? 'border-[#D71921] ring-1 ring-[#D71921] shadow-md dark:shadow-none'
                : 'border-slate-200 dark:border-[#24292F] hover:border-slate-400 dark:hover:border-[#3A3A3A] shadow-card dark:shadow-none'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors border ${
                selectedRole === 'recruiter'
                  ? 'bg-[#D71921] border-[#D71921] text-white'
                  : 'bg-slate-100 dark:bg-[#191D22] border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-white group-hover:text-[#D71921]'
              }`}>
                <span className="material-symbols-outlined text-3xl">
                  work
                </span>
              </div>

              <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                selectedRole === 'recruiter' ? 'border-[#D71921] bg-[#D71921] text-white' : 'border-slate-300 dark:border-[#383E47]'
              }`}>
                {selectedRole === 'recruiter' && (
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] font-mono font-bold text-[#D71921] uppercase tracking-wider block">
                Talent & Hiring
              </span>
              <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                I am an HR / Recruiter
              </h2>
              <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] leading-relaxed">
                Discover pre-assessed student developers, review verified portfolios & scores, list internships, and manage applications.
              </p>
            </div>
          </button>

        </main>

        {/* Footer / Continue Action */}
        <footer className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            disabled={!selectedRole}
            onClick={handleContinue}
            className={`w-full max-w-sm py-3.5 px-8 rounded-2xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-none ${
              selectedRole
                ? 'bg-[#D71921] hover:bg-[#b0141b] text-white active:scale-95'
                : 'bg-slate-200 dark:bg-[#191D22] text-slate-400 dark:text-[#666666] opacity-50 cursor-not-allowed border border-slate-300 dark:border-[#2D333B]'
            }`}
          >
            <span>CONTINUE AS {selectedRole === 'recruiter' ? 'RECRUITER' : selectedRole === 'student' ? 'STUDENT' : 'SELECTED PATH'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

          <p className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E] text-center">
            You can always switch your perspective anytime in Settings.
          </p>
        </footer>

      </div>
    </div>
  );
}
