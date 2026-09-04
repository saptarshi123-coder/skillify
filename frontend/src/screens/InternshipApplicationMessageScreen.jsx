import React from 'react';
import { useApp } from '../context/AppContext';
import { QUIZ_SUBJECTS } from '../data/quizData';
import Navbar from '../components/Navigation/Navbar';

export default function InternshipApplicationMessageScreen() {
  const { goBack, userProfile, startQuiz } = useApp();

  // The HR has assigned the JavaScript quiz for this Frontend Intern role
  const assignedQuiz = QUIZ_SUBJECTS.languages.find(q => q.id === 'javascript')
    || QUIZ_SUBJECTS.languages[0];

  const handleTakeQuiz = () => {
    startQuiz(assignedQuiz);
  };

  return (
    <div className="w-full min-h-screen bg-background dark:bg-black text-on-surface dark:text-white flex flex-col pb-28 transition-colors">
      {/* Top Navbar with Dark Mode Converter */}
      <Navbar title="APPLICATION" showBack onBack={goBack} />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Message Header */}
        <section className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#D71921] border border-[#D71921] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  Skillify Careers
                </h2>
                <span className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E] flex-shrink-0 pt-0.5">
                  10:42 AM
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E] truncate">
                careers@skillify.academic
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-slate-200 dark:bg-[#24292F]" />

          <h3 className="font-headline text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            Internship Application Received
          </h3>
        </section>

        {/* Message Body */}
        <section className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>Dear {userProfile?.name?.split(' ')[0] || 'Alex'},</p>
          <p>
            We have received your application for the <strong className="text-slate-900 dark:text-white font-semibold">Frontend Intern</strong> role. Thank you for your interest in joining the Skillify Academic team. We are currently reviewing your qualifications and experience.
          </p>
          <p>
            To move forward in the selection process, please complete the required skill assessment quiz below. This assessment has been assigned by our HR team and will help us evaluate your foundational knowledge relevant to the role.
          </p>

          {/* Assessment Card — shows the HR-assigned quiz details */}
          <div className="bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] rounded-2xl md:rounded-3xl p-5 space-y-4 shadow-card dark:shadow-none">
            {/* Quiz info */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#D71921]/10 dark:bg-[#D71921]/20 border border-[#D71921]/30 text-[#D71921] dark:text-[#FF8B8D] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">{assignedQuiz.symbol || 'quiz'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {assignedQuiz.name} Skills Assessment
                  </h4>
                  {assignedQuiz.isAI && (
                    <span className="text-[9px] font-mono font-bold bg-[#D71921] text-white px-2 py-0.5 rounded-full">
                      AI Engine
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E]">
                    {assignedQuiz.level} · {assignedQuiz.duration} · {assignedQuiz.totalQuestions} Questions
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#D71921] dark:text-[#FF8B8D] bg-[#D71921]/10 dark:bg-[#D71921]/20 border border-[#D71921]/30 px-2.5 py-1 rounded-full flex-shrink-0">
                +{assignedQuiz.xpReward} XP
              </span>
            </div>

            {/* Assigned by HR badge */}
            <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-xl px-3.5 py-2.5">
              <span className="material-symbols-outlined text-[#D71921] dark:text-[#FF8B8D]" style={{ fontSize: '18px' }}>verified_user</span>
              <p className="text-xs text-slate-600 dark:text-[#8E959E] font-mono">
                Assigned by <strong className="text-slate-900 dark:text-white font-semibold">HR · Skillify Careers</strong> — required to proceed
              </p>
            </div>

            {/* Take Quiz button — goes straight to the quiz */}
            <button
              onClick={handleTakeQuiz}
              className="w-full bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold py-3 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">play_arrow</span>
              START QUIZ NOW
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>

          <p className="pt-2 text-slate-600 dark:text-[#8E959E]">
            Best regards,<br />
            <span className="text-slate-900 dark:text-white font-semibold">The Skillify Careers Team</span>
          </p>
        </section>
      </main>
    </div>
  );
}

