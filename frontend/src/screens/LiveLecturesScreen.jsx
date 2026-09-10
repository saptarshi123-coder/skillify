import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function LiveLecturesScreen() {
  const { navigate, showToast } = useApp();
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [userPollAnswer, setUserPollAnswer] = useState(null); // null | 'yes' | 'no'
  const [pollVotes, setPollVotes] = useState({ yes: 68, no: 32 });
  const [doubts, setDoubts] = useState([
    { id: 1, name: "Aarav Sharma", text: "How does Redis Sentinel handle split-brain in master-replica failovers?", time: "2m ago" },
    { id: 2, name: "Priya Patel", text: "Is Consistent Hashing required when using Redis Cluster slots?", time: "5m ago" }
  ]);
  const [newDoubt, setNewDoubt] = useState('');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  const topics = ['All', 'System Design', 'Web Dev', 'Data Science', 'DSA & Algorithms', 'Masterclass'];

  const upcomingLectures = [
    {
      id: "dp-bitmask",
      title: "Google Interview Prep: Dynamic Programming & Bitmasking Patterns",
      instructor: "Siddharth Verma (Ex-Google L5 SDE)",
      time: "Today • 8:00 PM IST",
      category: "DSA & Algorithms",
      attendees: "3,200 Registered",
      tag: "High Priority"
    },
    {
      id: "fullstack-ai-llm",
      title: "Full Stack AI: Building Production LLM Apps with FastAPI & Next.js 14",
      instructor: "Ananya Roy (Lead AI Architect)",
      time: "Today • 9:30 PM IST",
      category: "Web Dev",
      attendees: "4,100 Registered",
      tag: "Hands-on Lab"
    },
    {
      id: "aws-mock-interview",
      title: "Amazon AWS Solutions Architect: Live Mock Interview & Portfolio Review",
      instructor: "Rohan Kapoor (Principal Cloud Architect)",
      time: "Tomorrow • 6:00 PM IST",
      category: "System Design",
      attendees: "2,800 Registered",
      tag: "Mock Round"
    }
  ];

  const recentRecordings = [
    {
      id: "rec-sagemaker",
      title: "Machine Learning Pipelines on AWS with SageMaker",
      duration: "1h 45m",
      instructor: "Neha Singh",
      views: "12.4k views"
    },
    {
      id: "rec-tcs-nqt",
      title: "TCS NQT & MNC Coding Round Live Solutions",
      duration: "2h 10m",
      instructor: "Vikram Das",
      views: "24.8k views"
    }
  ];

  const handleVotePoll = (choice) => {
    if (userPollAnswer) return;
    setUserPollAnswer(choice);
    setPollVotes(prev => ({
      ...prev,
      [choice]: prev[choice] + 1
    }));
    showToast(`Voted "${choice.toUpperCase()}" on Live Poll!`, 'success');
  };

  const handleAddDoubt = (e) => {
    e.preventDefault();
    if (!newDoubt.trim()) return;
    setDoubts(prev => [
      { id: Date.now(), name: "You (Candidate)", text: newDoubt.trim(), time: "Just now" },
      ...prev
    ]);
    setNewDoubt('');
    setIsQuestionModalOpen(false);
    showToast('Question submitted to Instructor Q&A queue!', 'info');
  };

  return (
    <div className="w-full pb-24 transition-colors min-h-screen bg-slate-900/5 dark:bg-[#0f1115]">
      <Navbar title="LIVE LECTURES" showBack onBack={() => navigate('courses')} />

      <main className="px-4 py-4 space-y-5 w-full max-w-2xl mx-auto">
        
        {/* Featured Live Stream Container */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl overflow-hidden border border-slate-200 dark:border-[#24292F] shadow-card space-y-4">
          
          {/* Live Player Canvas Area */}
          <div className="relative w-full h-52 sm:h-64 bg-black flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80"
              alt="Live Stream Preview"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

            {/* Live Status Badge */}
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>LIVE NOW • 1,240 Watching</span>
            </div>

            {/* Center Play / Join Interactive Button */}
            <button
              onClick={() => showToast('🔊 Connected to Live Interactive Stream!', 'info')}
              className="absolute group bg-[#D71921] hover:scale-110 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl fill-1">play_arrow</span>
            </button>

            {/* Bottom Stream Details Overlay */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-amber-400/30">
                System Design Masterclass
              </span>
              <h2 className="font-headline text-sm font-bold text-white mt-1 line-clamp-1">
                Advanced System Design: Distributed Caching & Redis at Scale
              </h2>
            </div>
          </div>

          {/* Stream Actions & Host Bar */}
          <div className="px-5 pb-4 space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D71921] text-white flex items-center justify-center font-bold text-xs">
                  AT
                </div>
                <div>
                  <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white">Dr. Aris Thorne</h4>
                  <p className="text-[10px] text-slate-500 dark:text-[#8E959E]">Ex-Google Principal Architect</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsQuestionModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-[#191D22] text-slate-700 dark:text-white text-[11px] font-mono font-bold rounded-xl border border-slate-200 dark:border-[#2D333B] flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-[#252B33] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-[#D71921]">help</span>
                  <span>Ask Q&A</span>
                </button>

                <button
                  onClick={() => showToast('❤️ Liked Stream!', 'success')}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#191D22] text-slate-700 dark:text-white border border-slate-200 dark:border-[#2D333B] flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined text-sm text-red-500">favorite</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Question of the Hour Poll */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-1 text-[#D71921]">
                  <span className="material-symbols-outlined text-sm">poll</span>
                  Question of the Hour
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Live Student Poll</span>
              </div>
              <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                Have you implemented Redis Sentinel or Redis Cluster in production code?
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleVotePoll('yes')}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    userPollAnswer === 'yes'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-[#14171A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D333B] hover:border-emerald-500'
                  }`}
                >
                  <span>Yes, in production</span>
                  <span className="text-[10px] opacity-80">({pollVotes.yes}%)</span>
                </button>

                <button
                  onClick={() => handleVotePoll('no')}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    userPollAnswer === 'no'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white dark:bg-[#14171A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D333B] hover:border-red-500'
                  }`}
                >
                  <span>No, still learning</span>
                  <span className="text-[10px] opacity-80">({pollVotes.no}%)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
          {topics.map((t) => {
            const isActive = selectedTopic === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-[#D71921] text-white shadow-sm'
                    : 'bg-white dark:bg-[#191D22] text-slate-700 dark:text-[#C5C9D0] border border-slate-200 dark:border-[#2D333B] hover:bg-slate-50 dark:hover:bg-[#20252B]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Upcoming Lectures Schedule */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Upcoming Today & Tomorrow
            </h3>
            <span className="text-[10px] font-mono text-[#D71921] font-bold">Full Timetable</span>
          </div>

          <div className="space-y-3">
            {upcomingLectures.map((lec) => (
              <div
                key={lec.id}
                className="bg-white dark:bg-[#14171A] rounded-3xl p-4 border border-slate-200 dark:border-[#24292F] shadow-card space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full">
                      {lec.tag} • {lec.time}
                    </span>
                    <h4 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                      {lec.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{lec.attendees}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#24292F]">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{lec.instructor}</span>

                  <button
                    onClick={() => showToast(`⏰ Reminder set for "${lec.title.slice(0, 30)}..."!`, 'success')}
                    className="px-3.5 py-1.5 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">notifications</span>
                    <span>Remind Me</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Live Recordings Archive */}
        <section className="space-y-3">
          <h3 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Recent Recordings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentRecordings.map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-[#14171A] rounded-2xl p-3.5 border border-slate-200 dark:border-[#24292F] space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{rec.duration}</span>
                  <span>{rec.views}</span>
                </div>
                <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white line-clamp-2">{rec.title}</h4>
                <p className="text-[10px] font-mono text-slate-500">{rec.instructor}</p>

                <button
                  onClick={() => showToast(`Playing recording: ${rec.title}`, 'info')}
                  className="w-full py-1.5 bg-slate-100 dark:bg-[#191D22] text-slate-700 dark:text-white text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-[#2D333B] flex items-center justify-center gap-1 hover:bg-slate-200 cursor-pointer"
                >
                  <span>Watch</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Q&A Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14171A] w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-[#24292F] space-y-4 relative shadow-2xl">
            <button
              onClick={() => setIsQuestionModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-100 dark:bg-[#191D22] flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>

            <h3 className="font-headline text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D71921]">live_help</span>
              Ask Instructor Question
            </h3>

            <form onSubmit={handleAddDoubt} className="space-y-3">
              <textarea
                rows={3}
                required
                value={newDoubt}
                onChange={(e) => setNewDoubt(e.target.value)}
                placeholder="Type your technical question or doubt here..."
                className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl p-3 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#D71921]"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all shadow-md cursor-pointer"
              >
                Submit Question
              </button>
            </form>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#24292F]">
              <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white">Recent Live Doubts ({doubts.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {doubts.map((d) => (
                  <div key={d.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-500 font-bold">
                      <span>{d.name}</span>
                      <span className="text-[9px]">{d.time}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">{d.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
