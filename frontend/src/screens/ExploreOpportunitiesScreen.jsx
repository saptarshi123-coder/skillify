import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function ExploreOpportunitiesScreen() {
  const { navigate, setActiveChatContact, showToast } = useApp();
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const recruiterNetwork = [
    {
      id: 'rec-1',
      name: 'Ananya Sharma',
      role: 'Senior Technical Recruiter',
      company: 'Google India',
      domain: 'AI & Data Science',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      activeRolesCount: 4,
      verified: true,
      bio: 'Hiring early-career software engineers and AI/ML interns across Bengaluru and Hyderabad campuses.'
    },
    {
      id: 'rec-2',
      name: 'Rajesh K.',
      role: 'Early Careers Talent Lead',
      company: 'Microsoft',
      domain: 'Cloud Systems',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      activeRolesCount: 6,
      verified: true,
      bio: 'Focused on recruiting full-stack developers, Azure infrastructure builders, and cybersecurity interns.'
    },
    {
      id: 'rec-3',
      name: 'Priya Nair',
      role: 'Hiring Manager',
      company: 'Zomato Tech',
      domain: 'Web & Mobile',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      activeRolesCount: 3,
      verified: true,
      bio: 'Searching for passionate React & React Native developers with verified capstone portfolio projects.'
    }
  ];

  const filteredRecruiters = recruiterNetwork.filter(r => {
    const matchesDomain = selectedDomain === 'All' || r.domain === selectedDomain;
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const handleStartChat = (recruiter) => {
    setActiveChatContact({
      name: recruiter.name,
      role: `${recruiter.role} at ${recruiter.company}`,
      avatar: recruiter.avatar
    });
    navigate('hr-inbox');
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="HR CONNECT NETWORK" showBack={true} />

      <main className="px-4 py-4 space-y-4 w-full">
        {/* Banner */}
        <section className="bg-gradient-to-br from-[#D71921] via-red-900 to-black rounded-3xl p-5 border border-white/10 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase">
              Skillify Recruiter Directory
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              Verified HR Partners
            </span>
          </div>
          <h1 className="text-lg font-headline font-extrabold uppercase">
            Connect directly with HR 🤝
          </h1>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            Skip traditional job portals. Send your verified project repos and quiz badges directly to tech recruiters.
          </p>
        </section>

        {/* Search & Domain Filters */}
        <div className="space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search recruiters by name, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] text-slate-900 dark:text-white focus:outline-none focus:border-[#D71921]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['All', 'AI & Data Science', 'Cloud Systems', 'Web & Mobile'].map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDomain === domain
                    ? 'bg-[#D71921] text-white shadow-sm'
                    : 'bg-white dark:bg-[#14171A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#24292F] hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Recruiter List */}
        <div className="space-y-4">
          {filteredRecruiters.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={rec.avatar} alt={rec.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#D71921]" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-headline text-sm font-bold text-slate-900 dark:text-white">{rec.name}</h2>
                      {rec.verified && (
                        <span className="material-symbols-outlined text-blue-500 text-sm" title="Verified HR">verified</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{rec.role} at <strong className="text-slate-800 dark:text-white">{rec.company}</strong></p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                  {rec.activeRolesCount} Open Roles
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                "{rec.bio}"
              </p>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => handleStartChat(rec)}
                  className="flex-1 py-2.5 bg-[#D71921] hover:bg-[#b0141b] text-white font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span>Chat & Send Portfolio Pitch</span>
                </button>
                <button
                  onClick={() => {
                    showToast(`⭐ Added ${rec.name} to HR Contacts`, "success");
                  }}
                  className="px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer active:scale-95"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
