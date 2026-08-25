import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QUIZ_SUBJECTS } from '../data/quizData';
import { COURSES_DATA } from '../data/coursesData';
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

  const previewCourses = COURSES_DATA.slice(0, 3);

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="LEARNING" />

      {/* Main Content Container */}
      <main className="px-4 py-4 space-y-4 w-full">

        {/* Welcome Card */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3">
          <div className="space-y-1">
            <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              HI, {userProfile.name.split(' ')[0]}!
            </h2>
            <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] leading-relaxed">
              Ready to test your code & earn certifications today?
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => navigate('quiz-select')}
              className="flex-1 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold py-2.5 px-3 rounded-2xl transition-all text-center cursor-pointer active:scale-95 shadow-none"
            >
              TAKE A QUIZ →
            </button>
            <button
              onClick={() => navigate('discover')}
              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-800 dark:text-white text-xs font-mono font-bold py-2.5 px-3 rounded-2xl transition-all text-center cursor-pointer active:scale-95"
            >
              PROJECT
            </button>
          </div>
        </div>

        {/* Quick App Services Banner */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => navigate('explore-courses')}
            className="p-2.5 bg-white dark:bg-[#14171A] rounded-2xl border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] dark:hover:border-[#D71921] transition-all text-center space-y-1 shadow-card dark:shadow-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-[#D71921] mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">school</span>
            </div>
            <p className="font-headline text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Courses</p>
            <p className="text-[8px] font-mono text-slate-500 dark:text-[#8E959E]">Explore</p>
          </button>

          <button
            onClick={() => navigate('ai-chat')}
            className="p-2.5 bg-white dark:bg-[#14171A] rounded-2xl border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] dark:hover:border-[#D71921] transition-all text-center space-y-1 shadow-card dark:shadow-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-white mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">smart_toy</span>
            </div>
            <p className="font-headline text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Skille</p>
            <p className="text-[8px] font-mono text-slate-500 dark:text-[#8E959E]">AI Tutor</p>
          </button>

          <button
            onClick={() => navigate('select-skill')}
            className="p-2.5 bg-white dark:bg-[#14171A] rounded-2xl border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] dark:hover:border-[#D71921] transition-all text-center space-y-1 shadow-card dark:shadow-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-white mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">tune</span>
            </div>
            <p className="font-headline text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">My Skills</p>
            <p className="text-[8px] font-mono text-slate-500 dark:text-[#8E959E]">Path</p>
          </button>

          <button
            onClick={() => navigate('explore')}
            className="p-2.5 bg-white dark:bg-[#14171A] rounded-2xl border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] dark:hover:border-[#D71921] transition-all text-center space-y-1 shadow-card dark:shadow-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-white mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">group</span>
            </div>
            <p className="font-headline text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Talent</p>
            <p className="text-[8px] font-mono text-slate-500 dark:text-[#8E959E]">Network</p>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search language, topic or skill test..."
            className="w-full bg-white dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] shadow-xs dark:shadow-none outline-none focus:border-[#D71921] transition-all"
          />
        </div>

        {/* Continue Learning Card */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Continue Learning
            </span>
            <span className="text-[10px] font-mono font-bold text-[#D71921] bg-[#D71921]/15 px-2.5 py-0.5 rounded-full">
              IN PROGRESS
            </span>
          </div>

          {(() => {
            const featuredSkill = userProfile.skillsProgress?.find(s => s.name.toLowerCase().includes('python') || s.name.toLowerCase().includes('data')) || userProfile.skillsProgress?.[0] || { name: "Python for Data Science", progress: 0 };
            const featuredProgress = featuredSkill.progress || 0;
            return (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                    <span className="material-symbols-outlined text-2xl">terminal</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                      {featuredSkill.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E]">
                      {featuredProgress > 0 ? `In Progress • ${featuredProgress}% Complete` : 'Module 1 • 0% Complete'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-[#20252B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D71921] rounded-full transition-all duration-500" style={{ width: `${featuredProgress}%` }}></div>
                </div>
              </>
            );
          })()}

          <button
            onClick={() => startQuiz(QUIZ_SUBJECTS.languages[0])}
            className="w-full py-2.5 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            <span>TEST MODULE KNOWLEDGE</span>
          </button>
        </div>

        {/* Explore Courses & Masterclasses Section */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D71921]/10 text-[#D71921] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">school</span>
              </div>
              <div>
                <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Explore Courses
                </h3>
                <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                  Industry-ready tracks & masterclasses
                </p>
              </div>
            </div>

            {/* Prominent Courses Button */}
            <button
              onClick={() => navigate('explore-courses')}
              className="bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold py-2 px-3.5 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-none"
            >
              <span>COURSES</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

          {/* Featured Courses Carousel / List */}
          <div className="space-y-2.5">
            {previewCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate('explore-courses')}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#191D22] rounded-2xl border border-slate-200 dark:border-[#2D333B] hover:border-[#D71921] cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {course.badge && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-mono text-center py-0.5 font-bold">
                      {course.badge}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                    <span className="text-[#D71921] font-bold uppercase truncate">{course.category}</span>
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      ★ {course.rating}
                    </span>
                  </div>
                  <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                    {course.title}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E] truncate">
                    {course.instructor} • {course.duration}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {course.isFree ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      FREE
                    </span>
                  ) : (
                    <span className="font-headline text-xs font-bold text-slate-900 dark:text-white">
                      ₹{course.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('explore-courses')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-800 dark:text-white text-xs font-mono font-bold rounded-2xl transition-all text-center cursor-pointer active:scale-95 flex items-center justify-center gap-1"
          >
            <span>VIEW ALL COURSES & CERTIFICATIONS →</span>
          </button>
        </div>

        {/* Explore Coding Languages Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Coding Skill Quizzes
            </h3>
            <button
              onClick={() => navigate('quiz-select')}
              className="text-xs font-mono font-bold text-[#D71921] hover:underline"
            >
              VIEW ALL →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {languages.slice(0, 4).map((lang) => (
              <div
                key={lang.id}
                onClick={() => startQuiz(lang)}
                className="bg-white dark:bg-[#14171A] rounded-2xl p-4 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] flex items-center justify-center text-slate-900 dark:text-white mb-2">
                    <span className="material-symbols-outlined text-lg">{lang.icon}</span>
                  </div>
                  <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {lang.name}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E] line-clamp-1 mt-0.5">
                    {lang.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-[#24292F] text-[10px] font-mono">
                  <span className="font-bold text-[#D71921]">+{lang.xpReward} XP</span>
                  <span className="font-semibold text-slate-500 dark:text-[#8E959E]">{lang.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Certifications */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Certificates & Badges ({certificates.length})
            </h3>
            <button
              onClick={() => navigate('badges')}
              className="text-xs font-mono font-bold text-[#D71921] hover:underline"
            >
              SEE ALL →
            </button>
          </div>

          {certificates.slice(0, 2).map((cert) => (
            <div
              key={cert.id}
              onClick={() => setViewingCertificate(cert)}
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#191D22] rounded-2xl border border-slate-200 dark:border-[#2D333B] cursor-pointer hover:border-[#D71921] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                  <span className="material-symbols-outlined text-lg">workspace_premium</span>
                </div>
                <div>
                  <p className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {cert.title}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                    Score: {cert.score} • Verified
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-[#C5C9D0] bg-slate-200 dark:bg-[#20252B] px-2.5 py-0.5 rounded-full">
                EARNED
              </span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
