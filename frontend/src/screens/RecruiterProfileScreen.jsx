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

  return (
    <div className="w-full min-h-screen bg-background text-on-background pb-28 font-sans transition-colors animate-fadeIn">
      
      {/* Navbar */}
      <Navbar title="Recruiter Profile" showSearch={false} />

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-4 py-5 space-y-6">
        
        {/* Recruiter Header Profile Card */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-6 shadow-card border border-surface-variant/40 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Avatar Photo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-surface-variant/60 shrink-0 shadow-md relative">
            <img
              src={userProfile.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info Details */}
          <div className="flex-1 text-center sm:text-left space-y-2 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-headline text-lg sm:text-xl font-black text-primary dark:text-primary-fixed">
                  {userProfile.name}
                </h2>
                <p className="text-xs font-bold text-on-surface-variant dark:text-secondary-fixed-dim">
                  {userProfile.job_role || 'Senior Technical Recruiter'}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold mx-auto sm:mx-0">
                <span className="material-symbols-outlined text-xs">verified</span>
                Verified HR Partner
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-secondary pt-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">business</span>
                <strong>{userProfile.company_name || 'Skillify Inc.'}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                {userProfile.hr_location || 'Bengaluru, India'}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">mail</span>
                {userProfile.email}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-3">
              <button
                onClick={() => navigate('list-internship')}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">add_box</span>
                <span>List Internship</span>
              </button>

              <button
                onClick={() => navigate('complete-hr-profile')}
                className="px-4 py-2 border border-outline-variant/60 hover:border-primary text-secondary hover:text-primary rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => navigate('settings')}
                className="px-3 py-2 bg-surface-container-high text-secondary hover:text-on-surface rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Settings & Switch Role"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>

          </div>
        </div>

        {/* Professional Bio Module */}
        <section className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 space-y-2">
          <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">person_book</span>
            </div>
            <span>Professional Bio & Hiring Philosophy</span>
          </h3>
          <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">
            {userProfile.bio || 'Passionate about connecting top-tier student talent with innovative tech teams. Specialized in engineering and design recruitment with over 8 years of industry experience.'}
          </p>
        </section>

        {/* Applied Students / Candidate Pipeline Module */}
        <section className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">group</span>
              </div>
              <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                Applied Students & Candidate Pipeline
              </h3>
            </div>
            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {applicants.length} Active Applicants
            </span>
          </div>

          <div className="space-y-2.5 divide-y divide-surface-variant/30">
            {applicants.map((candidate) => (
              <div
                key={candidate.id}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 hover:bg-surface-container-low dark:hover:bg-surface-container-lowest p-2 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/40 shadow-xs">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">
                      {candidate.name}
                    </h4>
                    <p className="text-[11px] text-primary font-semibold truncate">
                      {candidate.role}
                    </p>
                    <p className="text-[10px] text-secondary">
                      {candidate.college} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{candidate.score}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewCandidate(candidate)}
                  className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span>View</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Recruitment Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => navigate('discover')}
            className="p-4 bg-surface-container-low dark:bg-surface-container-lowest rounded-2xl border border-surface-variant/40 hover:border-primary/40 cursor-pointer transition-all space-y-1.5"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">travel_explore</span>
            </div>
            <h4 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
              Discover Top Student Projects
            </h4>
            <p className="text-[10px] text-secondary">
              Browse submitted repositories, live apps, and open-source contributions.
            </p>
          </div>

          <div
            onClick={() => navigate('explore')}
            className="p-4 bg-surface-container-low dark:bg-surface-container-lowest rounded-2xl border border-surface-variant/40 hover:border-primary/40 cursor-pointer transition-all space-y-1.5"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">school</span>
            </div>
            <h4 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
              Explore Verified Talent
            </h4>
            <p className="text-[10px] text-secondary">
              Filter students by algorithmic rankings, verified skill badges, and college.
            </p>
          </div>
        </div>

      </main>

    </div>
  );
}
