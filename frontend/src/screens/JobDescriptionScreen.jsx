import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function JobDescriptionScreen() {
  const { navigate, selectedJobDetail, setActiveChatContact, showToast } = useApp();
  const [applied, setApplied] = useState(false);

  // Fallback job details
  const job = selectedJobDetail || {
    id: 'job-1',
    company: 'Google India',
    logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    verified: true,
    title: 'Junior AI/ML Solutions Engineer',
    salary: '₹18,00,000 – 24,00,000 / yr base',
    location: 'Bengaluru & Hyderabad • Hybrid',
    matchScore: '98%',
    postedAgo: '2d ago',
    applicantsCount: 124,
    perks: ['Equity', 'Annual Bonus', 'Relocation Assistance'],
    description: 'Join Google India engineering teams building generative AI solutions, RAG pipelines, and automated developer tools.',
    recruiter: {
      name: 'Ananya Sharma',
      role: 'Senior Tech Recruiter',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    }
  };

  const responsibilities = [
    'Design, train, and fine-tune domain-specific Large Language Models (LLMs) and embeddings for internal dev tools.',
    'Orchestrate low-latency RAG vector search pipelines using FastAPI, LangChain, and Qdrant/Pinecone.',
    'Collaborate closely with senior staff engineers to optimize GPU inference memory footprint and API latency.',
    'Deploy production AI microservices on Google Cloud Kubernetes Engine (GKE) with robust observability.'
  ];

  const requirements = [
    'Strong proficiency in Python 3.11+, PyTorch/TensorFlow, and Async I/O.',
    'Demonstrated portfolio projects involving LLM function calling, RAG, or AI agents.',
    'Familiarity with containerized deployments (Docker, Kubernetes) and CI/CD pipelines.',
    'High score on Skillify Python & AI/ML verified quizzes (Top 10% candidate ranking).'
  ];

  const handleOpenChat = () => {
    setActiveChatContact({
      name: job.recruiter.name,
      role: `${job.recruiter.role} at ${job.company}`,
      avatar: job.recruiter.avatar || job.logo
    });
    navigate('hr-inbox');
  };

  const handleApply = () => {
    setApplied(true);
    showToast(`🎉 Application sent to ${job.company}! Recruiter notified.`, "success");
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="JOB DETAILS" showBack={true} />

      <main className="px-4 py-4 space-y-4 w-full">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('job-opportunities')}
            className="flex items-center gap-1 text-xs font-bold text-[#D71921] hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Job Listings</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText?.(window.location.href);
              showToast("📋 Job link copied!", "info");
            }}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#D71921] transition-colors"
          >
            <span className="material-symbols-outlined text-base">share</span>
          </button>
        </div>

        {/* Company & Role Hero Card */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-white/10" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-headline text-base font-bold text-slate-900 dark:text-white">{job.company}</h1>
                  <span className="material-symbols-outlined text-blue-500 text-sm" title="Verified Recruiter">verified</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{job.location}</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {job.matchScore} Match
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {job.title}
            </h2>
            <p className="text-sm font-bold text-[#D71921] font-mono">
              {job.salary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-sm">schedule</span> {job.postedAgo}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-sm">groups</span> {job.applicantsCount} applicants
            </span>
          </div>
        </section>

        {/* Recruiter Connect Card */}
        <section className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={job.recruiter.avatar || job.logo} alt={job.recruiter.name} className="w-10 h-10 rounded-full object-cover border-2 border-[#D71921]" />
              <div>
                <h3 className="text-xs font-bold text-white">{job.recruiter.name}</h3>
                <p className="text-[10px] text-slate-400">{job.recruiter.role}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Active Recruiter
            </span>
          </div>

          <button
            onClick={handleOpenChat}
            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/10"
          >
            <span className="material-symbols-outlined text-sm text-[#D71921]">chat</span>
            <span>Chat Directly with {job.recruiter.name.split(' ')[0]}</span>
          </button>
        </section>

        {/* Responsibilities */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3">
          <h3 className="font-headline text-xs font-bold text-[#D71921] uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2">
            Key Responsibilities
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-sans">
            {responsibilities.map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-[#D71921] shrink-0 mt-0.5">check_circle</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Requirements */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3">
          <h3 className="font-headline text-xs font-bold text-[#D71921] uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2">
            Qualifications & Skills
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-sans">
            {requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-500 shrink-0 mt-0.5">stars</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Apply Action CTA */}
        <div className="pt-2">
          <button
            onClick={handleApply}
            disabled={applied}
            className={`w-full py-3.5 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              applied
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-[#D71921] hover:bg-[#b0141b] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {applied ? 'task_alt' : 'send'}
            </span>
            <span>{applied ? 'Application Submitted!' : `Apply Now to ${job.company}`}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
