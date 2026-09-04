import React from 'react';
import { useApp } from '../../context/AppContext';

export default function BottomNav() {
  const { currentScreen, navigate, userRole } = useApp();

  const isRecruiter = userRole === 'recruiter' || userRole === 'hr';

  const navItems = isRecruiter
    ? [
      {
        id: 'discover',
        label: 'Project',
        icon: 'travel_explore',
        screen: 'discover',
        activeScreens: ['discover', 'submit-project', 'project-repo']
      },
      {
        id: 'explore',
        label: 'Students',
        icon: 'group',
        screen: 'explore',
        activeScreens: ['explore', 'public-profile']
      },
      {
        id: 'postings',
        label: 'Postings',
        icon: 'campaign',
        screen: 'list-internship',
        activeScreens: ['list-internship', 'find-internship', 'find-internships', 'list-internships']
      },
      {
        id: 'ai-chat',
        label: 'AI Recruiter',
        icon: 'smart_toy',
        screen: 'ai-chat'
      },
      {
        id: 'recruiter-profile',
        label: 'Profile',
        icon: 'person',
        screen: 'recruiter-profile',
        activeScreens: ['recruiter-profile', 'complete-hr-profile', 'settings']
      },
      {
        id: 'hr-notifications',
        label: 'Inbox',
        icon: 'notifications',
        screen: 'hr-notifications',
        activeScreens: ['hr-notifications', 'student-applicants']
      }
    ]
    : [
      {
        id: 'discover',
        label: 'Project',
        icon: 'travel_explore',
        screen: 'discover',
        activeScreens: ['discover', 'submit-project', 'project-repo', 'find-internship', 'list-internship', 'find-internships', 'list-internships']
      },
      {
        id: 'explore',
        label: 'Explore',
        icon: 'group',
        screen: 'explore',
        activeScreens: ['explore', 'public-profile']
      },
      {
        id: 'dashboard',
        label: 'Learning',
        icon: 'menu_book',
        screen: 'dashboard',
        activeScreens: ['dashboard', 'courses', 'explore-courses']
      },
      {
        id: 'quiz',
        label: 'Quizzes',
        icon: 'quiz',
        screen: 'quiz-select',
        activeScreens: ['quiz-select', 'quiz-active', 'quiz-results']
      },
      {
        id: 'ai-chat',
        label: 'Skille',
        icon: 'smart_toy',
        screen: 'ai-chat'
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: 'person',
        screen: 'profile',
        activeScreens: ['profile', 'edit-profile', 'badges', 'settings']
      },
      {
        id: 'notifications',
        label: 'Inbox',
        icon: 'notifications',
        screen: 'notifications',
        activeScreens: ['notifications', 'internship-application-message']
      }
    ];

  const isItemActive = (item) => {
    if (item.activeScreens) {
      return item.activeScreens.includes(currentScreen);
    }
    return currentScreen === item.screen;
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
      {/* 
        TIP: To change navbar width, adjust `max-w-[365px]` (or `w-[90%]`) below. 
        e.g., `max-w-[340px]` (more compact) or `max-w-[400px]` (wider).
      */}
      <nav className="bottom-nav w-[92%] max-w-[365px] bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-slate-200/80 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/70 py-1.5 px-1 flex justify-around items-center pointer-events-auto transition-all duration-300">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.screen)}
              className={`relative flex flex-col items-center justify-center transition-all duration-150 py-1 px-1 rounded-xl flex-1 cursor-pointer active:scale-95 ${
                active
                  ? 'text-[#D71921] dark:text-white font-bold'
                  : 'text-slate-500 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {/* Nothing OS Active Red Accent Indicator on Top */}
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#D71921] rounded-full shadow-[0_0_8px_#D71921]" />
              )}

              <span className={`material-symbols-outlined text-lg transition-transform ${active ? 'scale-105' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[9.5px] font-mono tracking-tight leading-tight mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
