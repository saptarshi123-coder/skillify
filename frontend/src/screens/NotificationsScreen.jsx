import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

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
    <div className="min-h-screen bg-[#fff8f3] text-[#1f1b16] flex flex-col pb-24">
      {/* Top App Bar */}
      <header className="bg-[#fff8f3] w-full top-0 sticky z-40 border-b border-[#eae1d9]">
        <div className="flex justify-between items-center px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
              alt="Profile"
            />
            <h1 className="font-bold text-xl text-[#6f0001]" style={{ fontFamily: 'Sora, sans-serif' }}>
              Skillify Academic
            </h1>
          </div>
          <button
            onClick={() => navigate('settings')}
            className="p-2 rounded-full hover:bg-[#eae1d9] transition-colors text-[#6f0001]"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      <main className="flex-grow w-full px-4 py-4">
        {/* Tab Switcher */}
        <div className="flex w-full mb-5 bg-[#f5ece4] rounded-xl p-1 shadow-sm">
          {['messages', 'notifications'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2.5 text-center rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab ? 'bg-white text-[#6f0001] font-bold shadow-sm' : 'text-[#635d5a] hover:text-[#9a0002]'
              }`}
              onClick={() => setActiveTab(tab)}
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Messages Tab ── */}
        {activeTab === 'messages' && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-[#1f1b16] mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
              Inbox
            </h2>

            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenChat(msg)}
                className={`bg-white rounded-xl shadow-[0_2px_12px_rgba(154,0,2,0.05)] border border-[#e4beb8]/30
                  flex gap-3 cursor-pointer active:scale-[0.99] transition-all group hover:-translate-y-0.5
                  ${msg.isProminent ? 'p-5' : 'p-4'} ${msg.muted ? 'opacity-70' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.avatar ? (
                    <img className="w-12 h-12 rounded-full object-cover" src={msg.avatar} alt={msg.name} />
                  ) : msg.iconFallback ? (
                    <div className="w-12 h-12 bg-[#eae1d9] rounded-full flex items-center justify-center text-[#635d5a]">
                      <span className="material-symbols-outlined">{msg.iconFallback}</span>
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                        ${msg.isProminent
                          ? 'bg-[#6f0001]/10 text-[#6f0001] group-hover:bg-[#6f0001] group-hover:text-white'
                          : 'bg-[#9a0002] text-[#ffa294]'}`}
                      style={{ fontFamily: 'Sora, sans-serif' }}
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
                      className={`text-sm ${msg.unread ? 'font-bold' : 'font-semibold'} text-[#1f1b16] truncate`}
                      style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                    >
                      {msg.label || msg.name}
                    </h3>
                    <span className="text-xs text-[#635d5a] flex-shrink-0 ml-2" style={{ fontFamily: 'Geist, sans-serif' }}>
                      {msg.time}
                    </span>
                  </div>
                  {msg.isProminent && (
                    <p className="text-xs text-[#6f0001] font-semibold mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>
                      {msg.name}
                    </p>
                  )}
                  <p
                    className={`text-sm text-[#67625e] ${msg.isProminent ? 'line-clamp-2' : 'line-clamp-1'}`}
                    style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                  >
                    {msg.preview}
                  </p>
                </div>

                {/* Unread dot + chevron */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {msg.unread && <div className="w-2.5 h-2.5 rounded-full bg-[#6f0001]" />}
                  <span className="material-symbols-outlined text-[#c4b0ab] text-[18px] group-hover:text-[#6f0001] transition-colors">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-[#1f1b16] mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
              Alerts
            </h2>

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(154,0,2,0.05)] flex gap-4 items-start
                  ${n.accent ? 'border-l-4 border-[#6f0001]' : 'border border-[#eae1d9]'}`}
              >
                <div className={`p-2 rounded-full flex-shrink-0 ${n.accent ? 'bg-[#6f0001]/10 text-[#6f0001]' : 'bg-[#eae1d9] text-[#635d5a]'}`}>
                  <span className="material-symbols-outlined">{n.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1f1b16]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                    {n.title}
                  </h3>
                  <p className="text-sm text-[#67625e] mt-0.5" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
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
