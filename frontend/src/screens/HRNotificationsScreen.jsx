import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function HRNotificationsScreen() {
  const { navigate, userProfile, openChat } = useApp();
  const [activeTab, setActiveTab] = useState('notifications');

  const notifications = [
    {
      id: 1,
      icon: 'person_add',
      title: 'New Applicant',
      time: '5m ago',
      message: (
        <>
          <strong className="text-slate-900 dark:text-white font-semibold">Alex Rivera</strong> has just applied for the{' '}
          <strong className="text-slate-900 dark:text-white font-semibold">Frontend Intern</strong> role.
        </>
      ),
      unread: true
    },
    {
      id: 2,
      icon: 'update',
      title: 'Listing Update',
      time: '2h ago',
      message: (
        <>
          Your <strong className="text-slate-900 dark:text-white font-semibold">Python Developer</strong> listing is reaching its 30-day limit.
        </>
      ),
      unread: false
    },
    {
      id: 3,
      icon: 'folder',
      title: 'Project Submitted',
      time: 'Yesterday',
      message: (
        <>
          <strong className="text-slate-900 dark:text-white font-semibold">Sarah Jenkins</strong> submitted a project for the{' '}
          <strong className="text-slate-900 dark:text-white font-semibold">UI/UX Intern</strong> role.
        </>
      ),
      unread: false
    }
  ];

  const messages = [
    {
      id: 'alex-rivera',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
      name: 'Alex Rivera',
      subtitle: 'Applied · Frontend Intern',
      time: '10:30 AM',
      preview: 'Thank you for considering my application. I wanted to follow up...',
      unread: true
    },
    {
      id: 'marcus-chen',
      initials: 'MC',
      name: 'Marcus Chen',
      subtitle: 'Applied · Frontend Intern',
      time: '9:15 AM',
      preview: 'I have submitted the Frontend Skills Assessment. Looking forward to hearing from you.',
      unread: false
    },
    {
      id: 'david-oconnor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      name: "David O'Connor",
      subtitle: 'Applied · Backend Intern',
      time: 'Yesterday',
      preview: 'Hello, I am very interested in the Backend Intern position at your company...',
      unread: false
    }
  ];

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="INBOX" />

      {/* Main Content */}
      <main className="px-4 py-4 space-y-4 w-full">
        {/* Quick Action: View Applicants */}
        <div
          className="bg-white dark:bg-[#14171A] rounded-2xl p-4 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-[#323842] hover:-translate-y-0.5 transition-all group"
          onClick={() => navigate('student-applicants')}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D71921]/10 dark:bg-[#D71921]/20 border border-[#D71921]/30 text-[#D71921] dark:text-[#FF8B8D] flex items-center justify-center flex-shrink-0 group-hover:bg-[#D71921] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#D71921] dark:group-hover:text-[#FF8B8D] transition-colors">
                View All Applicants
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E]">
                42 total candidates · 3 new today
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400 dark:text-[#8E959E] group-hover:text-[#D71921] dark:group-hover:text-white transition-colors">
            chevron_right
          </span>
        </div>

        {/* Segmented Control */}
        <div className="flex w-full bg-slate-200/70 dark:bg-[#191D22] border border-slate-300/60 dark:border-[#2D333B] rounded-2xl p-1 shadow-xs dark:shadow-none">
          <button
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all capitalize ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-[#2D333B] text-[#D71921] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all capitalize ${
              activeTab === 'messages'
                ? 'bg-white dark:bg-[#2D333B] text-[#D71921] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </div>

        {/* Notifications List */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recruiter Alerts
              </h2>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
                {notifications.length} alerts
              </span>
            </div>

            {notifications.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#14171A] rounded-2xl p-4 shadow-card dark:shadow-none flex gap-3.5 items-start border border-slate-200 dark:border-[#24292F] relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer hover:border-slate-300 dark:hover:border-[#323842]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#D71921]/10 dark:bg-[#D71921]/20 border border-[#D71921]/30 flex items-center justify-center flex-shrink-0 text-[#D71921] dark:text-[#FF8B8D]">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E] flex-shrink-0 ml-2">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8E959E] leading-relaxed">
                    {item.message}
                  </p>
                </div>
                {/* Unread indicator */}
                {item.unread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D71921] shadow-[0_0_8px_#D71921] flex-shrink-0 ml-1" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Messages List */}
        {activeTab === 'messages' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Candidate Messages
              </h2>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
                {messages.length} conversations
              </span>
            </div>

            {messages.map((item) => (
              <div
                key={item.id}
                onClick={() => openChat({ id: item.id, name: item.name, subtitle: item.subtitle, avatar: item.avatar || null, initials: item.initials || item.name?.charAt(0), online: false })}
                className="bg-white dark:bg-[#14171A] rounded-2xl p-4 shadow-card dark:shadow-none flex gap-3.5 items-center border border-slate-200 dark:border-[#24292F] cursor-pointer hover:border-slate-300 dark:hover:border-[#323842] hover:-translate-y-0.5 transition-all group"
              >
                {item.avatar ? (
                  <img
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-[#2D333B] flex-shrink-0"
                    src={item.avatar}
                    alt={item.name}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#D71921] border border-[#D71921] text-white flex items-center justify-center flex-shrink-0 font-headline font-bold text-base">
                    {item.initials}
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm ${item.unread ? 'font-bold' : 'font-semibold'} text-slate-900 dark:text-white group-hover:text-[#D71921] dark:group-hover:text-[#FF8B8D] transition-colors truncate`}>
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E] flex-shrink-0 ml-2">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#D71921] dark:text-[#FF8B8D] font-mono font-semibold mb-0.5">
                    {item.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8E959E] line-clamp-1">
                    {item.preview}
                  </p>
                </div>
                {/* Unread dot + chevron */}
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  {item.unread ? (
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
      </main>
    </div>
  );
}

