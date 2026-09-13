import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function ProjectRecommendationsScreen() {
  const { navigate, setSelectedProjectSpec, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'AI / ML', 'Full Stack', 'Cloud & Systems', 'Mobile Dev'];

  const recommendedProjects = [
    {
      id: 'proj-ai-agent',
      title: 'Autonomous Multimodal AI Support Agent',
      category: 'AI / ML',
      matchScore: '94%',
      level: 'ADVANCED',
      estTime: '~14H',
      xpReward: '+120 XP',
      modulesCount: 5,
      proofOfSkill: ['Vector Search & Embeddings', 'Async Event Streaming', 'Tool Calling Loop'],
      description: 'Architect an end-to-end production-grade agent capable of parsing visual telemetry, orchestrating hybrid vector retrieval, and initiating real-time function executions.',
      tags: ['Python 3.11', 'FastAPI', 'Qdrant Vector DB', 'Next.js 14', 'WebSockets', 'LangChain'],
      recruiterTier: 'High HR Exposure'
    },
    {
      id: 'proj-fintech-store',
      title: 'Full-Stack E-Commerce with Real-Time Webhooks',
      category: 'Full Stack',
      matchScore: '98%',
      level: 'INTERMEDIATE',
      estTime: '~10H',
      xpReward: '+95 XP',
      modulesCount: 4,
      proofOfSkill: ['Stripe Integration', 'Cart State Management', 'JWT Authentication'],
      description: 'Build a high-concurrency digital store with automated order fulfillment, Stripe Checkout webhooks, and real-time inventory locking.',
      tags: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'TailwindCSS'],
      recruiterTier: 'Top Fintech Pick'
    },
    {
      id: 'proj-code-editor',
      title: 'Real-Time Collaborative Code Playground',
      category: 'Cloud & Systems',
      matchScore: '91%',
      level: 'ADVANCED',
      estTime: '~16H',
      xpReward: '+150 XP',
      modulesCount: 6,
      proofOfSkill: ['CRDT / OT Sync', 'Docker Sandbox Execution', 'WebSockets'],
      description: 'Develop a browser-based multi-user IDE with real-time operational transformation, isolated containerized execution, and live terminal streaming.',
      tags: ['TypeScript', 'WebSockets', 'Docker', 'Monaco Editor', 'Go'],
      recruiterTier: 'Tier 1 Tech Highlight'
    },
    {
      id: 'proj-health-tracker',
      title: 'Cross-Platform AI Health & Wellness Tracker',
      category: 'Mobile Dev',
      matchScore: '89%',
      level: 'INTERMEDIATE',
      estTime: '~8H',
      xpReward: '+80 XP',
      modulesCount: 3,
      proofOfSkill: ['Mobile Camera Vision', 'On-Device ML', 'Capacitor SQLite'],
      description: 'Build a mobile companion app for automatic meal nutrient estimation using computer vision models and local offline caching.',
      tags: ['React Native', 'Capacitor', 'TensorFlow.js', 'SQLite'],
      recruiterTier: 'Product Startup Favorite'
    }
  ];

  const filteredProjects = recommendedProjects.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSelectProject = (project) => {
    setSelectedProjectSpec(project);
    navigate('project-spec');
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="RECOMMENDED PROJECTS" showBack={true} />

      <main className="px-4 py-4 space-y-4 w-full">
        {/* Banner */}
        <section className="bg-gradient-to-r from-[#9a0002] via-[#6f0001] to-[#1f1b16] rounded-3xl p-5 border border-white/10 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full uppercase">
              Skillify Capstone Playbook
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              98% Pathway Alignment
            </span>
          </div>
          <h1 className="text-lg font-headline font-extrabold uppercase">
            Curated Recruiter Projects 🚀
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Build production-ready projects verified by HR managers. Completing specs unlocks verified proof-of-skill badges on your public pitch.
          </p>
        </section>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search projects by tech stack, topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] text-slate-900 dark:text-white focus:outline-none focus:border-[#D71921]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#D71921] text-white shadow-sm'
                    : 'bg-white dark:bg-[#14171A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#24292F] hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3"
            >
              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#D71921] bg-[#D71921]/10 px-2.5 py-0.5 rounded-full border border-[#D71921]/20 uppercase">
                    {proj.level} • {proj.estTime}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {proj.matchScore} Match
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h2 className="font-headline text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {proj.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  {proj.description}
                </p>
              </div>

              {/* Meta Telemetry Strip */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-black/40 text-center font-mono">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">XP REWARD</p>
                  <p className="text-xs font-bold text-[#D71921]">{proj.xpReward}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">MODULES</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{proj.modulesCount} Steps</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase">RECRUITER ROI</p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">{proj.recruiterTier}</p>
                </div>
              </div>

              {/* Proof of Skill Badges */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 space-y-1">
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Recruiter Proof-of-Skill Unlocks:
                </p>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  {proj.proofOfSkill.join(' • ')}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {proj.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>

              {/* CTA Action */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <button
                  onClick={() => showToast("⭐ Saved to Bookmarks!", "success")}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#D71921] transition-colors"
                  title="Bookmark Project"
                >
                  <span className="material-symbols-outlined text-base">bookmark_border</span>
                </button>
                <button
                  onClick={() => handleSelectProject(proj)}
                  className="text-xs font-bold text-white bg-[#D71921] hover:bg-[#b0141b] px-4 py-2 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <span>View Full Specification</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
