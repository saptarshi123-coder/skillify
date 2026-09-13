import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function HRInboxScreen() {
  const { navigate, activeChatContact, userProfile, showToast } = useApp();

  const recruiter = activeChatContact || {
    name: 'Priya Nair',
    role: 'Early Careers Hiring Manager at Flipkart',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'recruiter',
      text: `Hi ${userProfile.name.split(' ')[0]}! I reviewed your Skillify profile and noticed your verified 98% score in Full Stack React & Node.js. Are you open for a software engineering internship?`,
      time: '10:14 AM'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Hello Priya! Thank you for reaching out. Yes, I am actively looking for internship roles starting immediately.',
      time: '10:18 AM'
    },
    {
      id: 3,
      sender: 'recruiter',
      text: 'Great! Could you please share your latest project repository link and CV for our engineering leads to review?',
      time: '10:20 AM'
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMsg.trim(),
      time: 'Just now'
    };
    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');

    // Simulated HR quick response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'recruiter',
          text: "Received! Our technical team will get back to you within 24 hours to schedule the initial technical interview.",
          time: 'Just now'
        }
      ]);
    }, 1200);
  };

  const handleShareRepo = () => {
    const repoMsg = `Here is my verified Skillify portfolio repo: https://skillify.ai/repo/${userProfile.name.toLowerCase().replace(/\s+/g, '-')}`;
    setInputMsg(repoMsg);
    showToast("Repo link prepared in chat input!", "info");
  };

  const handleShareCV = () => {
    const cvMsg = `Here is my verified CV summary. Phone: +91 9876543210 • Email: ${userProfile.email}`;
    setInputMsg(cvMsg);
    showToast("CV summary prepared in chat input!", "info");
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#14171A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#24292F] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('exposure-mode')}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:text-[#D71921] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img src={recruiter.avatar} alt={recruiter.name} className="w-9 h-9 rounded-full object-cover border border-[#D71921]" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{recruiter.name}</h1>
                <span className="material-symbols-outlined text-blue-500 text-xs" title="Verified HR">verified</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{recruiter.role}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('public-profile')}
          className="text-[11px] font-bold text-[#D71921] bg-[#D71921]/10 px-3 py-1 rounded-full border border-[#D71921]/20 hover:bg-[#D71921] hover:text-white transition-all cursor-pointer"
        >
          View Pitch
        </button>
      </header>

      {/* Message Body */}
      <main className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        <div className="text-center my-2">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-white/10 px-3 py-1 rounded-full">
            Encrypted Recruiter Outreach Channel
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] p-3.5 rounded-2xl space-y-1 text-xs font-sans ${
                m.sender === 'user'
                  ? 'bg-[#D71921] text-white rounded-tr-none shadow-md'
                  : 'bg-white dark:bg-[#14171A] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none'
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              <p className={`text-[9px] font-mono text-right ${m.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                {m.time}
              </p>
            </div>
          </div>
        ))}
      </main>

      {/* Quick Action Shortcuts */}
      <div className="px-4 py-2 bg-white/80 dark:bg-[#14171A]/80 backdrop-blur-md border-t border-slate-200 dark:border-[#24292F] space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={handleShareRepo}
            className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#D71921] hover:text-white transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span className="material-symbols-outlined text-xs">folder</span>
            <span>Share Project Repo</span>
          </button>

          <button
            onClick={handleShareCV}
            className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#D71921] hover:text-white transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span className="material-symbols-outlined text-xs">badge</span>
            <span>Share Verified CV</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Write message to HR..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 text-xs rounded-2xl bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#D71921]"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-2xl bg-[#D71921] hover:bg-[#b0141b] text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md shrink-0"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
