import React from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function QuizResultsScreen() {
  const { quizResult, startQuiz, issueCertificate, navigate, certificates } = useApp();

  if (!quizResult) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm">No recent quiz results found.</p>
          <button onClick={() => navigate('select-skill')} className="mt-3 bg-primary text-white text-xs font-bold py-2 px-4 rounded-xl">
            Choose a Skill
          </button>
        </div>
      </div>
    );
  }

  const {
    subject = {},
    scorePercent = 0,
    correctCount = 0,
    incorrectCount = 0,
    timeFormatted = "0m 30s",
    strengths = [],
    weakAreas = [],
    passed = false
  } = quizResult;

  const circumference = 282.74;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  const alreadyHasCert = certificates.some(c => c.category === subject?.name || (subject?.name && c.title.includes(subject.name)));

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar
        title="Assessment Results"
        showBack={true}
        onBack={() => navigate('select-skill')}
      />

      <main className="px-4 py-4 space-y-4 w-full">
        
        {/* Results Header Card */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 flex flex-col items-center text-center space-y-3">
          
          {/* Passed / Failed Badge */}
          {passed ? (
            <span className="bg-emerald-500/10 text-emerald-600 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>EXAM PASSED (CERTIFIED)</span>
            </span>
          ) : (
            <span className="bg-error/10 text-error text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">cancel</span>
              <span>NEEDS IMPROVEMENT (SCORE &lt; 70%)</span>
            </span>
          )}

          {/* Subject Title */}
          <div>
            <h2 className="font-headline text-lg font-extrabold text-on-surface dark:text-inverse-on-surface">
              {subject.name} Skill Assessment
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">
              {passed
                ? "Congratulations! You've verified competency in this skill."
                : "Review the question feedback below and test again."}
            </p>
          </div>

          {/* Circular Score Gauge */}
          <div className="relative w-36 h-36 my-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-surface-variant/40 stroke-current"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
              />
              <circle
                className={`${passed ? 'text-primary' : 'text-error'} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline text-2xl font-black text-on-surface dark:text-inverse-on-surface">
                {scorePercent}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
                Accuracy
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 w-full pt-1">
            <div className="p-2 rounded-xl bg-surface dark:bg-inverse-surface/40">
              <p className="text-[10px] text-secondary">Correct</p>
              <p className="font-headline text-xs font-bold text-emerald-600">
                {correctCount}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-surface dark:bg-inverse-surface/40">
              <p className="text-[10px] text-secondary">Incorrect</p>
              <p className="font-headline text-xs font-bold text-error">
                {incorrectCount}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-surface dark:bg-inverse-surface/40">
              <p className="text-[10px] text-secondary">Time Spent</p>
              <p className="font-headline text-xs font-bold text-primary">
                {timeFormatted}
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="w-full space-y-2 pt-2">
            {passed && (
              <button
                onClick={issueCertificate}
                className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">workspace_premium</span>
                <span>{alreadyHasCert ? "View Official Certificate" : "Claim & View Certificate"}</span>
              </button>
            )}

            {/* Loop Back to Choose a Skill Page */}
            <button
              onClick={() => navigate('select-skill')}
              className="w-full py-3 bg-gradient-to-r from-primary via-primary-container to-primary text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">school</span>
              <span>Choose Another Skill (Take Next Quiz) →</span>
            </button>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => startQuiz(subject)}
                className="flex-1 py-2.5 bg-surface-container-high dark:bg-surface-container-highest hover:bg-primary hover:text-white text-on-surface text-xs font-bold rounded-xl transition-all"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => navigate('dashboard')}
                className="flex-1 py-2.5 border border-outline-variant/60 text-secondary text-xs font-bold rounded-xl hover:text-primary transition-all"
              >
                Skip to Dashboard
              </button>
            </div>
          </div>

        </div>

        {/* Strengths & Weaknesses */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-3">
          <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
            Performance Breakdown
          </h3>

          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">check</span>
                <span>Demonstrated Strengths</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((st, i) => (
                  <span key={i} className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
                    {st}
                  </span>
                ))}
              </div>
            </div>

            {weakAreas.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-amber-600 mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  <span>Recommended for Review</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weakAreas.map((wk, i) => (
                    <span key={i} className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-medium">
                      {wk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Question Review (if available) */}
        {quizResult.review && quizResult.review.length > 0 && (
          <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-3">
            <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">fact_check</span>
              <span>AI Exam Question Review ({quizResult.review.length})</span>
            </h3>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {quizResult.review.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                    item.correct
                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20'
                      : 'border-error/30 bg-error/5 dark:bg-error/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-on-surface dark:text-inverse-on-surface leading-snug">
                      <span className="text-secondary font-mono mr-1">Q{item.question_number || idx + 1}.</span>
                      {item.question}
                    </p>
                    <span className={`material-symbols-outlined text-base shrink-0 ${item.correct ? 'text-emerald-600' : 'text-error'}`}>
                      {item.correct ? 'check_circle' : 'cancel'}
                    </span>
                  </div>

                  {!item.correct && (
                    <div className="space-y-0.5 text-[11px] pt-1 border-t border-surface-variant/40">
                      <p className="text-error font-medium">
                        Your answer: <span className="font-mono">{String(item.user_answer || '(No answer)')}</span>
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Correct answer: <span className="font-mono">{String(item.correct_answer)}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
