import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function ExposureModeScreen() {
  const { userProfile, navigate, showToast, setSelectedJobDetail, setSelectedProjectSpec } = useApp();

  const [isPublic, setIsPublic] = useState(true);
  const [openToRoles, setOpenToRoles] = useState(true);
  const [badgeHighlight, setBadgeHighlight] = useState(true);

  // Quick category action cards
  const categoryCards = [
    {
      id: 'jobs',
      label: 'Find Job',
      icon: 'work',
      desc: 'Browse Open Roles',
      screen: 'job-opportunities',
      color: 'text-[#D71921] bg-[#D71921]/10'
    },
    {
      id: 'internships',
      label: 'Find Internship',
      icon: 'search_hands_free',
      desc: 'Student Internships',
      screen: 'find-internships',
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      id: 'proj',
      label: 'Recommended Projects',
      icon: 'lightbulb',
      desc: 'Build & Showcase Repos',
      screen: 'project-recommendations',
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 'connect',
      label: 'Explore HR Connect',
      icon: 'contacts',
      desc: 'Direct Recruiter Outreach',
      screen: 'explore-opportunities',
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'inbox',
      label: 'HR Inbox',
      icon: 'chat',
      desc: '3 Active Conversations',
      screen: 'hr-inbox',
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ];

  // Teaser Job Posting
  const featuredJob = {
    id: 'job-1',
    company: 'Google India',
    logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    verified: true,
    title: 'Junior AI/ML Solutions Engineer',
    salary: '₹18,00,000 – 24,00,000 / yr',
    location: 'Bengaluru & Hyderabad • Hybrid',
    matchScore: '98%',
    postedAgo: '2d ago',
    applicantsCount: 124,
    description: 'Join Google India engineering teams building generative AI solutions and automated developer tools.',
    recruiter: {
      name: 'Ananya Sharma',
      role: 'Senior Tech Recruiter'
    }
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="EXPOSURE & CAREERS" showBack={true} />

      <main className="px-4 py-4 space-y-4 w-full">

        {/* Top Hero Banner */}
        <section className="bg-gradient-to-br from-[#D71921] via-red-800 to-black rounded-3xl p-5 border border-white/10 shadow-lg text-white space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-mono font-bold bg-black/40 border border-white/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Recruiter Spotlight Active
            </span>
            <span className="text-xs font-bold bg-white text-[#D71921] px-3 py-1 rounded-full shadow-md">
              Top 5% Candidate
            </span>
          </div>

          <div className="space-y-1 relative z-10">
            <h1 className="text-xl font-headline font-extrabold uppercase tracking-wide">
              HI, {userProfile.name.split(' ')[0].toUpperCase()}! 🔥
            </h1>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Ready to test your code, accelerate career exposure & connect with industry tech recruiters today?
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="space-y-2 pt-2 relative z-10">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  navigate('job-opportunities');
                  showToast("💼 Opening Job Opportunities...", "info");
                }}
                className="bg-white text-[#D71921] hover:bg-slate-100 font-extrabold text-xs py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-base">work</span>
                <span>FIND JOB</span>
              </button>

              <button
                onClick={() => {
                  navigate('find-internships');
                  showToast("🎓 Opening Internship Directory...", "info");
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs py-3 px-3 rounded-2xl border border-white/20 flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-base">school</span>
                <span>FIND INTERNSHIP</span>
              </button>
            </div>

            <button
              onClick={() => navigate('project-recommendations')}
              className="w-full bg-black/40 hover:bg-black/60 text-white font-bold text-xs py-2.5 px-3 rounded-2xl border border-white/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <span>PROJECT SPECS & PLAYBOOK</span>
              <span className="material-symbols-outlined text-sm">lightbulb</span>
            </button>
          </div>

          {/* Exposure Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 pt-2 relative z-10 font-mono">
            <div className="bg-black/30 border border-white/15 rounded-2xl p-2 text-center">
              <p className="text-sm font-bold text-white">142</p>
              <p className="text-[9px] text-white/70 uppercase">Views</p>
            </div>
            <div className="bg-black/30 border border-white/15 rounded-2xl p-2 text-center">
              <p className="text-sm font-bold text-emerald-400">98%</p>
              <p className="text-[9px] text-white/70 uppercase">Match</p>
            </div>
            <div className="bg-black/30 border border-white/15 rounded-2xl p-2 text-center">
              <p className="text-sm font-bold text-amber-300">3</p>
              <p className="text-[9px] text-white/70 uppercase">DMs</p>
            </div>
            <div className="bg-black/30 border border-white/15 rounded-2xl p-2 text-center">
              <p className="text-sm font-bold text-white">92</p>
              <p className="text-[9px] text-white/70 uppercase">Index</p>
            </div>
          </div>
        </section>

        {/* 5-Column Quick Category Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {categoryCards.map((card) => (
            <button
              key={card.id}
              onClick={() => navigate(card.screen)}
              className="bg-white dark:bg-[#14171A] rounded-2xl p-3 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-[#D71921] transition-all group active:scale-95"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-xl">{card.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{card.label}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{card.desc}</p>
              </div>
            </button>
          ))}
        </section>

        {/* Recruiter Spotlight / Featured Job */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
            <h2 className="font-headline text-xs font-bold text-[#D71921] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">stars</span>
              Top Recruiter Spotlight Role
            </h2>
            <button
              onClick={() => navigate('job-opportunities')}
              className="text-[11px] font-bold text-[#D71921] hover:underline"
            >
              View All Jobs
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={featuredJob.logo} alt={featuredJob.company} className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-white/10" />
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-headline text-xs font-bold text-slate-900 dark:text-white">{featuredJob.company}</h3>
                    <span className="material-symbols-outlined text-blue-500 text-xs">verified</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{featuredJob.location}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {featuredJob.matchScore} Match
              </span>
            </div>

            <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{featuredJob.title}</p>
            <p className="text-xs font-mono font-bold text-[#D71921]">{featuredJob.salary}</p>

            <button
              onClick={() => {
                setSelectedJobDetail(featuredJob);
                navigate('job-description');
              }}
              className="w-full py-2 bg-[#D71921] hover:bg-[#b0141b] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 mt-2"
            >
              <span>Inspect Role & Apply</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Recruiter Visibility Controls */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-4">
          <h2 className="font-headline text-xs font-bold text-[#D71921] uppercase tracking-wider border-b border-slate-200 dark:border-[#24292F] pb-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">tune</span>
            Recruiter Visibility Controls
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Public Recruiter Visibility</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Allow verified HR managers to discover your profile</p>
              </div>
              <button
                onClick={() => {
                  setIsPublic(!isPublic);
                  showToast(isPublic ? "Visibility paused" : "Visibility enabled!", "info");
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${isPublic ? 'bg-[#D71921]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${isPublic ? 'translate-x-6' : 'translate-x-0'
                  }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Open to Internship Offers</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Signal readiness for immediate technical hiring</p>
              </div>
              <button
                onClick={() => {
                  setOpenToRoles(!openToRoles);
                  showToast(openToRoles ? "Status: Not looking" : "Status: Open to offers!", "info");
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${openToRoles ? 'bg-[#D71921]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${openToRoles ? 'translate-x-6' : 'translate-x-0'
                  }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Highlight Skill Badges & Certificates</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Pin verified Skillify quiz badges to top of profile</p>
              </div>
              <button
                onClick={() => setBadgeHighlight(!badgeHighlight)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${badgeHighlight ? 'bg-[#D71921]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${badgeHighlight ? 'translate-x-6' : 'translate-x-0'
                  }`} />
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
