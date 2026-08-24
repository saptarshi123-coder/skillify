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
      <Navbar title="Quiz Center" />

      <main className="px-4 py-4 space-y-4 w-full">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h2 className="font-headline text-lg font-extrabold text-on-surface dark:text-inverse-on-surface">
            Skill Assessments & Quizzes
          </h2>
          <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim max-w-sm mx-auto">
            Score ≥70% to unlock a verified credential badge & certificate.
          </p>

          {/* Toggle Menu */}
          <div className="flex bg-surface-container-high dark:bg-surface-container-highest rounded-full p-1 w-full max-w-xs mx-auto shadow-sm mt-3">
            <button
              onClick={() => setActiveTab('languages')}
              className={`flex-1 text-center py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'languages'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Languages ({QUIZ_SUBJECTS.languages.length})
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex-1 text-center py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'topics'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Topics ({QUIZ_SUBJECTS.topics.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full mt-3">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-base">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'languages' ? 'Python, C++, Rust...' : 'Data Science, Cloud, ML...'}`}
              className="w-full bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/60 rounded-2xl py-2.5 pl-10 pr-3 text-xs outline-none focus:border-primary shadow-sm"
            />
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-4 shadow-card border border-surface-variant/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-xl">
                        {item.symbol}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
                          {item.name}
                        </h3>
                        {item.isAI && (
                          <span className="text-[9px] font-extrabold bg-gradient-to-r from-primary to-primary-container text-white px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <span className="material-symbols-outlined text-[11px]">psychology</span>
                            <span>AI Engine</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-secondary font-semibold">
                        {item.level} • {item.duration} {item.isAI ? "• NLP Graded" : ""}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    +{item.xpReward} XP
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim line-clamp-2">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => startQuiz(item)}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 ${
                  item.isAI
                    ? 'bg-gradient-to-r from-primary via-primary-container to-primary text-white shadow-md'
                    : 'bg-primary text-white hover:bg-primary-container'
                }`}
              >
                <span>{item.isAI ? 'Start AI Skill Assessment' : 'Start Certification Quiz'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
