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
      <Navbar title="Explore Talent" />

      <main className="px-4 py-4 space-y-4 w-full">
        
        {/* Header Title */}
        <div>
          <h1 className="font-headline text-lg font-extrabold text-on-surface dark:text-inverse-on-surface">
            Explore Talent
          </h1>
          <p className="text-xs text-secondary">
            Connect with student developers, peer coders & view verified public profiles
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students, skills, universities..."
            className="w-full bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/60 rounded-2xl py-2.5 pl-10 pr-10 text-xs outline-none focus:border-primary text-on-surface dark:text-inverse-on-surface shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-lowest dark:bg-surface-container-high text-secondary border border-outline-variant/50'
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
              className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-3 transition-all hover:border-primary/40 hover:shadow-md"
            >
              {/* Header Info - Clickable to open student's profile */}
              <div 
                onClick={() => openPublicProfile(student)}
                className="flex items-start gap-3.5 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/30 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate group-hover:text-primary transition-colors">
                      {student.name}
                    </h2>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                      Lvl {student.level}
                    </span>
                  </div>

                  <p className="text-[11px] text-secondary truncate mt-0.5">
                    {student.major} • {student.college}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-white bg-amber-600 dark:bg-amber-600 px-2 py-0.5 rounded-full shadow-2xs">
                      🏆 {student.honorsBadge}
                    </span>
                    {student.lookingForInternships && (
                      <span className="text-[9px] font-bold text-white bg-emerald-600 dark:bg-emerald-600 px-2 py-0.5 rounded-full shadow-2xs">
                        💼 Open to Work
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim line-clamp-2">
                {student.bio}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 pt-1 border-t border-surface-variant/30">
                {student.skills.map((sk, sIdx) => (
                  <span
                    key={sIdx}
                    className="bg-surface dark:bg-inverse-surface/60 text-[10px] text-primary font-bold px-2.5 py-0.5 rounded-md border border-outline-variant/40"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openPublicProfile(student)}
                  className="flex-1 py-2 bg-surface dark:bg-inverse-surface/40 hover:bg-surface-container border border-outline-variant/60 text-on-surface dark:text-inverse-on-surface text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>View Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyPublicProfileLink(student)}
                  className="px-2.5 py-2 bg-surface dark:bg-inverse-surface/40 hover:border-primary border border-outline-variant/60 text-secondary hover:text-primary rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
                  title="Copy Student Public Link"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConnect(student.name)}
                  className="flex-1 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Connect</span>
                </button>
              </div>

            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <span className="material-symbols-outlined text-4xl text-secondary">person_search</span>
              <p className="text-xs text-secondary font-medium">No students found matching your search</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
