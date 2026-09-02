import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

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
          <strong className="text-[#1f1b16] font-medium">Alex Rivera</strong> has just applied for the{' '}
          <strong className="text-[#1f1b16] font-medium">Frontend Intern</strong> role.
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
          Your <strong className="text-[#1f1b16] font-medium">Python Developer</strong> listing is reaching its 30-day limit.
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
          <strong className="text-[#1f1b16] font-medium">Sarah Jenkins</strong> submitted a project for the{' '}
          <strong className="text-[#1f1b16] font-medium">UI/UX Intern</strong> role.
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
    <div className="min-h-screen bg-[#fff8f3] text-[#1f1b16] flex flex-col pb-24">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#fff8f3] shadow-[0px_2px_8px_rgba(154,0,2,0.04)]">
        <div className="flex items-center justify-between px-4 h-16 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-[#e4beb8]/50">
              <img
                alt="HR Recruiter Profile"
                className="w-full h-full object-cover"
                src={userProfile?.avatar || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80'}
              />
            </div>
            <h1 className="font-bold text-xl text-[#6f0001]" style={{ fontFamily: 'Sora, sans-serif' }}>
              Skillify Academic
            </h1>
          </div>
          <button
            onClick={() => navigate('settings')}
            className="text-[#6f0001] hover:bg-[#6f0001]/5 transition-colors active:scale-95 duration-200 p-2 rounded-full"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-[80px] pb-[88px] px-4 flex flex-col gap-6">
        {/* Quick Action: View Applicants */}
        <div
          className="bg-white rounded-xl p-4 shadow-[0px_2px_8px_rgba(154,0,2,0.04)] border border-[#eae1d9] flex items-center justify-between cursor-pointer hover:-translate-y-0.5 transition-transform"
          onClick={() => navigate('student-applicants')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6f0001]/10 text-[#6f0001] flex items-center justify-center">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1f1b16]" style={{ fontFamily: 'Geist, sans-serif' }}>View All Applicants</h3>
              <p className="text-xs text-[#5b403c]" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>42 total · 3 new today</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#6f0001]">chevron_right</span>
        </div>

        {/* Segmented Control */}
        <div className="bg-[#f5ece4] p-1 rounded-full flex gap-1 shadow-[0px_2px_8px_rgba(154,0,2,0.04)] w-full max-w-[300px] mx-auto">
          <button
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-white text-[#6f0001] shadow-sm'
                : 'text-[#5b403c] hover:bg-[#fbf2ea]'
            }`}
            onClick={() => setActiveTab('notifications')}
            style={{ fontFamily: 'Geist, sans-serif' }}
          >
            Notifications
          </button>
          <button
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'messages'
                ? 'bg-white text-[#6f0001] shadow-sm'
                : 'text-[#5b403c] hover:bg-[#fbf2ea]'
            }`}
            onClick={() => setActiveTab('messages')}
            style={{ fontFamily: 'Geist, sans-serif' }}
          >
            Messages
          </button>
        </div>

        {/* Notifications List */}
        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-4">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-[0px_2px_8px_rgba(154,0,2,0.04)] flex gap-4 items-start border border-[#eae1d9] relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#6f0001]/10 flex items-center justify-center flex-shrink-0 text-[#6f0001]">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-semibold text-[#1f1b16] truncate" style={{ fontFamily: 'Geist, sans-serif' }}>
                      {item.title}
                    </h3>
                    <span className="text-xs text-[#5b403c] flex-shrink-0 ml-2" style={{ fontFamily: 'Geist, sans-serif' }}>
                      {item.time}
                    </span>
                  </div>
                  <p className="text-sm text-[#5b403c] leading-tight" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                    {item.message}
                  </p>
                </div>
                {/* Unread indicator */}
                {item.unread && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#6f0001]" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Messages List */}
        {activeTab === 'messages' && (
          <div className="flex flex-col gap-4">
            {messages.map((item) => (
              <div
                key={item.id}
                onClick={() => openChat({ id: item.id, name: item.name, subtitle: item.subtitle, avatar: item.avatar || null, initials: item.initials || item.name?.charAt(0), online: false })}
                className="bg-white rounded-xl p-4 shadow-[0px_2px_8px_rgba(154,0,2,0.04)] flex gap-4 items-center border border-[#eae1d9] cursor-pointer hover:-translate-y-0.5 transition-transform group"
              >
                {item.avatar ? (
                  <img
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    src={item.avatar}
                    alt={item.name}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#9a0002] text-[#ffa294] flex items-center justify-center flex-shrink-0 font-bold text-base" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {item.initials}
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm ${item.unread ? 'font-bold' : 'font-semibold'} text-[#1f1b16] truncate`} style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                      {item.name}
                    </h3>
                    <span className="text-xs text-[#5b403c] flex-shrink-0 ml-2" style={{ fontFamily: 'Geist, sans-serif' }}>
                      {item.time}
                    </span>
                  </div>
                  <p className="text-sm text-[#5b403c] line-clamp-1" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                    {item.preview}
                  </p>
                </div>
                {item.unread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#6f0001] flex-shrink-0 ml-1" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
