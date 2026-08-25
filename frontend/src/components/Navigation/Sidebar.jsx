import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { currentScreen, navigate, userProfile, userRole, darkMode, setDarkMode, logout } = useApp();

  const isRecruiter = userRole === 'recruiter' || userRole === 'hr';

  const menuItems = isRecruiter
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
          label: 'Explore Students',
          icon: 'group',
          screen: 'explore',
          activeScreens: ['explore', 'public-profile']
        },
        {
          id: 'internships',
          label: 'Post & Manage Internships',
          icon: 'campaign',
          screen: 'list-internship',
          activeScreens: ['list-internship', 'find-internship', 'find-internships', 'list-internships']
        },
        {
          id: 'ai-chat',
          label: 'Skille Recruiter Assistant',
          icon: 'smart_toy',
          screen: 'ai-chat'
        },
        {
          id: 'recruiter-profile',
          label: 'Recruiter Profile',
          icon: 'person',
          screen: 'recruiter-profile',
          activeScreens: ['recruiter-profile', 'complete-hr-profile']
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          screen: 'settings'
        }
      ]
    : [
        {
          id: 'dashboard',
          label: 'Learning',
          icon: 'dashboard',
          screen: 'dashboard'
        },
        {
          id: 'courses',
          label: 'Explore Courses',
          icon: 'school',
          screen: 'explore-courses',
          activeScreens: ['explore-courses', 'courses']
        },
        {
          id: 'explore',
          label: 'Explore Students',
          icon: 'group',
          screen: 'explore',
          activeScreens: ['explore', 'public-profile']
        },
        {
          id: 'quizzes',
          label: 'Skill Assessments',
          icon: 'quiz',
          screen: 'quiz-select',
          activeScreens: ['quiz-select', 'quiz-active', 'quiz-results']
        },
        {
          id: 'internships',
          label: 'Find Internships',
          icon: 'work',
          screen: 'find-internship',
          activeScreens: ['find-internship', 'find-internships']
        },
        {
          id: 'badges',
          label: 'Certifications & Badges',
          icon: 'verified',
          screen: 'badges'
        },
        {
          id: 'profile',
          label: 'Student Profile',
          icon: 'person',
          screen: 'profile',
          activeScreens: ['profile', 'public-profile', 'edit-profile']
        },
        {
          id: 'projects',
          label: 'Submit Project',
          icon: 'cloud_upload',
          screen: 'submit-project',
          activeScreens: ['submit-project', 'project-repo']
        },
        {
          id: 'ai-chat',
          label: 'Skille AI Assistant',
          icon: 'smart_toy',
          screen: 'ai-chat'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          screen: 'settings'
        }
      ];

  const isItemActive = (item) => {
    if (item.activeScreens) {
      return item.activeScreens.includes(currentScreen);
    }
    return currentScreen === item.screen;
  };

  return (
    <aside className="hidden md:flex h-full w-80 fixed left-0 top-0 z-50 bg-surface dark:bg-inverse-surface shadow-xl flex-col gap-base p-stack-md pt-margin-desktop border-r border-surface-container-high/60 transition-colors">
      {/* User Avatar & Identity */}
      <div
        onClick={() => navigate(isRecruiter ? 'recruiter-profile' : 'profile')}
        className="flex items-center gap-4 px-4 mb-6 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <img
          alt={userProfile.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 shadow-sm"
          src={userProfile.avatar}
        />
        <div className="overflow-hidden">
          <h2 className="font-headline-md text-headline-md font-black text-primary dark:text-primary-fixed truncate">
            {userProfile.name}
          </h2>
          <p className="font-label-md text-label-md text-on-surface-variant dark:text-secondary-fixed-dim truncate">
            {userProfile.major}
          </p>
          <span className="inline-block mt-1 bg-primary-container text-on-primary-container font-label-sm text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            Level {userProfile.level} • {userProfile.xp} XP
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="flex flex-col gap-1 w-full flex-grow">
        {menuItems.map((item) => {
          const active = isItemActive(item);
          return (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.screen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-full font-label-md text-label-md transition-all duration-200 text-left ${
                  active
                    ? 'bg-secondary-container dark:bg-secondary-container/40 text-on-secondary-container dark:text-inverse-on-surface font-bold translate-x-1 shadow-sm'
                    : 'text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-tertiary-container hover:translate-x-1'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Dark mode & Logout Footer */}
      <div className="pt-4 border-t border-surface-container-high/70 flex flex-col gap-2">
        <div className="flex items-center justify-between px-4 py-2 bg-surface-container-lowest dark:bg-surface-container-high/40 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              {darkMode ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="font-label-sm text-label-sm">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
              darkMode ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
          </button>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 text-error hover:bg-error-container/20 rounded-xl font-label-md text-label-md transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Switch Account / Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
