import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function JobOpportunitiesScreen() {
  const { navigate, setSelectedJobDetail, showToast } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const jobPostings = [
    {
      id: 'job-1',
      company: 'Google India',
      logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      verified: true,
      title: 'Junior AI/ML Solutions Engineer',
      salary: '₹18,00,000 – 24,00,000 / yr',
      location: 'Bengaluru & Hyderabad • Hybrid',
      matchScore: '98%',
      experience: '0-2 Yrs',
      postedAgo: '2d ago',
      applicantsCount: 124,
      perks: ['Equity', 'Annual Bonus', 'Relocation Assistance'],
      description: 'Join Google India engineering teams building generative AI solutions, RAG pipelines, and automated developer tools.',
      recruiter: {
        name: 'Ananya Sharma',
        role: 'Senior Tech Recruiter'
      }
    },
    {
      id: 'job-2',
      company: 'Microsoft',
      logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      verified: true,
      title: 'Full Stack Software Engineering Intern',
      salary: '₹60,00,000 / yr (Stipend ₹80k/mo)',
      location: 'Noida & Hyderabad • Remote Optional',
      matchScore: '95%',
      experience: 'Student / Fresher',
      postedAgo: '1d ago',
      applicantsCount: 89,
      perks: ['PPO Opportunity', 'Free Meals', 'Learning Credits'],
      description: 'Design and deploy scalable cloud microservices for Azure Developer Experience division using React and C#/.NET.',
      recruiter: {
        name: 'Rajesh K.',
        role: 'Early Careers Talent Manager'
      }
    },
    {
      id: 'job-3',
      company: 'Zomato Tech',
      logo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      verified: true,
      title: 'Frontend React Developer (Graduate Trainee)',
      salary: '₹12,00,000 – 16,00,000 / yr',
      location: 'Gurugram • Onsite',
      matchScore: '91%',
      experience: '0-1 Yrs',
      postedAgo: '3d ago',
      applicantsCount: 210,
      perks: ['Stock Grants', 'Health Cover', 'Gym Pass'],
      description: 'Craft ultra-fast consumer-facing mobile web interfaces, optimize bundle size, and build real-time order tracking components.',
      recruiter: {
        name: 'Priya Nair',
        role: 'Hiring Lead'
      }
    }
  ];

  const filteredJobs = jobPostings.filter(j => {
    const matchesFilter = selectedFilter === 'All' ||
      (selectedFilter === 'Hybrid' && j.location.includes('Hybrid')) ||
      (selectedFilter === 'Remote' && j.location.includes('Remote')) ||
      (selectedFilter === '90%+ Match' && parseInt(j.matchScore) >= 90);
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSelectJob = (job) => {
    setSelectedJobDetail(job);
    navigate('job-description');
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="JOB OPPORTUNITIES" showBack={true} />

      <main className="px-4 py-4 space-y-4 w-full">
        {/* Header Hero */}
        <section className="bg-gradient-to-r from-slate-900 via-black to-[#D71921]/30 rounded-3xl p-5 border border-slate-800 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold bg-[#D71921] px-2.5 py-0.5 rounded-full uppercase text-white">
              Skillify Verified Careers
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              ● 18 Active Recruiters Online
            </span>
          </div>
          <h1 className="text-lg font-headline font-extrabold uppercase">
            Top Tech Roles & Internships 💼
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Verified opportunities tailored to your Skillify quiz scores & portfolio projects. Directly message hiring managers.
          </p>
        </section>

        {/* Search & Filter Bar */}
        <div className="space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search by job title, company, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] text-slate-900 dark:text-white focus:outline-none focus:border-[#D71921]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['All', '90%+ Match', 'Hybrid', 'Remote'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-[#D71921] text-white shadow-sm'
                    : 'bg-white dark:bg-[#14171A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#24292F] hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3"
            >
              {/* Top Company Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-white/10" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-headline text-sm font-bold text-slate-900 dark:text-white">{job.company}</h2>
                      {job.verified && (
                        <span className="material-symbols-outlined text-blue-500 text-sm" title="Verified Recruiter">verified</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{job.location}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {job.matchScore} Match
                </span>
              </div>

              {/* Title & Salary */}
              <div className="space-y-1">
                <h3 className="font-headline text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {job.title}
                </h3>
                <p className="text-xs font-bold text-[#D71921] font-mono">
                  {job.salary}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                {job.description}
              </p>

              {/* Perks Chips */}
              <div className="flex flex-wrap gap-1.5">
                {job.perks.map((p, idx) => (
                  <span key={idx} className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                    +{p}
                  </span>
                ))}
              </div>

              {/* Recruiter Teaser & Action */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Recruiter: <strong>{job.recruiter.name}</strong> • {job.postedAgo}</span>
                </div>
                <button
                  onClick={() => handleSelectJob(job)}
                  className="text-xs font-bold text-white bg-[#D71921] hover:bg-[#b0141b] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-md"
                >
                  <span>View Details</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
