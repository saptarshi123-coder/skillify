import React from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';
import { sqliteDB } from '../db/sqlite';
import { STUDENTS_DATA } from '../data/studentsData';

export default function RecruiterProfileScreen() {
  const { userProfile, navigate, openPublicProfile, showToast, logout } = useApp();

  const applicants = sqliteDB.getApplicantsForRecruiter();

  const handleViewCandidate = (candidate) => {
    // Find matching student data from STUDENTS_DATA or fallback
    const matched = STUDENTS_DATA.find(s =>
      s.name?.toLowerCase() === candidate.name?.toLowerCase() ||
      s.id === candidate.id
    ) || {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      major: candidate.role,
      college: candidate.college || 'Tech Institute of Technology',
      avatar: candidate.avatar,
      level: 4,
      xp: 2850,
      skills: ['React', 'JavaScript', 'Tailwind CSS', 'Python', 'Git'],
      honorsRoll: true,
      lookingForInternships: true,
      bio: `Aspiring ${candidate.role} candidate with verified assessment credentials on Skillify Academic Network.`
    };

    openPublicProfile(matched);
  };

  const handleAIShortlisting = () => {
    showToast('✨ AI Shortlisting activated! Top candidates ranked by verified skill scores.');
    navigate('student-applicants');
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="RECRUITER PROFILE" />

      <main className="px-4 py-4 space-y-4 w-full">

        {/* Recruiter Header Profile Card */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-300 dark:border-white/20 shadow-none">
            <img
              src={userProfile.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-headline text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {userProfile.name}
              </h2>
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-[#8E959E] bg-slate-100 dark:bg-[#20252B] border border-slate-200 dark:border-[#2D333B] px-2.5 py-0.5 rounded-full">
                VERIFIED HR
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E] mt-0.5">
              {userProfile.job_role || 'Senior Technical Recruiter'} • {userProfile.company_name || 'Skillify Inc.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full pt-2">
            <button
              onClick={() => navigate('list-internship')}
              className="py-2.5 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all shadow-none flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_box</span>
              <span>LIST INTERNSHIP</span>
            </button>
            <button
              onClick={() => navigate('student-applicants')}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-800 dark:text-white text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">group</span>
              <span>APPLICANTS</span>
            </button>
            <button
              onClick={handleAIShortlisting}
              className="py-2.5 bg-[#6f0001] hover:bg-[#9a0002] text-white text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>AI SHORTLIST</span>
            </button>
            <button
              onClick={() => navigate('complete-hr-profile')}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-800 dark:text-white text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>EDIT PROFILE</span>
            </button>
          </div>
        </div>

        {/* Professional Bio Module */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-2">
          <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#D71921]">person_book</span>
            <span>Professional Bio & Philosophy</span>
          </h3>
          <p className="text-xs font-mono text-slate-600 dark:text-[#A8AFB8] leading-relaxed">
            {userProfile.bio || 'Passionate about connecting top-tier student talent with innovative tech teams. Specialized in engineering and design recruitment with extensive industry experience.'}
          </p>
        </section>

        {/* Applied Students / Candidate Pipeline Module */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#D71921]">group</span>
              <span>Candidate Pipeline</span>
            </h3>
            <span className="bg-slate-100 dark:bg-[#20252B] text-slate-700 dark:text-[#C5C9D0] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-[#2D333B]">
              {applicants.length} APPLICANTS
            </span>
          </div>

          <div className="space-y-2.5">
            {applicants.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-[#191D22] rounded-2xl border border-slate-200 dark:border-[#2D333B]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#14171A] shrink-0 border border-slate-200 dark:border-[#24292F]">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                      {candidate.name}
                    </h4>
                    <p className="text-[11px] font-mono text-[#D71921] font-semibold truncate">
                      {candidate.role}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                      {candidate.college} • <span className="text-slate-800 dark:text-white font-bold">{candidate.score}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewCandidate(candidate)}
                  className="px-3.5 py-1.5 bg-[#D71921] hover:bg-[#b0141b] text-white rounded-xl text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95 shadow-none"
                >
                  <span>VIEW</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            ))}
          </div>

          {/* AI Shortlisting Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#20252B]">
            <button
              type="button"
              onClick={handleAIShortlisting}
              className="w-full py-3 px-4 rounded-2xl bg-[#9a0002] hover:bg-[#6f0001] text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              <span>AI SHORTLISTING</span>
            </button>
          </div>
        </section>

        {/* Quick Recruitment Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => navigate('discover')}
            className="p-4 bg-white dark:bg-[#14171A] rounded-2xl border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] cursor-pointer transition-all space-y-1.5 shadow-card dark:shadow-none"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">travel_explore</span>
            </div>
            <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Discover Student Projects
            </h4>
            <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
              Browse submitted repositories, live apps, and open-source contributions.
            </p>
          </div>

          <div
            onClick={() => navigate('explore')}
            className="p-4 bg-white dark:bg-[#14171A] rounded-2xl border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] cursor-pointer transition-all space-y-1.5 shadow-card dark:shadow-none"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">school</span>
            </div>
            <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Explore Verified Talent
            </h4>
            <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
              Filter students by algorithmic rankings, verified skill badges, and college.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
