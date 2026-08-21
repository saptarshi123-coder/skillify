import React from 'react';
import { useApp } from './context/AppContext';
import BottomNav from './components/Navigation/BottomNav';
import CertificateModal from './components/CertificateModal';
import ExitAppModal from './components/ExitAppModal';
import Toast from './components/Toast';

import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SelectSkillScreen from './screens/SelectSkillScreen';
import DashboardScreen from './screens/DashboardScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import ExploreScreen from './screens/ExploreScreen';
import AIChatScreen from './screens/AIChatScreen';
import QuizSelectScreen from './screens/QuizSelectScreen';
import ActiveQuizScreen from './screens/ActiveQuizScreen';
import QuizResultsScreen from './screens/QuizResultsScreen';
import BadgesScreen from './screens/BadgesScreen';
import ProfileScreen from './screens/ProfileScreen';
import PublicProfileScreen from './screens/PublicProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import SubmitProjectScreen from './screens/SubmitProjectScreen';
import ProjectRepoScreen from './screens/ProjectRepoScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen />;
      case 'login':
        return <LoginScreen />;
      case 'signup':
        return <SignupScreen />;
      case 'select-skill':
        return <SelectSkillScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'discover':
        return <DiscoverScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'ai-chat':
        return <AIChatScreen />;
      case 'quiz-select':
        return <QuizSelectScreen />;
      case 'quiz-active':
        return <ActiveQuizScreen />;
      case 'quiz-results':
        return <QuizResultsScreen />;
      case 'badges':
        return <BadgesScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'public-profile':
        return <PublicProfileScreen />;
      case 'edit-profile':
        return <EditProfileScreen />;
      case 'submit-project':
        return <SubmitProjectScreen />;
      case 'project-repo':
        return <ProjectRepoScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const showBottomNav = !['loading', 'login', 'signup', 'select-skill', 'quiz-active'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-slate-900/5 dark:bg-[#0f1115] flex justify-center w-full transition-colors">
      {/* Mobile App Canvas Container (Full width on phones, centered mobile canvas on desktop) */}
      <div className="w-full max-w-md min-h-screen bg-background text-on-surface shadow-2xl relative flex flex-col font-sans transition-colors border-x border-transparent dark:border-white/5">
        
        {/* Active Screen */}
        <div className="flex-1 w-full">
          {renderScreen()}
        </div>

        {/* Fixed Mobile Bottom Navigation */}
        {showBottomNav && <BottomNav />}

        {/* Modals & Global Notifications */}
        <CertificateModal />
        <ExitAppModal />
        <Toast />
      </div>
    </div>
  );
}
