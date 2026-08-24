import React from 'react';
import { useApp } from '../../context/AppContext';

export default function BottomNav() {
  const { currentScreen, navigate, userRole } = useApp();

  const isRecruiter = userRole === 'recruiter' || userRole === 'hr';

  const navItems = isRecruiter
    ? [
        {
          id: 'discover',
          label: 'Talent',
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
        }
      ]
    : [
        {
          id: 'discover',
          label: 'Discover',
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
          screen: 'dashboard'
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
          label: 'AI Chat',
          icon: 'smart_toy',
          screen: 'ai-chat'
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: 'person',
          screen: 'profile',
          activeScreens: ['profile', 'edit-profile', 'badges', 'settings']
        }
      ];

  const isItemActive = (item) => {
    if (item.activeScreens) {
      return item.activeScreens.includes(currentScreen);
    }
    return currentScreen === item.screen;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="w-full max-w-md bg-surface/95 backdrop-blur-md border-t border-surface-variant/40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] py-1.5 px-1 flex justify-around items-center pointer-events-auto transition-colors">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.screen)}
              className={`flex flex-col items-center justify-center transition-all duration-200 py-1 px-2 rounded-2xl ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[19px] ${
                  active ? 'icon-filled font-bold' : 'icon-outlined'
                }`}
                style={active ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className={`text-[9px] tracking-tight leading-tight mt-0.5 ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
