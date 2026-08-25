import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QUIZ_SUBJECTS } from '../data/quizData';
import Navbar from '../components/Navigation/Navbar';

export default function QuizSelectScreen() {
  const { startQuiz, userRole, navigate } = useApp();
  const [activeTab, setActiveTab] = useState('languages'); // 'languages' | 'topics'
  const [searchQuery, setSearchQuery] = useState('');

  // Recruiter guard: No quizzes in HR mode
  React.useEffect(() => {
    if (userRole === 'recruiter' || userRole === 'hr') {
      navigate('recruiter-profile');
    }
  }, [userRole, navigate]);

  const currentList = activeTab === 'languages' ? QUIZ_SUBJECTS.languages : QUIZ_SUBJECTS.topics;

  const filteredList = currentList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="QUIZ CENTER" />

      <main className="px-4 py-4 space-y-4 w-full">

        {/* Header Section */}
        <div className="text-center space-y-2">
          <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Skill Assessments & Quizzes
          </h2>
          <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] max-w-sm mx-auto">
            Score ≥70% to unlock a verified credential badge & certificate.
          </p>

          {/* Toggle Menu */}
          <div className="flex bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-full p-1 w-full max-w-xs mx-auto mt-3">
            <button
              onClick={() => setActiveTab('languages')}
              className={`flex-1 text-center py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'languages'
                  ? 'bg-[#D71921] text-white shadow-none'
                  : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Languages ({QUIZ_SUBJECTS.languages.length})
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex-1 text-center py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'topics'
                  ? 'bg-[#D71921] text-white shadow-none'
                  : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Topics ({QUIZ_SUBJECTS.topics.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full mt-3">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-base">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'languages' ? 'Python, C++, Rust...' : 'Data Science, Cloud, ML...'}`}
              className="w-full bg-white dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2.5 pl-10 pr-3 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] outline-none focus:border-[#D71921] shadow-xs dark:shadow-none"
            />
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        {item.symbol}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {item.name}
                        </h3>
                        {item.isAI && (
                          <span className="text-[9px] font-mono font-bold bg-[#D71921] text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">psychology</span>
                            <span>AI Engine</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                        {item.level} • {item.duration} {item.isAI ? "• NLP Graded" : ""}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#D71921] bg-[#D71921]/15 px-2.5 py-0.5 rounded-full">
                    +{item.xpReward} XP
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-600 dark:text-[#A8AFB8] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => startQuiz(item)}
                className="w-full py-2.5 text-xs font-mono font-bold rounded-2xl transition-all shadow-none flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer bg-[#D71921] hover:bg-[#b0141b] text-white"
              >
                <span>{item.isAI ? 'START AI SKILL ASSESSMENT' : 'START CERTIFICATION QUIZ'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
