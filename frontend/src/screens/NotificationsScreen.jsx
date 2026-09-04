import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function NotificationsScreen() {
  const { navigate, openChat, userProfile } = useApp();
  const [activeTab, setActiveTab] = useState('messages');

  const messages = [
    {
      id: 'skillify-careers',
      name: 'Skillify Careers',
      subtitle: 'careers@skillify.academic',
      initials: 'SC',
      avatar: null,
      time: '10:42 AM',
      preview: 'Your application for the Frontend Intern role has been successfully submitted. We will review your profile and get back to you within 2-3 weeks.',
      unread: true,
      label: 'Internship Application Received',
      isProminent: true,
      navigateTo: 'internship-application-message', // opens detail page, not chatbox
    },
    {
      id: 'prof-sarah',
      name: 'Prof. Sarah Jenkins',
      subtitle: 'Professor · CS Dept.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      time: 'Yesterday',
      preview: 'Regarding your recent project submission, please ensure you review section 3 before the final grading.',
      unread: false,
    },
    {
      id: 'study-group',
      name: 'Study Group Alpha',
      subtitle: '3 members',
      initials: 'SG',
      avatar: null,
      iconFallback: 'group',
      time: 'Oct 12',
      preview: "Mike: Does anyone have the notes from yesterday's lecture?",
      unread: false,
      muted: true,
    },
  ];

  const notifications = [
    { id: 1, icon: 'workspace_premium', title: 'Quiz Streak 5 Days!', body: "You're on fire! Keep it up to earn the 'Consistent Scholar' badge.", accent: true },
    { id: 2, icon: 'menu_book', title: 'New Course Available', body: 'Advanced UI/UX Patterns for Enterprise Applications is now open for enrollment.' },
    { id: 3, icon: 'emoji_events', title: 'New Badge Unlocked', body: 'Congratulations! You\'ve earned the "Python Pioneer" badge for completing 5 Python quizzes.', accent: true },
  ];

  const handleOpenChat = (msg) => {
    // If the message has a dedicated page, go there instead of the chatbox
    if (msg.navigateTo) {
      navigate(msg.navigateTo);
      return;
    }
    openChat({
      id: msg.id,
      name: msg.name,
      subtitle: msg.subtitle,
      avatar: msg.avatar || null,
      initials: msg.initials || msg.name?.charAt(0),
      online: false,
    });
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="INBOX" />

      <main className="px-4 py-4 space-y-4 w-full">
        {/* Tab Switcher */}
        <div className="flex w-full bg-slate-200/70 dark:bg-[#191D22] border border-slate-300/60 dark:border-[#2D333B] rounded-2xl p-1 shadow-xs dark:shadow-none">
          {['messages', 'notifications'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-center rounded-xl text-xs font-mono font-bold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#2D333B] text-[#D71921] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Messages Tab ── */}
        {activeTab === 'messages' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Direct Messages
              </h2>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
                {messages.length} conversations
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenChat(msg)}
                className={`bg-white dark:bg-[#14171A] rounded-2xl md:rounded-3xl border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none
                  flex gap-3.5 cursor-pointer active:scale-[0.99] transition-all group hover:border-slate-300 dark:hover:border-[#323842] hover:-translate-y-0.5
                  ${msg.isProminent ? 'p-4 sm:p-5 ring-1 ring-[#D71921]/30 dark:ring-[#D71921]/40' : 'p-4'} ${msg.muted ? 'opacity-70' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.avatar ? (
                    <img className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-[#2D333B]" src={msg.avatar} alt={msg.name} />
                  ) : msg.iconFallback ? (
                    <div className="w-12 h-12 bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl flex items-center justify-center text-slate-600 dark:text-[#8E959E]">
                      <span className="material-symbols-outlined">{msg.iconFallback}</span>
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-bold text-sm transition-colors border
                        ${msg.isProminent
                          ? 'bg-[#D71921]/10 dark:bg-[#D71921]/20 border-[#D71921]/30 text-[#D71921] dark:text-[#FF8B8D] group-hover:bg-[#D71921] group-hover:text-white group-hover:border-[#D71921]'
                          : 'bg-[#D71921] border-[#D71921] text-white'}`}
                    >
                      {msg.isProminent
                        ? <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                        : msg.initials}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3
                      className={`text-sm ${msg.unread ? 'font-bold' : 'font-semibold'} text-slate-900 dark:text-white truncate group-hover:text-[#D71921] dark:group-hover:text-[#FF8B8D] transition-colors`}
                    >
                      {msg.label || msg.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E] flex-shrink-0 ml-2">
                      {msg.time}
                    </span>
                  </div>
                  {msg.isProminent && (
                    <p className="text-xs text-[#D71921] dark:text-[#FF8B8D] font-mono font-semibold mb-0.5">
                      {msg.name}
                    </p>
                  )}
                  <p
                    className={`text-xs sm:text-sm text-slate-600 dark:text-[#8E959E] ${msg.isProminent ? 'line-clamp-2' : 'line-clamp-1'}`}
                  >
                    {msg.preview}
                  </p>
                </div>

                {/* Unread dot + chevron */}
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  {msg.unread ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D71921] shadow-[0_0_8px_#D71921]" />
                  ) : <div className="w-2.5 h-2.5" />}
                  <span className="material-symbols-outlined text-slate-400 dark:text-[#8E959E] text-[18px] group-hover:text-[#D71921] dark:group-hover:text-white transition-colors">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                System Alerts
              </h2>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
                {notifications.length} alerts
              </span>
            </div>

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white dark:bg-[#14171A] rounded-2xl p-4 shadow-card dark:shadow-none flex gap-3.5 items-start
                  border ${n.accent ? 'border-l-4 border-l-[#D71921] border-slate-200 dark:border-[#24292F]' : 'border-slate-200 dark:border-[#24292F]'}`}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 border ${
                  n.accent
                    ? 'bg-[#D71921]/10 dark:bg-[#D71921]/20 text-[#D71921] dark:text-[#FF8B8D] border-[#D71921]/30'
                    : 'bg-slate-100 dark:bg-[#191D22] text-slate-600 dark:text-[#8E959E] border-slate-200 dark:border-[#2D333B]'
                }`}>
                  <span className="material-symbols-outlined text-xl">{n.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {n.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8E959E] mt-0.5 leading-relaxed">
                    {n.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

