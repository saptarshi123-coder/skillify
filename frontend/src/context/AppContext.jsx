import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { QUIZ_SUBJECTS } from '../data/quizData';
import { STUDENTS_DATA } from '../data/studentsData';
import { sqliteDB } from '../db/sqlite';
import { chatbotService } from '../services/chatbotService';
import { aiQuizService, isAISupportedSkill, normalizeSkillKey } from '../services/aiQuizService';
import confetti from 'canvas-confetti';

const AppContext = createContext();

const DEFAULT_BADGES = [
  { id: "fast-learner", name: "Fast Learner", icon: "bolt", date: "Earned Nov 2023", unlocked: true },
  { id: "quiz-master", name: "Quiz Master", icon: "quiz", date: "Earned Oct 2023", unlocked: true },
  { id: "python-pro", name: "Python Pro", icon: "terminal", date: "Earned Oct 2023", unlocked: true },
  { id: "team-player", name: "Team Player", icon: "group", date: "Earned Sep 2023", unlocked: true },
  { id: "cloud-pioneer", name: "Cloud Pioneer", icon: "cloud", date: "Earned Aug 2023", unlocked: true }
];

export const extractNameFromEmail = (email) => {
  if (!email || !email.includes('@')) return "Google User";
  const prefix = email.split('@')[0];
  const words = prefix
    .replace(/[0-9]+/g, ' ')
    .replace(/[._\-+]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    const raw = email.split('@')[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  return words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export function AppProvider({ children }) {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [navHistory, setNavHistory] = useState(['loading']);

  // Authentication State with SQLite
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('skillify_auth') === 'true';
  });

  // User Profile loaded from SQLite
  const [userProfile, setUserProfile] = useState(() => {
    const dbUser = sqliteDB.getCurrentUser();
    return dbUser ? {
      name: dbUser.name || "Guest User",
      major: dbUser.major || "Computer Science Major",
      college: dbUser.college || "Tech Institute of Technology",
      address: dbUser.address || "123 Education Lane, Tech City",
      email: dbUser.email || "guest@skillify.ai",
      avatar: dbUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      level: dbUser.level || 1,
      xp: dbUser.xp !== undefined ? dbUser.xp : 0,
      streak: dbUser.streak || 1,
      honorsRoll: Boolean(dbUser.honors_roll),
      lookingForInternships: Boolean(dbUser.looking_for_internships),
      authProvider: dbUser.auth_provider || "guest",
      skills: dbUser.skills || [],
      skillsProgress: dbUser.skills_progress || [
        { name: "Frontend Development", progress: 0 },
        { name: "Data Structures & Algorithms", progress: 0 },
        { name: "UI/UX Design", progress: 0 },
        { name: "Python & Data Science", progress: 0 }
      ]
    } : {
      name: "Guest User",
      major: "Computer Science Major",
      college: "Tech Institute of Technology",
      address: "123 Education Lane, Tech City, TC 10101",
      email: "guest@skillify.ai",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      level: 1,
      xp: 0,
      streak: 1,
      honorsRoll: false,
      lookingForInternships: true,
      authProvider: "guest",
      skills: [],
      skillsProgress: [
        { name: "Frontend Development", progress: 0 },
        { name: "Data Structures & Algorithms", progress: 0 },
        { name: "UI/UX Design", progress: 0 },
        { name: "Python & Data Science", progress: 0 }
      ]
    };
  });

  // Selected Skills in SQLite
  const [userSelectedSkills, setUserSelectedSkills] = useState(() => {
    const saved = sqliteDB.getUserSkills();
    return saved.length > 0 ? saved.map(s => s.skill_name) : [];
  });

  // Certificates in SQLite
  const [certificates, setCertificates] = useState(() => {
    return sqliteDB.getCertificates();
  });

  // Projects in SQLite
  const [projects, setProjects] = useState(() => {
    return sqliteDB.getProjects();
  });

  // Active Project for Repo View
  const [activeProject, setActiveProject] = useState(() => {
    const list = sqliteDB.getProjects();
    return list[0] || null;
  });

  // Chat Messages in SQLite
  const [chatMessages, setChatMessages] = useState(() => {
    return sqliteDB.getChatMessages();
  });

  // AI Chatbot Live Integration State
  const [isAITyping, setIsAITyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState("Skillie is thinking... 🧠");
  const [streamingResponse, setStreamingResponse] = useState("");
  const [chatbotStatus, setChatbotStatus] = useState({ online: false, version: 'Local Engine' });
  const [botMood, setBotMood] = useState({ current_mood: 'positive', dominant_mood: 'positive', mood_breakdown: {} });

  // Badges
  const [badges, setBadges] = useState(DEFAULT_BADGES);

  // Active Quiz State
  const [activeQuizSubject, setActiveQuizSubject] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(300);

  // Certificate Modal View
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Public Profile View State (defaults to null, which resolves to userProfile or specific student)
  const [selectedPublicProfile, setSelectedPublicProfile] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Listen for direct deep links like #profile-std_2 or ?profile=sophia_chen
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#profile-')) {
        const idOrUser = hash.replace('#profile-', '');
        const match = STUDENTS_DATA.find(s => s.id === idOrUser || s.username === idOrUser);
        if (match) {
          setSelectedPublicProfile(match);
          setCurrentScreen('public-profile');
        }
      }
    } catch (e) {
      console.log('Hash deep link parse error:', e);
    }
  }, []);

  // Exit App Confirmation Modal
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('skillify_theme') === 'dark';
  });

  // Auto-check Chatbot Backend Health on mount & periodic
  const checkChatbotBackend = useCallback(async (force = false) => {
    const status = await chatbotService.checkBackendHealth(force);
    setChatbotStatus(status);
    return status;
  }, []);

  useEffect(() => {
    checkChatbotBackend(true);
    const interval = setInterval(() => {
      checkChatbotBackend(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [checkChatbotBackend]);

  // Sync Mood State
  useEffect(() => {
    chatbotService.getSessionMood(userProfile.email || 'alex_rivera', chatMessages).then(m => {
      if (m) setBotMood(m);
    });
  }, [chatMessages, userProfile.email]);

  // Apply dark mode class to HTML and document.body
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('dark');
      localStorage.setItem('skillify_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.classList.remove('dark');
      localStorage.setItem('skillify_theme', 'light');
    }
  }, [darkMode]);

  // Sync user profile changes to SQLite
  const updateProfile = (newFields) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...newFields };
      sqliteDB.saveUser({ ...updated, honors_roll: updated.honorsRoll ? 1 : 0, looking_for_internships: updated.lookingForInternships ? 1 : 0 });
      return updated;
    });
  };

  // Toast Helper
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3200);
  };

  // Navigation Helper
  const navigate = (screenName) => {
    setNavHistory(prev => {
      if (prev[prev.length - 1] === screenName) return prev;
      return [...prev, screenName];
    });
    setCurrentScreen(screenName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({ screen: screenName }, '');
    } catch (e) {}
  };

  const goBack = useCallback(() => {
    setNavHistory(prev => {
      if (prev.length > 1) {
        const newHistory = [...prev];
        newHistory.pop();
        const prevScreen = newHistory[newHistory.length - 1];
        if (prevScreen === 'loading') {
          setCurrentScreen(isAuthenticated ? 'dashboard' : 'login');
        } else {
          setCurrentScreen(prevScreen || (isAuthenticated ? 'dashboard' : 'login'));
        }
        return newHistory;
      } else {
        if (isAuthenticated) {
          if (currentScreen !== 'dashboard') {
            setCurrentScreen('dashboard');
            return ['dashboard'];
          } else {
            setIsExitModalOpen(true);
            return prev;
          }
        } else {
          setIsExitModalOpen(true);
          return prev;
        }
      }
    });
  }, [currentScreen, isAuthenticated]);

  // Global Back Handler for Android & Mobile Web
  const handleBackAction = useCallback(() => {
    // 1. If Exit App modal is open, close it
    if (isExitModalOpen) {
      setIsExitModalOpen(false);
      return;
    }

    // 2. If Certificate modal is open, close it
    if (viewingCertificate) {
      setViewingCertificate(null);
      return;
    }

    // 3. If currently on Dashboard, trigger the Exit App Confirmation Dialog
    if (currentScreen === 'dashboard') {
      setIsExitModalOpen(true);
      return;
    }

    // 4. If on login or loading screen with no history, show exit modal
    if ((currentScreen === 'login' || currentScreen === 'loading') && navHistory.length <= 1) {
      setIsExitModalOpen(true);
      return;
    }

    // 5. Navigate to previous screen in history
    goBack();
  }, [isExitModalOpen, viewingCertificate, currentScreen, navHistory, goBack]);

  // Exit App Execution
  const confirmExitApp = async () => {
    try {
      const { App: CapacitorApp } = await import('@capacitor/app');
      await CapacitorApp.exitApp();
    } catch (e) {
      // In browser fallback
    }
    setIsExitModalOpen(false);
    try {
      window.close();
    } catch (e) {}
  };

  // Register Native Capacitor Android Back Button & Mobile Browser popstate
  useEffect(() => {
    let capListener = null;

    const setupListeners = async () => {
      try {
        const { App: CapacitorApp } = await import('@capacitor/app');
        capListener = await CapacitorApp.addListener('backButton', () => {
          handleBackAction();
        });
      } catch (e) {
        // Not in Capacitor
      }
    };

    setupListeners();

    const handlePopState = (e) => {
      e.preventDefault();
      handleBackAction();
      try {
        window.history.pushState(null, '', window.location.href);
      } catch (err) {}
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      if (capListener && typeof capListener.remove === 'function') {
        capListener.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleBackAction]);

  // Authentication Handlers with SQLite Storage
  const loginWithGoogle = (accountData = {}) => {
    let email = accountData.email || "";
    let name = accountData.name || "";

    if (email && (!name || name === "Alex Rivera" || name === "Guest User")) {
      name = extractNameFromEmail(email);
    }

    if (!name || name === "Alex Rivera") {
      name = "Google User";
    }

    if (!email) {
      email = "google.user@gmail.com";
    }

    const avatarUrl = accountData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    const { user, isNew } = sqliteDB.findOrCreateOAuthUser({
      name: name,
      email: email,
      avatar: avatarUrl,
      major: accountData.major || "Computer Science Major",
      college: accountData.college || "Tech Institute of Technology",
      auth_provider: "google"
    });

    // Load saved user skills from SQLite
    const savedSkills = sqliteDB.getUserSkills(user.id || user.email);
    const skillNames = savedSkills.map(s => s.skill_name || s);
    setUserSelectedSkills(skillNames);

    setUserProfile({
      ...user,
      honorsRoll: Boolean(user.honors_roll),
      lookingForInternships: Boolean(user.looking_for_internships),
      authProvider: "google",
      skills: skillNames.length > 0 ? skillNames : user.skills
    });

    setIsAuthenticated(true);
    localStorage.setItem('skillify_auth', 'true');
    showToast(`👋 Welcome, ${name}! Signed in via Google.`);

    if (skillNames.length > 0) {
      navigate('dashboard');
    } else {
      navigate('select-skill');
    }
  };

  const loginWithLinkedIn = (accountData = {}) => {
    const data = (accountData && !accountData.nativeEvent && typeof accountData === 'object') ? accountData : {};
    let email = data.email || "";
    let name = data.name || "";

    if (email && !name) {
      name = extractNameFromEmail(email);
    }

    if (!name) {
      name = "Student Developer";
    }

    if (!email) {
      email = "developer@linkedin.com";
    }

    const avatarUrl = data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    const { user, isNew } = sqliteDB.findOrCreateOAuthUser({
      name: name,
      email: email,
      avatar: avatarUrl,
      major: data.major || "Computer Science Major",
      college: data.college || "Tech Institute of Technology",
      auth_provider: "linkedin"
    });

    const savedSkills = sqliteDB.getUserSkills(user.id || user.email);
    const skillNames = savedSkills.map(s => s.skill_name || s);
    setUserSelectedSkills(skillNames);

    setUserProfile({
      ...user,
      honorsRoll: Boolean(user.honors_roll),
      lookingForInternships: Boolean(user.looking_for_internships),
      authProvider: "linkedin",
      skills: skillNames.length > 0 ? skillNames : user.skills
    });

    setIsAuthenticated(true);
    localStorage.setItem('skillify_auth', 'true');
    showToast(`👋 Welcome, ${name}! Connected via LinkedIn.`);

    if (skillNames.length > 0) {
      navigate('dashboard');
    } else {
      navigate('select-skill');
    }
  };

  const loginWithGitHub = (accountData = {}) => {
    const name = accountData.name || "OpenSource Contributor";
    const email = accountData.email || "developer@github.com";
    
    const { user } = sqliteDB.findOrCreateOAuthUser({
      name: name,
      email: email,
      avatar: accountData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      major: "Software Engineering",
      college: "Tech Institute of Technology",
      auth_provider: "github"
    });

    const savedSkills = sqliteDB.getUserSkills(user.id || user.email);
    const skillNames = savedSkills.map(s => s.skill_name || s);
    setUserSelectedSkills(skillNames);

    setUserProfile({
      ...user,
      authProvider: "github",
      skills: skillNames.length > 0 ? skillNames : user.skills
    });

    setIsAuthenticated(true);
    localStorage.setItem('skillify_auth', 'true');
    showToast(`👋 Welcome, ${name}! Connected via GitHub.`);

    if (skillNames.length > 0) {
      navigate('dashboard');
    } else {
      navigate('select-skill');
    }
  };

  const loginWithEmail = (email, password) => {
    const cleanEmail = email ? email.trim() : "";
    if (!cleanEmail) {
      showToast("Please enter your email address", "error");
      return false;
    }
    if (!password || !password.trim()) {
      showToast("Please enter your password to sign in", "error");
      return false;
    }

    const existingUser = sqliteDB.getUserByEmail(cleanEmail);
    if (existingUser && existingUser.password && existingUser.password !== password.trim()) {
      showToast("Incorrect password. Please verify your credentials.", "error");
      return false;
    }

    const name = existingUser?.name || extractNameFromEmail(cleanEmail);
    
    const { user } = sqliteDB.findOrCreateOAuthUser({
      name: name,
      email: cleanEmail,
      avatar: existingUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      major: existingUser?.major || "Computer Science Major",
      college: existingUser?.college || "Tech Institute of Technology",
      auth_provider: "email"
    });

    sqliteDB.saveUser({ ...user, password: password.trim() });

    const savedSkills = sqliteDB.getUserSkills(user.id || user.email);
    const skillNames = savedSkills.map(s => s.skill_name || s);
    setUserSelectedSkills(skillNames);

    setUserProfile({
      ...user,
      authProvider: "email",
      skills: skillNames.length > 0 ? skillNames : user.skills
    });

    setIsAuthenticated(true);
    localStorage.setItem('skillify_auth', 'true');
    showToast(`👋 Welcome back, ${name}!`);

    if (skillNames.length > 0) {
      navigate('dashboard');
    } else {
      navigate('select-skill');
    }
    return true;
  };

  const signupWithEmail = (fullName, email, password, avatarUrl) => {
    const cleanEmail = email ? email.trim() : "";
    if (!cleanEmail) {
      showToast("Please enter your email address", "error");
      return false;
    }
    if (!password || !password.trim()) {
      showToast("Please create a password for your account", "error");
      return false;
    }

    const name = fullName || (cleanEmail ? extractNameFromEmail(cleanEmail) : "Student");
    
    const { user } = sqliteDB.findOrCreateOAuthUser({
      name: name,
      email: cleanEmail,
      avatar: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      major: "Software Engineering",
      college: "Tech Institute of Technology",
      auth_provider: "email"
    });

    sqliteDB.saveUser({ ...user, password: password.trim() });

    setUserProfile({
      ...user,
      authProvider: "email",
      skills: []
    });
    setUserSelectedSkills([]);

    setIsAuthenticated(true);
    localStorage.setItem('skillify_auth', 'true');
    showToast(`🎉 Account created successfully! Welcome to Skillify, ${name}.`);
    navigate('select-skill');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('skillify_auth');
    const guestUser = {
      id: "usr_guest",
      name: "Guest User",
      email: "guest@skillify.ai",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      major: "Computer Science Major",
      college: "Tech Institute of Technology",
      address: "123 Education Lane, Tech City",
      level: 1,
      xp: 0,
      streak: 1,
      honorsRoll: false,
      lookingForInternships: true,
      authProvider: "guest",
      skills: [],
      skillsProgress: [
        { name: "Frontend Development", progress: 0 },
        { name: "Data Structures & Algorithms", progress: 0 },
        { name: "UI/UX Design", progress: 0 },
        { name: "Python & Data Science", progress: 0 }
      ]
    };
    sqliteDB.saveUser({ ...guestUser, honors_roll: 0, looking_for_internships: 1 });
    setUserProfile(guestUser);
    setUserSelectedSkills([]);
    showToast("You have been signed out. Switched to Guest Mode.");
    navigate('login');
  };

  // Skill Selection Handler
  const saveSelectedSkills = (skillList) => {
    setUserSelectedSkills(skillList);
    sqliteDB.setUserSkills(userProfile.id || userProfile.email, skillList);
    updateProfile({ skills: skillList });
    navigate('dashboard');
  };

  // Auto-delete chat history older than 30 minutes
  useEffect(() => {
    // Initial purge on startup
    const purged = sqliteDB.purgeExpiredChatMessages(30);
    setChatMessages(purged);

    // Periodic purge check every 60 seconds
    const interval = setInterval(() => {
      const remaining = sqliteDB.purgeExpiredChatMessages(30);
      setChatMessages(remaining);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // AI Chat Handler - Hybrid Python Backend & Client NLP Engine
  const sendAIMessage = async (userText) => {
    if (!userText || !userText.trim()) return;

    // Purge expired messages before adding new message
    sqliteDB.purgeExpiredChatMessages(30);

    // 1. Store user message in SQLite & UI state
    const userMsg = sqliteDB.addChatMessage("user", userText.trim());
    setChatMessages(sqliteDB.getChatMessages());

    // 2. Set typing indicator & humor status
    setIsAITyping(true);
    setTypingStatus(chatbotService.getTypingIndicator());
    setStreamingResponse("");

    const userIdentifier = userProfile.email || userProfile.name || 'guest_user';

    try {
      // 3. Request bot response with progressive streaming
      const botResult = await chatbotService.sendMessage(
        userText.trim(),
        userIdentifier,
        (accumulatedText) => {
          setStreamingResponse(accumulatedText);
        }
      );

      // 4. Finalize response into SQLite
      const aiMsg = sqliteDB.addChatMessage("ai", botResult.text, {
        intent: botResult.intent,
        confidence: botResult.confidence,
        sentiment: botResult.sentiment,
        emotion: botResult.emotion,
        responseType: botResult.responseType,
        suggestedActions: botResult.suggestedActions,
        engine: botResult.engine
      });

      const updatedMessages = sqliteDB.getChatMessages();
      setChatMessages(updatedMessages);

      // 5. Update bot mood state
      chatbotService.getSessionMood(userIdentifier, updatedMessages).then(m => {
        if (m) setBotMood(m);
      });
    } catch (err) {
      console.error('Error sending AI message:', err);
      const fallbackMsg = sqliteDB.addChatMessage("ai", "I'm having a brief connection glitch, but I'm back! How can I assist you with Skillify?", {
        intent: 'fallback',
        sentiment: 'neutral'
      });
      setChatMessages(sqliteDB.getChatMessages());
    } finally {
      setIsAITyping(false);
      setStreamingResponse("");
    }
  };

  // Rate AI Message Feedback
  const rateAIMessage = async (messageId, rating, comment = '') => {
    sqliteDB.updateChatMessageFeedback(messageId, rating, comment);
    setChatMessages(sqliteDB.getChatMessages());
    const msgIndex = chatMessages.findIndex(m => m.id === messageId);
    const userIdentifier = userProfile.email || userProfile.name || 'guest_user';
    await chatbotService.submitFeedback(userIdentifier, msgIndex, rating, comment);
    showToast(rating >= 4 ? "🌟 Thank you for the positive feedback!" : "👍 Feedback saved to improve Skillie AI!");
  };

  // Clear AI Chat History
  const clearAIChatHistory = async () => {
    sqliteDB.clearChatMessages();
    setChatMessages([]);
    const userIdentifier = userProfile.email || userProfile.name || 'guest_user';
    await chatbotService.clearBackendConversation(userIdentifier);
    showToast("🧹 Chat history cleared.");
  };

  // Quiz Lifecycle - Dual Engine (AI Quiz Engine for Python, Web Dev & App Dev + Standard for Others)
  const startQuiz = async (subject) => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizScore(null);
    setQuizStartTime(Date.now());
    setQuizTimeRemaining(600);

    const isAI = isAISupportedSkill(subject.id || subject.name);

    if (isAI) {
      try {
        const aiSession = await aiQuizService.startQuiz(subject.id || subject.name);
        setActiveQuizSubject({
          ...subject,
          isAI: true,
          sessionId: aiSession.sessionId,
          questions: aiSession.questions,
          totalQuestions: aiSession.totalQuestions,
          threshold: aiSession.threshold
        });
      } catch (err) {
        console.warn('Fallback to standard questions for AI subject:', err);
        setActiveQuizSubject({ ...subject, isAI: false });
      }
    } else {
      setActiveQuizSubject({ ...subject, isAI: false });
    }

    navigate('quiz-active');
  };

  const answerQuestion = (questionId, optionIndexOrText) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndexOrText
    }));
  };

  const submitQuiz = async () => {
    if (!activeQuizSubject) return;

    const questions = activeQuizSubject.questions || [];
    const timeSpentSec = Math.max(10, Math.round((Date.now() - (quizStartTime || Date.now())) / 1000));
    const mins = Math.floor(timeSpentSec / 60);
    const secs = timeSpentSec % 60;
    const timeFormatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

    let resultData;

    if (activeQuizSubject.isAI) {
      const aiResults = await aiQuizService.getResults(
        activeQuizSubject.sessionId,
        userAnswers,
        questions,
        normalizeSkillKey(activeQuizSubject.name || activeQuizSubject.id),
        timeSpentSec
      );

      resultData = {
        subject: activeQuizSubject,
        scorePercent: aiResults.score,
        score: aiResults.score,
        correctCount: aiResults.correctCount,
        incorrectCount: aiResults.totalCount - aiResults.correctCount,
        totalCount: aiResults.totalCount,
        passed: aiResults.passed,
        xpGained: aiResults.passed ? (activeQuizSubject.xpReward || 120) : Math.max(25, aiResults.correctCount * 12),
        timeSpentSec,
        timeFormatted,
        strengths: aiResults.strengths,
        weakAreas: aiResults.weakAreas,
        review: aiResults.review,
        subjectTitle: activeQuizSubject.name || activeQuizSubject.title || "AI Exam",
        subjectCategory: activeQuizSubject.tag || "AI Assessment"
      };
    } else {
      let correctCount = 0;
      const strengths = [];
      const weakAreas = [];

      questions.forEach(q => {
        const selectedOption = userAnswers[q.id];
        const correctOption = q.correctIndex !== undefined ? q.correctIndex : q.correctAnswer;
        const isCorrect = selectedOption !== undefined && selectedOption === correctOption;

        if (isCorrect) {
          correctCount++;
          if (q.category && !strengths.includes(q.category)) {
            strengths.push(q.category);
          }
        } else {
          if (q.category && !weakAreas.includes(q.category)) {
            weakAreas.push(q.category);
          }
        }
      });

      const totalCount = questions.length || 1;
      const scorePercent = Math.round((correctCount / totalCount) * 100);
      const passed = scorePercent >= 70;
      const xpGained = passed ? (activeQuizSubject.xpReward || 100) : Math.max(20, correctCount * 15);

      resultData = {
        subject: activeQuizSubject,
        scorePercent,
        score: scorePercent,
        correctCount,
        incorrectCount: totalCount - correctCount,
        totalCount,
        passed,
        xpGained,
        timeSpentSec,
        timeFormatted,
        strengths: strengths.length > 0 ? strengths : [activeQuizSubject.name || "Core Principles"],
        weakAreas,
        subjectTitle: activeQuizSubject.name || activeQuizSubject.title || "Exam",
        subjectCategory: activeQuizSubject.tag || activeQuizSubject.category || "Development"
      };
    }

    setQuizScore(resultData);

    // Update XP, Level, Streak, and Skill Progress in Profile & SQLite
    setUserProfile(prev => {
      const newXp = (prev.xp || 0) + (resultData.xpGained || 50);
      const newLevel = Math.floor(newXp / 100) + 1;

      const quizName = (activeQuizSubject.name || activeQuizSubject.id || "Programming").toLowerCase();
      const scoreGain = Math.max(25, Math.round(resultData.scorePercent || 70));

      const updatedProgressList = (prev.skillsProgress || [
        { name: "Frontend Development", progress: 0 },
        { name: "Data Structures & Algorithms", progress: 0 },
        { name: "UI/UX Design", progress: 0 },
        { name: "Python & Data Science", progress: 0 }
      ]).map(sp => {
        const spName = sp.name.toLowerCase();
        let isMatch = false;

        if (quizName.includes('python') || quizName.includes('data') || quizName.includes('ml') || quizName.includes('machine')) {
          isMatch = spName.includes('python') || spName.includes('data');
        } else if (quizName.includes('web') || quizName.includes('javascript') || quizName.includes('react') || quizName.includes('html') || quizName.includes('css')) {
          isMatch = spName.includes('frontend') || spName.includes('web');
        } else if (quizName.includes('c++') || quizName.includes('dsa') || quizName.includes('algorithm') || quizName.includes('rust') || quizName.includes('java')) {
          isMatch = spName.includes('structures') || spName.includes('algorithm');
        } else if (quizName.includes('ui') || quizName.includes('ux') || quizName.includes('design') || quizName.includes('figma')) {
          isMatch = spName.includes('ui') || spName.includes('design');
        }

        if (isMatch) {
          const newProgress = Math.min(100, Math.max(sp.progress + Math.round(scoreGain * 0.5), scoreGain));
          return {
            ...sp,
            progress: newProgress
          };
        }
        return sp;
      });

      const updated = {
        ...prev,
        xp: newXp,
        level: newLevel,
        streak: (prev.streak || 0) + 1,
        skillsProgress: updatedProgressList
      };

      sqliteDB.saveUser({
        ...updated,
        honors_roll: updated.honorsRoll ? 1 : 0,
        looking_for_internships: updated.lookingForInternships ? 1 : 0
      });
      return updated;
    });

    // If passed (≥70%), issue Official Certificate and Unlock Badge
    if (resultData.passed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6f0001', '#9a0002', '#ffa294', '#fff8f3', '#ffdad5']
        });
      } catch (e) {
        console.log('Confetti effect trigger:', e);
      }

      // Add Certificate to SQLite
      const newCert = {
        id: `CERT-${(activeQuizSubject.id || 'SKF').toUpperCase()}-${Date.now().toString().slice(-4)}`,
        title: activeQuizSubject.certTitle || `${activeQuizSubject.name} Certified Specialist`,
        issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        score: `${resultData.scorePercent}%`,
        credentialId: `SKF-${Math.floor(1000 + Math.random() * 9000)}-${(activeQuizSubject.id || 'SKF').toUpperCase()}`,
        issuer: "Skillify AI Certification Authority",
        recipient: userProfile.name || "Student",
        badgeIcon: activeQuizSubject.badgeIcon || activeQuizSubject.icon || "workspace_premium",
        category: activeQuizSubject.name || activeQuizSubject.tag || "Coding"
      };

      sqliteDB.addCertificate(newCert);
      setCertificates(sqliteDB.getCertificates());

      // Unlock / Add Badge in Badges state
      setBadges(prev => {
        const badgeName = activeQuizSubject.badgeName || `${activeQuizSubject.name} Pro`;
        const exists = prev.some(b => b.name.toLowerCase() === badgeName.toLowerCase() || b.id === activeQuizSubject.id);
        if (exists) {
          return prev.map(b => (b.name.toLowerCase() === badgeName.toLowerCase() || b.id === activeQuizSubject.id) ? { ...b, unlocked: true, date: `Earned ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` } : b);
        } else {
          return [
            {
              id: `badge-${activeQuizSubject.id}`,
              name: badgeName,
              icon: activeQuizSubject.badgeIcon || activeQuizSubject.icon || "verified",
              date: `Earned ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
              unlocked: true
            },
            ...prev
          ];
        }
      });
    }

    navigate('quiz-results');
  };

  const issueCertificate = () => {
    if (activeQuizSubject) {
      const allCerts = sqliteDB.getCertificates();
      const match = allCerts.find(c => c.category === activeQuizSubject.name || c.title.includes(activeQuizSubject.name)) || allCerts[0];
      if (match) {
        setViewingCertificate(match);
      }
    }
  };

  // Submit Project
  const submitProject = (projectData) => {
    const newProj = sqliteDB.addProject({
      ...projectData,
      author: userProfile.name,
      stars: 1,
      likes: 1
    });
    setProjects(sqliteDB.getProjects());
    setActiveProject(newProj);
    showToast("🚀 Project successfully published to Discover gallery!");
    navigate('discover');
  };

  const openProjectRepo = (project) => {
    setActiveProject(project);
    navigate('project-repo');
  };

  // Public Profile Handlers
  const openPublicProfile = (studentOrProfile) => {
    if (!studentOrProfile) {
      setSelectedPublicProfile(userProfile);
    } else if (typeof studentOrProfile === 'string') {
      const found = STUDENTS_DATA.find(s => 
        s.id === studentOrProfile || 
        s.username === studentOrProfile ||
        s.name?.toLowerCase() === studentOrProfile.toLowerCase()
      );
      setSelectedPublicProfile(found || userProfile);
    } else {
      setSelectedPublicProfile(studentOrProfile);
    }
    navigate('public-profile');
  };

  const copyPublicProfileLink = async (profile) => {
    const prof = profile || selectedPublicProfile || userProfile;
    const identifier = prof.username || prof.id || 'me';
    const profileUrl = `${window.location.origin}/#profile-${identifier}`;
    
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(profileUrl);
        copied = true;
      }
    } catch (err) {
      copied = false;
    }

    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = profileUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        copied = true;
      } catch (e) {
        console.error('Copy fallback error:', e);
      }
    }

    showToast(`📋 Public profile link for ${prof.name} copied!`);
    return profileUrl;
  };

  const sharePublicProfile = async (profile) => {
    const prof = profile || selectedPublicProfile || userProfile;
    const identifier = prof.username || prof.id || 'me';
    const profileUrl = `${window.location.origin}/#profile-${identifier}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${prof.name} - Skillify AI Portfolio`,
          text: `Check out ${prof.name}'s verified student portfolio and certifications on Skillify AI!`,
          url: profileUrl
        });
        showToast("🚀 Shared successfully!");
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    await copyPublicProfileLink(prof);
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      navigate,
      goBack,
      navHistory,
      isAuthenticated,
      userProfile,
      updateProfile,
      loginWithGoogle,
      loginWithLinkedIn,
      loginWithGitHub,
      loginWithEmail,
      signupWithEmail,
      logout,
      userSelectedSkills,
      saveSelectedSkills,
      chatMessages,
      sendAIMessage,
      isAITyping,
      typingStatus,
      streamingResponse,
      chatbotStatus,
      botMood,
      rateAIMessage,
      clearAIChatHistory,
      checkChatbotBackend,
      certificates,
      projects,
      activeProject,
      openProjectRepo,
      selectedPublicProfile,
      setSelectedPublicProfile,
      openPublicProfile,
      copyPublicProfileLink,
      sharePublicProfile,
      submitProject,
      submitNewProject: submitProject,
      badges,
      activeQuizSubject,
      activeSubject: activeQuizSubject,
      currentQuestionIndex,
      quizQuestionIndex: currentQuestionIndex,
      setCurrentQuestionIndex,
      setQuizQuestionIndex: setCurrentQuestionIndex,
      userAnswers,
      selectedAnswers: userAnswers,
      answerQuestion,
      startQuiz,
      submitQuiz,
      quizScore,
      quizResult: quizScore,
      quizTimeRemaining,
      setQuizTimeRemaining,
      issueCertificate,
      viewingCertificate,
      setViewingCertificate,
      selectedCertModal: viewingCertificate,
      setSelectedCertModal: setViewingCertificate,
      isCertModalOpen: Boolean(viewingCertificate),
      setIsCertModalOpen: (val) => setViewingCertificate(val ? (viewingCertificate || certificates[0]) : null),
      toast,
      showToast,
      darkMode,
      setDarkMode,
      isExitModalOpen,
      setIsExitModalOpen,
      confirmExitApp,
      handleBackAction
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
