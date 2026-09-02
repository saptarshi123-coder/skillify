import React from 'react';
import { useApp } from '../context/AppContext';
import { QUIZ_SUBJECTS } from '../data/quizData';

export default function InternshipApplicationMessageScreen() {
  const { goBack, userProfile, startQuiz } = useApp();

  // The HR has assigned the JavaScript quiz for this Frontend Intern role
  const assignedQuiz = QUIZ_SUBJECTS.languages.find(q => q.id === 'javascript')
    || QUIZ_SUBJECTS.languages[0];

  const handleTakeQuiz = () => {
    startQuiz(assignedQuiz);
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#1f1b16] flex flex-col pb-28">
      {/* Mobile Top App Bar */}
      <header className="w-full top-0 sticky bg-[#fff8f3] flex justify-between items-center px-4 py-4 max-w-screen-xl mx-auto z-40 border-b border-[#eae1d9]">
        <button
          onClick={goBack}
          className="text-[#6f0001] hover:text-[#9a0002] transition-colors flex items-center justify-center p-2 rounded-full hover:bg-[#eae1d9]"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-bold text-xl text-[#6f0001]" style={{ fontFamily: 'Sora, sans-serif' }}>
          Message
        </h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Message Header */}
        <section className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#9a0002] text-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h2 className="text-xl font-semibold text-[#1f1b16] truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Skillify Careers
                </h2>
                <span className="text-xs text-[#635d5a] flex-shrink-0 pt-1" style={{ fontFamily: 'Geist, sans-serif' }}>
                  10:42 AM
                </span>
              </div>
              <p className="text-sm text-[#635d5a] truncate" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                careers@skillify.academic
              </p>
            </div>
          </div>
          <div className="w-full h-px bg-[#eae1d9]" />
          <h3 className="text-xl font-bold text-[#1f1b16]" style={{ fontFamily: 'Sora, sans-serif' }}>
            Internship Application Received
          </h3>
        </section>

        {/* Message Body */}
        <section className="flex flex-col gap-4 text-base leading-relaxed" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
          <p>Dear {userProfile?.name?.split(' ')[0] || 'Alex'},</p>
          <p>
            We have received your application for the <strong>Frontend Intern</strong> role. Thank you for your interest in joining the Skillify Academic team. We are currently reviewing your qualifications and experience.
          </p>
          <p>
            To move forward in the selection process, please complete the required skill assessment quiz below. This assessment has been assigned by our HR team and will help us evaluate your foundational knowledge relevant to the role.
          </p>

          {/* Assessment Card — shows the HR-assigned quiz details */}
          <div className="bg-white border border-[#e4beb8]/50 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
            {/* Quiz info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6f0001]/10 text-[#6f0001] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined">{assignedQuiz.symbol || 'quiz'}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[#1f1b16]" style={{ fontFamily: 'Geist, sans-serif' }}>
                    {assignedQuiz.name} Skills Assessment
                  </h4>
                  {assignedQuiz.isAI && (
                    <span className="text-[9px] font-mono font-bold bg-[#9a0002] text-white px-2 py-0.5 rounded-full">
                      AI Engine
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-[#635d5a]" style={{ fontFamily: 'Geist, sans-serif' }}>
                    {assignedQuiz.level} · {assignedQuiz.duration} · {assignedQuiz.totalQuestions} Questions
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#6f0001] bg-[#6f0001]/10 px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontFamily: 'Geist, sans-serif' }}>
                +{assignedQuiz.xpReward} XP
              </span>
            </div>

            {/* Assigned by HR badge */}
            <div className="flex items-center gap-2 bg-[#f5ece4] rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-[#6f0001]" style={{ fontSize: '16px' }}>verified_user</span>
              <p className="text-xs text-[#5b403c]" style={{ fontFamily: 'Geist, sans-serif' }}>
                Assigned by <strong>HR · Skillify Careers</strong> — required to proceed
              </p>
            </div>

            {/* Take Quiz button — goes straight to the quiz */}
            <button
              onClick={handleTakeQuiz}
              className="w-full bg-[#9a0002] text-white text-sm font-semibold py-3 px-6 rounded-lg hover:bg-[#6f0001] hover:-translate-y-0.5 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
              Start Quiz Now
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </div>

          <p className="mt-2">
            Best regards,<br />
            <span className="font-semibold">The Skillify Careers Team</span>
          </p>
        </section>
      </main>
    </div>
  );
}
