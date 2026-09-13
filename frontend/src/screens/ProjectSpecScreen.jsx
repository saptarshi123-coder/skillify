import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function ProjectSpecScreen() {
  const { navigate, selectedProjectSpec, showToast } = useApp();
  const [bookmarked, setBookmarked] = useState(false);
  const [activeModule, setActiveModule] = useState(0);

  // Fallback project spec if navigated directly
  const project = selectedProjectSpec || {
    id: 'proj-ai-agent',
    title: 'Autonomous Multimodal AI Support Agent',
    category: 'AI / ML',
    matchScore: '94%',
    level: 'CAPSTONE SPECIFICATION • LEVEL: ADVANCED • ~14H',
    xpReward: '+120 XP',
    modulesCount: 5,
    proofOfSkill: ['Vector Search & Embeddings', 'Async Event Streaming', 'Tool Calling & Reasoning Loop'],
    description: 'Architect an end-to-end production-grade agent capable of parsing visual telemetry, orchestrating hybrid vector retrieval, and initiating real-time function executions.',
    tags: ['Python 3.11', 'FastAPI', 'Qdrant Vector DB', 'Next.js 14', 'WebSockets', 'LangChain'],
    recruiterTier: 'High HR Exposure'
  };

  const modules = [
    {
      step: 'Module 1',
      title: 'Environment & Multimodal Telemetry Pipeline',
      detail: 'Configure FastAPI backend, set up image/video buffer streams, and configure vision LLM adapters with validation hooks.'
    },
    {
      step: 'Module 2',
      title: 'Hybrid Vector Indexing & Qdrant Setup',
      detail: 'Implement dense & sparse embeddings index, store document chunks, and write cosine similarity retrieval methods.'
    },
    {
      step: 'Module 3',
      title: 'Agent Tool Calling & Reasoning Loop',
      detail: 'Build function calling execution Engine for automated API triggers, SQL query builders, and external webhook dispatches.'
    },
    {
      step: 'Module 4',
      title: 'Real-Time WebSocket Terminal & State Stream',
      detail: 'Connect Next.js frontend to streaming backend sockets with live step-by-step thought log visualization.'
    },
    {
      step: 'Module 5',
      title: 'Testing, Dockerization & HR Showcase Link',
      detail: 'Package services into multi-stage Docker compose containers and generate shareable proof-of-skill badge URL.'
    }
  ];

  const codeSnippet = `
# Sample Vector Retrieval + Tool Agent Execution Loop
from fastapi import FastAPI, WebSocket
from qdrant_client import QdrantClient
from langchain.agents import initialize_agent, Tool

app = FastAPI(title="Multimodal AI Support Agent API")
qdrant = QdrantClient(host="localhost", port=6333)

@app.websocket("/ws/agent-telemetry")
async def agent_socket(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"status": "AGENT_READY", "xp_tracking": "+120 XP"})
`;

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="PROJECT SPECIFICATION" showBack={true} />

      <main className="px-4 py-4 space-y-4 w-full">
        {/* Navigation & Context Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('project-recommendations')}
            className="flex items-center gap-1 text-xs font-bold text-[#D71921] hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Recommendations</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBookmarked(!bookmarked);
                showToast(bookmarked ? "Removed bookmark" : "Project Spec Bookmarked! ⭐", "info");
              }}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#D71921] transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                {bookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(window.location.href);
                showToast("📋 Spec link copied to clipboard!", "success");
              }}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#D71921] transition-colors"
            >
              <span className="material-symbols-outlined text-base">share</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#D71921] bg-[#D71921]/10 px-2.5 py-0.5 rounded-full border border-[#D71921]/20">
              CAPSTONE SPECIFICATION • {project.matchScore} PATHWAY MATCH
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="font-headline text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {project.title}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              {project.description}
            </p>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-black/40 text-center font-mono">
            <div>
              <p className="text-[9px] text-slate-400 uppercase">XP GAIN</p>
              <p className="text-xs font-bold text-[#D71921]">{project.xpReward}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase">MILESTONES</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white">{modules.length} Modules</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase">PORTFOLIO</p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Verified Badge</p>
            </div>
          </div>

          {/* Proof of Skill Badges */}
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-1.5 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase">
              <span className="material-symbols-outlined text-sm">verified</span>
              Recruiter Proof-of-Skill Badges
            </div>
            <p className="text-xs text-slate-300">
              {project.proofOfSkill.join(' • ')}
            </p>
          </div>

          {/* Stack Chips */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((t, idx) => (
              <span key={idx} className="text-[10px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Milestone Breakdown Tabs */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-4">
          <h2 className="font-headline text-xs font-bold text-[#D71921] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2.5">
            <span className="material-symbols-outlined text-base">checklist</span>
            Implementation Milestones ({modules.length})
          </h2>

          <div className="space-y-2.5">
            {modules.map((mod, idx) => (
              <div
                key={idx}
                onClick={() => setActiveModule(idx)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  activeModule === idx
                    ? 'bg-slate-50 dark:bg-black/50 border-[#D71921] shadow-sm'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#D71921] uppercase">
                    {mod.step}
                  </span>
                  <span className="material-symbols-outlined text-sm text-slate-400">
                    {activeModule === idx ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {mod.title}
                </h3>
                {activeModule === idx && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
                    {mod.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Architecture Code Preview */}
        <section className="bg-slate-950 text-slate-100 rounded-3xl p-5 border border-slate-800 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">code</span>
              Backend Code Skeleton
            </span>
            <span className="text-[10px] text-slate-500">Python 3.11</span>
          </div>

          <pre className="text-[11px] text-emerald-400 overflow-x-auto p-2 bg-black/60 rounded-xl leading-relaxed no-scrollbar">
            {codeSnippet.trim()}
          </pre>
        </section>

        {/* Sticky Action Footer */}
        <div className="pt-2">
          <button
            onClick={() => navigate('submit-project')}
            className="w-full py-3.5 bg-[#D71921] hover:bg-[#b0141b] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>Start Building & Submit Project</span>
          </button>
        </div>
      </main>
    </div>
  );
}
