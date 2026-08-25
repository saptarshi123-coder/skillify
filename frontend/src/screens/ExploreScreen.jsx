import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STUDENTS_DATA } from '../data/studentsData';
import Navbar from '../components/Navigation/Navbar';

export default function ExploreScreen() {
  const { openPublicProfile, copyPublicProfileLink, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Computer Science', 'Data Science', 'Cloud & DevOps', 'Cybersecurity', 'Web Dev'];

  const filteredStudents = STUDENTS_DATA.filter(s => {
    const matchCategory = activeFilter === 'All' ||
      s.major.toLowerCase().includes(activeFilter.toLowerCase()) ||
      s.skills.some(sk => sk.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.skills.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const handleConnect = (studentName) => {
    showToast(`🤝 Connection request sent to ${studentName}!`);
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="EXPLORE TALENT" />

      <main className="px-4 py-4 space-y-4 w-full">

        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="font-headline text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            EXPLORE TALENT
          </h1>
          <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E]">
            Connect with student developers, peer coders & view verified public profiles
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="w-full bg-white dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2.5 pl-10 pr-10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] outline-none focus:border-[#D71921] shadow-xs dark:shadow-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] hover:text-slate-700 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === cat
                  ? 'bg-transparent border border-[#D71921] text-[#D71921] font-bold'
                  : 'bg-white dark:bg-[#16181A] text-slate-600 dark:text-[#B0B4BA] border border-slate-200 dark:border-[#2C3036] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-3.5 transition-all"
            >
              {/* Header Info */}
              <div className="flex items-start gap-3.5">
                <div
                  onClick={() => openPublicProfile(student)}
                  className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#2D333B] shrink-0 cursor-pointer"
                >
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2
                      onClick={() => openPublicProfile(student)}
                      className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate cursor-pointer hover:text-[#D71921] transition-colors"
                    >
                      {student.name}
                    </h2>
                    <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-[#8E959E] bg-slate-100 dark:bg-[#20252B] border border-slate-200 dark:border-[#2D333B] px-2.5 py-0.5 rounded-full shrink-0">
                      Lvl {student.level}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E] truncate mt-0.5">
                    {student.major} • {student.college}
                  </p>

                  {/* Monochrome Outline Badges */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-700 dark:text-[#C5C9D0] bg-slate-100 dark:bg-[#111315] border border-slate-300 dark:border-[#383E47] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">emoji_events</span>
                      <span>{student.honorsBadge || 'Honors Roll'}</span>
                    </span>
                    {student.lookingForInternships && (
                      <span className="text-[10px] font-mono text-slate-700 dark:text-[#C5C9D0] bg-slate-100 dark:bg-[#111315] border border-slate-300 dark:border-[#383E47] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">work</span>
                        <span>Open to Work</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs font-mono text-slate-600 dark:text-[#A8AFB8] line-clamp-2 leading-relaxed">
                {student.bio}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((sk, sIdx) => (
                  <span
                    key={sIdx}
                    className="bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-[#D0D4DC] text-xs font-mono px-3 py-1 rounded-xl"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openPublicProfile(student)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-800 dark:text-white text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>View Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyPublicProfileLink(student)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-700 dark:text-white rounded-2xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
                  title="Copy Student Public Link"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConnect(student.name)}
                  className="flex-1 py-2.5 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-none"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Connect</span>
                </button>
              </div>

            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-secondary">person_search</span>
              <p className="text-xs text-slate-500 dark:text-secondary font-medium">No students found matching your search</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
