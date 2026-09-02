import React from 'react';
import { useApp } from './context/AppContext';
import BottomNav from './components/Navigation/BottomNav';
import CertificateModal from './components/CertificateModal';
import CVGeneratorModal from './components/CVGeneratorModal';
import ExitAppModal from './components/ExitAppModal';
import Toast from './components/Toast';

import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ChooseRoleScreen from './screens/ChooseRoleScreen';
import CompleteHRProfileScreen from './screens/CompleteHRProfileScreen';
import RecruiterProfileScreen from './screens/RecruiterProfileScreen';
import SelectSkillScreen from './screens/SelectSkillScreen';
import DashboardScreen from './screens/DashboardScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import FindInternshipsScreen from './screens/FindInternshipsScreen';
import ListInternshipScreen from './screens/ListInternshipScreen';
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
import ExploreCoursesScreen from './screens/ExploreCoursesScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import InternshipApplicationMessageScreen from './screens/InternshipApplicationMessageScreen';
import HRNotificationsScreen from './screens/HRNotificationsScreen';
import StudentApplicantsScreen from './screens/StudentApplicantsScreen';
import ChatScreen from './screens/ChatScreen';

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
      case 'choose-role':
        return <ChooseRoleScreen />;
      case 'complete-hr-profile':
        return <CompleteHRProfileScreen />;
      case 'recruiter-profile':
        return <RecruiterProfileScreen />;
      case 'select-skill':
        return <SelectSkillScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'courses':
      case 'explore-courses':
        return <ExploreCoursesScreen />;
      case 'discover':
        return <DiscoverScreen />;
      case 'find-internship':
      case 'find-internships':
        return <FindInternshipsScreen />;
      case 'list-internship':
      case 'list-internships':
        return <ListInternshipScreen />;
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
      case 'notifications':
        return <NotificationsScreen />;
      case 'internship-application-message':
        return <InternshipApplicationMessageScreen />;
      case 'hr-notifications':
        return <HRNotificationsScreen />;
      case 'student-applicants':
        return <StudentApplicantsScreen />;
      case 'chat':
        return <ChatScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const showBottomNav = !['loading', 'login', 'signup', 'choose-role', 'complete-hr-profile', 'select-skill', 'quiz-active', 'internship-application-message', 'chat'].includes(currentScreen);

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
        <CVGeneratorModal />
        <ExitAppModal />
        <Toast />
      </div>
    </div>
  );
}
