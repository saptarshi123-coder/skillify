import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function FindInternshipsScreen() {
  const {
    internships,
    savedInternshipIds,
    appliedInternships,
    toggleSaveInternship,
    applyToInternship,
    navigate,
    userProfile,
    userRole
  } = useApp();

  const isRecruiter = userRole === 'recruiter' || userRole === 'hr';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Roles');
  const [selectedMode, setSelectedMode] = useState('all'); // 'all' | 'online' | 'offline'
  const [selectedComp, setSelectedComp] = useState('all'); // 'all' | 'paid' | 'unpaid'
  const [selectedInternshipForModal, setSelectedInternshipForModal] = useState(null);

  const categories = ['All Roles', 'Engineering', 'Design', 'Marketing', 'AI / ML', 'Data Science'];

  const filteredInternships = internships.filter((item) => {
    const matchCategory =
      selectedCategory === 'All Roles' ||
      (item.category && item.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (item.role && item.role.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase())));

    const matchMode =
      selectedMode === 'all' ||
      (selectedMode === 'online' && (item.mode === 'online' || item.workType === 'Online' || item.location.toLowerCase().includes('remote') || item.location.toLowerCase().includes('online'))) ||
      (selectedMode === 'offline' && (item.mode === 'offline' || item.workType === 'Offline' || item.location.toLowerCase().includes('site') || item.location.toLowerCase().includes('hybrid')));

    const matchComp =
      selectedComp === 'all' ||
      (selectedComp === 'paid' && item.compensation !== 'unpaid' && item.stipend !== 'Unpaid') ||
      (selectedComp === 'unpaid' && (item.compensation === 'unpaid' || item.stipend === 'Unpaid'));

    const matchSearch =
      !searchQuery ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchCategory && matchMode && matchComp && matchSearch;
  });

  const getCompanyIcon = (iconName, category) => {
    if (iconName) return iconName;
    if (category === 'Design') return 'architecture';
    if (category === 'Marketing') return 'campaign';
    return 'corporate_fare';
  };

  const handleApplyClick = (internship) => {
    setSelectedInternshipForModal(internship);
  };

  const confirmApply = () => {
    if (selectedInternshipForModal) {
      applyToInternship(selectedInternshipForModal.id);
      setSelectedInternshipForModal(null);
    }
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="Find Internships" showBack={true} />

      <main className="px-4 py-4 space-y-4 w-full">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-headline text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Find Internships
            </h1>
            <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] leading-relaxed">
              Explore verified student internships & industry opportunities across India
            </p>
          </div>
          {isRecruiter && (
            <button
              onClick={() => navigate('list-internship')}
              className="px-3.5 py-2 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl shadow-none transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>POST</span>
            </button>
          )}
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
            placeholder="Search roles, companies, skills, or city..."
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

        {/* Role Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-transparent border border-[#D71921] text-[#D71921] font-bold'
                  : 'bg-white dark:bg-[#16181A] text-slate-600 dark:text-[#B0B4BA] border border-slate-200 dark:border-[#2C3036] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Work Mode & Type Quick Filters */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#8E959E] pt-1 font-mono">
          <span className="font-semibold text-[11px]">
            {filteredInternships.length} Opportunity{filteredInternships.length === 1 ? '' : 'ies'}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSelectedMode(selectedMode === 'online' ? 'all' : 'online')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                selectedMode === 'online'
                  ? 'border-[#D71921] text-[#D71921] bg-transparent'
                  : 'border-slate-200 dark:border-[#2D333B] bg-white dark:bg-[#191D22] text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🌐 Online
            </button>
            <button
              onClick={() => setSelectedComp(selectedComp === 'paid' ? 'all' : 'paid')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                selectedComp === 'paid'
                  ? 'border-[#D71921] text-[#D71921] bg-transparent'
                  : 'border-slate-200 dark:border-[#2D333B] bg-white dark:bg-[#191D22] text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              💰 Paid Only
            </button>
          </div>
        </div>

        {/* Internship Cards Feed */}
        <div className="space-y-4">
          {filteredInternships.map((internship) => {
            const isSaved = savedInternshipIds.includes(internship.id);
            const hasApplied = appliedInternships.some((a) => a.internship_id === internship.id);

            return (
              <article
                key={internship.id}
                className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] dark:hover:border-[#3A3A3A] transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Company Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                        <span className="material-symbols-outlined text-2xl">
                          {getCompanyIcon(internship.icon, internship.category)}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-headline text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {internship.role}
                        </h2>
                        <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E]">
                          {internship.company}
                        </p>
                      </div>
                    </div>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={() => toggleSaveInternship(internship.id)}
                      className={`p-2 rounded-full transition-colors cursor-pointer ${
                        isSaved
                          ? 'text-[#D71921] bg-[#D71921]/15'
                          : 'text-slate-500 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                      title={isSaved ? 'Remove from Bookmarks' : 'Save Internship'}
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                      >
                        {isSaved ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>
                  </div>

                  {/* Location & Details */}
                  <div className="flex items-center text-xs font-mono text-slate-500 dark:text-[#8E959E] mb-3 gap-1">
                    <span className="material-symbols-outlined text-sm text-[#D71921]">location_on</span>
                    <span>{internship.location}</span>
                    {internship.duration && (
                      <span className="text-[10px] text-slate-400 dark:text-[#666666] ml-2">
                        • {internship.duration}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {internship.description && (
                    <p className="text-xs font-mono text-slate-600 dark:text-[#A8AFB8] line-clamp-2 mb-3 leading-relaxed">
                      {internship.description}
                    </p>
                  )}

                  {/* Badges / Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="bg-slate-100 dark:bg-[#111315] border border-slate-300 dark:border-[#383E47] text-slate-700 dark:text-[#C5C9D0] text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full">
                      {internship.compensation === 'unpaid' ? 'Unpaid' : 'Paid'}
                    </span>
                    <span className="bg-slate-100 dark:bg-[#111315] border border-slate-300 dark:border-[#383E47] text-slate-700 dark:text-[#C5C9D0] text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full">
                      {internship.mode === 'offline' ? 'Offline' : 'Online'}
                    </span>
                    {(internship.tags || [])
                      .filter((t) => !['Paid', 'Unpaid', 'Online', 'Offline'].includes(t))
                      .slice(0, 3)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-[#D0D4DC] text-[10px] font-mono px-2 py-0.5 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Bottom Row: Stipend & Apply */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#24292F] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-[#666666] uppercase tracking-wider">
                      STIPEND
                    </p>
                    <p className="font-headline text-base font-bold text-slate-900 dark:text-white">
                      {internship.stipend || '₹20,000/mo'}
                    </p>
                  </div>

                  {hasApplied ? (
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#20252B] border border-slate-300 dark:border-[#383E47] text-slate-900 dark:text-white font-mono font-bold px-4 py-2 rounded-2xl text-xs">
                      <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                      <span>APPLIED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplyClick(internship)}
                      className="bg-[#D71921] hover:bg-[#b0141b] text-white font-mono font-bold text-xs px-5 py-2.5 rounded-2xl shadow-none transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <span>APPLY</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {filteredInternships.length === 0 && (
            <div className="text-center py-10 px-4 bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl border border-surface-variant/40 space-y-3 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">work_off</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
                  No Internships Found
                </h3>
                <p className="text-xs text-secondary max-w-xs mx-auto">
                  Try adjusting your filters or search keywords to explore more listings.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Roles');
                  setSelectedMode('all');
                  setSelectedComp('all');
                }}
                className="text-xs text-primary font-bold underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Post Internship Promo Banner (Visible only to Recruiters) */}
        {isRecruiter && (
          <div className="bg-gradient-to-r from-primary/10 via-primary-container/10 to-primary/5 dark:from-primary/20 dark:to-primary-container/20 rounded-3xl p-5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="space-y-1">
              <h3 className="font-headline text-sm font-bold text-primary dark:text-primary-fixed">
                Hiring Student Talent?
              </h3>
              <p className="text-xs text-secondary dark:text-secondary-fixed-dim">
                Post an internship opportunity for the Skillify developer community.
              </p>
            </div>
            <button
              onClick={() => navigate('list-internship')}
              className="w-full sm:w-auto px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              <span>List Internship</span>
            </button>
          </div>
        )}
      </main>

      {/* 1-Click Application Modal */}
      {selectedInternshipForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-surface dark:bg-surface-container-high rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-surface-variant/50 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">
                    {getCompanyIcon(selectedInternshipForModal.icon, selectedInternshipForModal.category)}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
                    Apply to {selectedInternshipForModal.company}
                  </h3>
                  <p className="text-xs text-secondary">{selectedInternshipForModal.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInternshipForModal(null)}
                className="text-secondary hover:text-primary p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low dark:bg-surface-container-lowest p-3.5 rounded-2xl text-xs space-y-2 border border-outline-variant/30">
              <p className="font-semibold text-on-surface dark:text-inverse-on-surface">
                Applicant Information:
              </p>
              <div className="space-y-1 text-secondary">
                <p>👤 <strong>Name:</strong> {userProfile.name}</p>
                <p>🎓 <strong>College:</strong> {userProfile.college}</p>
                <p>✉️ <strong>Email:</strong> {userProfile.email}</p>
                <p>⚡ <strong>Verified Level:</strong> Level {userProfile.level} ({userProfile.xp} XP)</p>
              </div>
              <div className="pt-2 border-t border-surface-variant/30 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Verified Skillify Academic Profile Attached</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedInternshipForModal(null)}
                className="flex-1 py-2.5 border border-outline-variant text-secondary rounded-xl text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmApply}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>Submit Application</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
