import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QUIZ_SUBJECTS } from '../data/quizData';
import Navbar from '../components/Navigation/Navbar';

export default function DashboardScreen() {
  const { userProfile, userRole, startQuiz, navigate, setViewingCertificate, certificates } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // HR / Recruiter Guard: No learning tracks or quizzes for HR users
  React.useEffect(() => {
    if (userRole === 'recruiter' || userRole === 'hr') {
      navigate('recruiter-profile');
    }
  }, [userRole, navigate]);

  const languages = QUIZ_SUBJECTS.languages.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="Dashboard" />

      {/* Main Content Container */}
      <main className="px-4 py-4 space-y-4 w-full">
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary via-primary-container to-primary text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-headline text-xl font-extrabold tracking-tight">
              Hi, {userProfile.name.split(' ')[0]}!
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Ready to test your code & earn certifications today?
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate('quiz-select')}
                className="flex-1 bg-white text-primary text-xs font-bold py-2.5 px-3 rounded-xl shadow hover:bg-cream-vanilla transition-colors text-center"
              >
                Take a Quiz →
              </button>
              <button
                onClick={() => navigate('discover')}
                className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors text-center"
              >
                Discover Projects
              </button>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-sm pointer-events-none"></div>
        </div>

        {/* Quick App Services Banner */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate('ai-chat')}
            className="p-3 bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl border border-surface-variant/40 hover:border-primary transition-all text-center space-y-1 shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>smart_toy</span>
            </div>
            <p className="font-headline text-[11px] font-bold text-on-surface dark:text-inverse-on-surface">Skillie AI</p>
            <p className="text-[9px] text-secondary">Code Tutor</p>
          </button>

          <button
            onClick={() => navigate('select-skill')}
            className="p-3 bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl border border-surface-variant/40 hover:border-primary transition-all text-center space-y-1 shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">tune</span>
            </div>
            <p className="font-headline text-[11px] font-bold text-on-surface dark:text-inverse-on-surface">My Skills</p>
            <p className="text-[9px] text-secondary">Choose Path</p>
          </button>

          <button
            onClick={() => navigate('explore')}
            className="p-3 bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl border border-surface-variant/40 hover:border-primary transition-all text-center space-y-1 shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">group</span>
            </div>
            <p className="font-headline text-[11px] font-bold text-on-surface dark:text-inverse-on-surface">Talent</p>
            <p className="text-[9px] text-secondary">Network</p>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search language, topic or skill test..."
            className="w-full bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/60 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-on-background dark:text-inverse-on-surface shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Continue Learning Card */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40">
          <div className="flex items-center justify-between mb-3">
            <span className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
              Continue Learning
            </span>
            <span className="text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              In Progress
            </span>
          </div>

          {(() => {
            const featuredSkill = userProfile.skillsProgress?.find(s => s.name.toLowerCase().includes('python') || s.name.toLowerCase().includes('data')) || userProfile.skillsProgress?.[0] || { name: "Python for Data Science", progress: 0 };
            const featuredProgress = featuredSkill.progress || 0;
            return (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold">
                    <span className="material-symbols-outlined text-2xl">terminal</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface truncate">
                      {featuredSkill.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">
                      {featuredProgress > 0 ? `In Progress • ${featuredProgress}% Complete` : 'Module 1 • 0% Complete'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-surface-container-high dark:bg-surface-container-highest rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${featuredProgress}%` }}></div>
                </div>
              </>
            );
          })()}

          <button
            onClick={() => startQuiz(QUIZ_SUBJECTS.languages[0])}
            className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            <span>Test Module Knowledge</span>
          </button>
        </div>

        {/* Explore Coding Languages Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
              Coding Skill Quizzes
            </h3>
            <button
              onClick={() => navigate('quiz-select')}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {languages.slice(0, 4).map((lang) => (
              <div
                key={lang.id}
                onClick={() => startQuiz(lang)}
                className="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-3.5 shadow-card border border-surface-variant/40 hover:border-primary cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <span className="material-symbols-outlined text-lg">{lang.icon}</span>
                  </div>
                  <h4 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                    {lang.name}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim line-clamp-1 mt-0.5">
                    {lang.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-variant/30 text-[10px]">
                  <span className="font-bold text-primary">+{lang.xpReward} XP</span>
                  <span className="font-semibold text-secondary">{lang.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Certifications in SQLite */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
              Certificates & Badges ({certificates.length})
            </h3>
            <button
              onClick={() => navigate('badges')}
              className="text-xs font-bold text-primary hover:underline"
            >
              See All →
            </button>
          </div>

          {certificates.slice(0, 2).map((cert) => (
            <div
              key={cert.id}
              onClick={() => setViewingCertificate(cert)}
              className="flex items-center justify-between p-3 bg-surface dark:bg-inverse-surface/60 rounded-2xl border border-surface-variant/40 cursor-pointer hover:border-primary transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <span className="material-symbols-outlined text-lg icon-filled">workspace_premium</span>
                </div>
                <div>
                  <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                    {cert.title}
                  </p>
                  <p className="text-[10px] text-secondary font-medium">
                    Score: {cert.score} • Verified
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Earned
              </span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
