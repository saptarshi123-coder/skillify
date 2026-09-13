import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function ExposureModeScreen() {
  const { userProfile, navigate, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'projects' | 'outreach' | 'tracker'
  const [isPublic, setIsPublic] = useState(true);
  const [openToRoles, setOpenToRoles] = useState(true);
  const [badgeHighlight, setBadgeHighlight] = useState(true);

  // Mock HR Outreach Contacts
  const hrOutreachList = [
    {
      id: 1,
      name: "Ananya Sharma",
      company: "Google India",
      role: "Senior Tech Recruiter",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      status: "Shortlisted your React Repo",
      matchScore: "98%",
      verified: true
    },
    {
      id: 2,
      name: "Rajesh K.",
      company: "Microsoft",
      role: "Talent Acquisition Lead",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      status: "Viewed Python & AI Badges",
      matchScore: "94%",
      verified: true
    },
    {
      id: 3,
      name: "Priya Nair",
      company: "Flipkart",
      role: "Early Careers Hiring Specialist",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      status: "Sent an Interview Invitation",
      matchScore: "91%",
      verified: true
    }
  ];

  // Recommended Project Ideas for High HR Exposure
  const highExposureProjects = [
    {
      id: 'p1',
      title: 'Full-Stack E-Commerce with Real-time Payments',
      category: 'Web Dev',
      exposureBoost: '+35% Profile Views',
      difficulty: 'Intermediate',
      tags: ['React', 'Node.js', 'Stripe', 'MongoDB'],
      description: 'Build a production-grade store front with auth, cart state, & payment webhooks to impress fintech & e-comm recruiters.'
    },
    {
      id: 'p2',
      title: 'AI Resume Synthesizer & Job Matcher',
      category: 'AI / ML',
      exposureBoost: '+45% Recruiter DMs',
      difficulty: 'Advanced',
      tags: ['Python', 'FastAPI', 'OpenAI', 'Vector DB'],
      description: 'Create a tool that matches candidate resumes against job descriptions with semantic search vector embeddings.'
    },
    {
      id: 'p3',
      title: 'Real-time Collaborative Code Editor',
      category: 'Systems / Web',
      exposureBoost: '+40% High-Tier HR Views',
      difficulty: 'Advanced',
      tags: ['WebSockets', 'React', 'Monaco Editor'],
      description: 'Develop a Google Docs-style live collaborative code playground using WebSockets & WebRTC.'
    }
  ];

  // Active Applications & Exposure Tracker
  const applicationTracker = [
    {
      company: "Zomato",
      role: "Frontend Engineering Intern",
      appliedDate: "Sep 10, 2026",
      status: "HR Shortlisted",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    },
    {
      company: "Swiggy",
      role: "Full Stack Intern",
      appliedDate: "Sep 08, 2026",
      status: "Under Review",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    },
    {
      company: "Paytm",
      role: "Software Developer Intern",
      appliedDate: "Sep 04, 2026",
      status: "Profile Viewed",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    }
  ];

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="EXPOSURE MODE" showBack={true} />

      <main className="px-4 py-4 space-y-4 w-full">

        {/* Top Hero Banner */}
        <section className="bg-gradient-to-br from-[#D71921] via-red-700 to-black rounded-3xl p-5 border border-white/10 shadow-lg text-white space-y-3 relative overflow-hidden">
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
              Student Exposure Hub 🔥
            </h1>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Maximize your profile visibility to HR managers, display verified skill badges, and land top developer internships.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 relative z-10">
            <div className="bg-black/30 border border-white/15 rounded-2xl p-2.5 text-center">
              <p className="text-lg font-bold font-mono text-white">142</p>
              <p className="text-[10px] text-white/70 uppercase">Profile Views</p>
            </div>
            <div className="bg-black/30 border border-white/15 rounded-2xl p-2.5 text-center">
              <p className="text-lg font-bold font-mono text-emerald-400">98%</p>
              <p className="text-[10px] text-white/70 uppercase">Match Rating</p>
            </div>
            <div className="bg-black/30 border border-white/15 rounded-2xl p-2.5 text-center">
              <p className="text-lg font-bold font-mono text-amber-300">3</p>
              <p className="text-[10px] text-white/70 uppercase">HR Inquiries</p>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-surface-container-lowest dark:bg-[#14171A] p-1.5 rounded-2xl border border-slate-200 dark:border-[#24292F] overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'projects', label: 'Project Ideas', icon: 'lightbulb' },
            { id: 'outreach', label: 'HR Outreach', icon: 'contacts' },
            { id: 'tracker', label: 'Tracker', icon: 'insights' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[85px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#D71921] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Exposure Settings & Visibility Controls */}
            <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-4">
              <h2 className="font-headline text-xs font-bold text-[#D71921] uppercase tracking-wider border-b border-slate-200 dark:border-[#24292F] pb-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">tune</span>
                Recruiter Visibility Controls
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Public Recruiter Visibility</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Allow verified recruiters to discover your profile</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsPublic(!isPublic);
                      showToast(isPublic ? "Visibility paused" : "Visibility enabled!", "info");
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                      isPublic ? 'bg-[#D71921]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      isPublic ? 'translate-x-6' : 'translate-x-0'
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
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                      openToRoles ? 'bg-[#D71921]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      openToRoles ? 'translate-x-6' : 'translate-x-0'
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
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                      badgeHighlight ? 'bg-[#D71921]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      badgeHighlight ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Direct Action Hub */}
            <section className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('submit-project')}
                className="bg-gradient-to-br from-slate-900 to-black text-white p-4 rounded-2xl border border-slate-700 hover:border-[#D71921] transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer group active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-[#D71921]/20 text-[#D71921] flex items-center justify-center group-hover:bg-[#D71921] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">upload_file</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Submit Project</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Publish repo to HR Feed</p>
                </div>
              </button>

              <button
                onClick={() => navigate('find-internships')}
                className="bg-gradient-to-br from-[#D71921]/20 via-slate-900 to-black text-white p-4 rounded-2xl border border-[#D71921]/40 hover:border-[#D71921] transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer group active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-[#D71921] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-lg">work</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Explore Jobs</h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">Apply with Exposure boost</p>
                </div>
              </button>
            </section>

            {/* Recent HR Interest Teaser */}
            <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#D71921]">visibility</span>
                  Recent HR Activity
                </h2>
                <button
                  onClick={() => setActiveTab('outreach')}
                  className="text-[11px] font-bold text-[#D71921] hover:underline"
                >
                  View All ({hrOutreachList.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {hrOutreachList.slice(0, 2).map((hr) => (
                  <div
                    key={hr.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <img src={hr.avatar} alt={hr.name} className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-white/20" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{hr.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{hr.company} • {hr.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {hr.matchScore} Match
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: PROJECT IDEAS */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-1">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">bolt</span>
                High-Exposure Project Playbook
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Recruiters prioritize candidates with real-world, production-ready portfolio projects. Building these guarantees 3x profile engagement.
              </p>
            </div>

            <div className="space-y-3">
              {highExposureProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D71921] bg-[#D71921]/10 px-2.5 py-0.5 rounded-full border border-[#D71921]/20">
                        {proj.category}
                      </span>
                      <h4 className="font-headline text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                        {proj.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                      {proj.exposureBoost}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {proj.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Difficulty: {proj.difficulty}
                    </span>
                    <button
                      onClick={() => navigate('submit-project')}
                      className="text-xs font-bold text-white bg-[#D71921] hover:bg-[#b0141b] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <span>Build & Showcase</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HR OUTREACH */}
        {activeTab === 'outreach' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recruiters Viewing Your Profile
              </h2>
              <span className="text-[11px] font-bold text-emerald-500 font-mono">● Live Matches</span>
            </div>

            <div className="space-y-3">
              {hrOutreachList.map((hr) => (
                <div
                  key={hr.id}
                  className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={hr.avatar}
                        alt={hr.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#D71921]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-headline text-sm font-bold text-slate-900 dark:text-white">{hr.name}</h4>
                          {hr.verified && (
                            <span className="material-symbols-outlined text-blue-500 text-sm" title="Verified HR">verified</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{hr.role} at <strong className="text-slate-800 dark:text-white">{hr.company}</strong></p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-black/50 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Activity: {hr.status}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{hr.matchScore}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('chat')}
                      className="flex-1 text-xs font-bold py-2 bg-[#D71921] text-white rounded-xl hover:bg-[#b0141b] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      <span>Send Direct Message</span>
                    </button>
                    <button
                      onClick={() => navigate('public-profile')}
                      className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      View Pitch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TRACKER */}
        {activeTab === 'tracker' && (
          <div className="space-y-4">
            <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-4">
              <h2 className="font-headline text-xs font-bold text-[#D71921] uppercase tracking-wider border-b border-slate-200 dark:border-[#24292F] pb-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">work_history</span>
                Application & Exposure Status
              </h2>

              <div className="space-y-3">
                {applicationTracker.map((app, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{app.role}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.company} • Applied {app.appliedDate}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${app.badge}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#D71921] h-full rounded-full transition-all duration-500"
                        style={{ width: idx === 0 ? '75%' : idx === 1 ? '50%' : '30%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
