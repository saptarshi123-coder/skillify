import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QUIZ_SUBJECTS } from '../data/quizData';
import Navbar from '../components/Navigation/Navbar';

export default function CompanyBasedQuizScreen() {
  const { startQuiz, navigate } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'MAANG / Big Tech', 'MNC & Placement', 'AI / Hardware', 'Cloud & Infra'];

  const companyQuizzes = QUIZ_SUBJECTS.company || [];

  const filteredQuizzes = companyQuizzes.filter((quiz) => {
    const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
    const matchesSearch =
      quiz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.tag.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full pb-24 transition-colors min-h-screen bg-slate-900/5 dark:bg-[#0f1115]">
      <Navbar title="COMPANY QUIZZES" showBack onBack={() => navigate('quiz-select')} />

      <main className="px-4 py-4 space-y-5 w-full max-w-2xl mx-auto">
        
        {/* Top Category Nav Tabs (Matching Stitch design) */}
        <div className="flex bg-white dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-full p-1 w-full max-w-sm mx-auto shadow-card">
          <button
            onClick={() => navigate('explore-courses')}
            className="flex-1 text-center py-2 rounded-full text-xs font-mono font-bold text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">school</span>
            <span>Courses</span>
          </button>

          <button
            onClick={() => navigate('quiz-select')}
            className="flex-1 text-center py-2 rounded-full text-xs font-mono font-bold text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">code</span>
            <span>Languages</span>
          </button>

          <button
            onClick={() => {}}
            className="flex-1 text-center py-2 rounded-full text-xs font-mono font-bold bg-[#D71921] text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">business</span>
            <span>Company</span>
          </button>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-900 p-6 rounded-3xl border border-red-500/30 text-white space-y-3 relative overflow-hidden shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600 text-white px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-xs">local_fire_department</span>
              Company Assessment Prep
            </span>
            <span className="text-xs text-red-200 font-mono">Skillify Recruiter Direct-Track</span>
          </div>

          <h1 className="font-headline text-lg md:text-xl font-bold text-white leading-snug">
            Target Company Mocks & Diagnostic Exams
          </h1>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            Standardized technical diagnostic rounds modeled on actual Google, Amazon, NVIDIA, TCS NQT, and Capgemini interview patterns.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs font-mono text-red-200">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#D71921]">verified</span>
              Direct HR Referral Tag
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#D71921]">psychology</span>
              NLP Code Evaluated
            </span>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Google, Amazon, NVIDIA, TCS NQT..."
            className="w-full bg-white dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-3 pl-10 pr-10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] outline-none focus:border-[#D71921] shadow-card dark:shadow-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-[#D71921] text-white shadow-sm'
                    : 'bg-white dark:bg-[#191D22] text-slate-700 dark:text-[#C5C9D0] border border-slate-200 dark:border-[#2D333B] hover:bg-slate-50 dark:hover:bg-[#20252B]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Company Quizzes List */}
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-4 hover:border-[#D71921] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-slate-800 shadow-md">
                      <span className="material-symbols-outlined text-2xl text-[#D71921]">{quiz.symbol}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold bg-[#D71921]/15 text-[#D71921] px-2.5 py-0.5 rounded-full">
                          {quiz.company}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {quiz.level}
                        </span>
                      </div>
                      <h3 className="font-headline text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                        {quiz.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-500 flex items-center gap-0.5 justify-end">
                      <span className="material-symbols-outlined text-sm fill-1">star</span>
                      {quiz.rating || "4.9"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">({quiz.candidatesCount || "10k"} candidates)</span>
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-600 dark:text-[#A8AFB8] leading-relaxed">
                  {quiz.description}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-[#24292F] text-[11px] font-mono text-slate-500 dark:text-[#8E959E] text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#191D22]">
                    <span className="block text-[10px] text-slate-400">Questions</span>
                    <span className="font-bold text-slate-900 dark:text-white">{quiz.totalQuestions} Qs</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#191D22]">
                    <span className="block text-[10px] text-slate-400">Duration</span>
                    <span className="font-bold text-slate-900 dark:text-white">{quiz.duration}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#191D22]">
                    <span className="block text-[10px] text-slate-400">Pass Rate</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{quiz.passRate || "85%"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => startQuiz(quiz)}
                className="w-full py-3 text-xs font-mono font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer bg-[#D71921] hover:bg-[#b0141b] text-white"
              >
                <span>START ASSESSMENT ROUND</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
