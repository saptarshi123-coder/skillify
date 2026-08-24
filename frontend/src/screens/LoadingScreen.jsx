import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LoadingScreen() {
  const { navigate, isAuthenticated, userProfile, userSelectedSkills } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 25;
      });
    }, 60);

    // Fallback safety timeout (max 500ms)
    const safety = setTimeout(() => {
      clearInterval(timer);
      setProgress(100);
    }, 500);

    return () => {
      clearInterval(timer);
      clearTimeout(safety);
    };
  }, []);

  const routeDestination = () => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    if (!userProfile.roleSelected && !userProfile.role_selected) {
      navigate('choose-role');
      return;
    }
    if (userProfile.role === 'recruiter') {
      if (!userProfile.hrProfileCompleted && !userProfile.hr_profile_completed) {
        navigate('complete-hr-profile');
      } else {
        navigate('recruiter-profile');
      }
      return;
    }
    // Student path
    if (userSelectedSkills && userSelectedSkills.length > 0) {
      navigate('dashboard');
    } else {
      navigate('select-skill');
    }
  };

  // Navigate once progress hits 100
  useEffect(() => {
    if (progress >= 100) {
      routeDestination();
    }
  }, [progress, isAuthenticated, userProfile, userSelectedSkills, navigate]);

  const handleSkip = () => {
    routeDestination();
  };

  return (
    <main className="relative z-10 w-full h-screen flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop bg-surface dark:bg-inverse-surface overflow-hidden transition-colors">
      {/* Centerpiece Container with Breathe Animation */}
      <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-stack-lg shadow-[0_8px_32px_rgba(154,0,2,0.12)] flex flex-col items-center justify-center max-w-sm w-full breathe-animation border border-outline-variant/30">
        {/* Logo Container */}
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-primary-container/10 dark:bg-primary-container/20 mb-stack-md flex items-center justify-center border-4 border-primary/20 shadow-inner">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary text-white flex items-center justify-center shadow-lg spin-pause-animation">
            <span className="material-symbols-outlined text-4xl md:text-5xl">school</span>
          </div>
        </div>

        {/* Typography */}
        <h1 className="font-headline-lg text-headline-lg md:font-headline-xl md:text-headline-xl text-primary mb-stack-sm text-center font-extrabold tracking-tight">
          Skillify
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-secondary-fixed-dim text-center mb-stack-lg opacity-85">
          Preparing your learning journey...
        </p>

        {/* Loading Indicator */}
        <div className="w-full h-2 bg-surface-container-high dark:bg-surface-container-highest rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Direct Skip button */}
        <button
          onClick={handleSkip}
          className="font-label-sm text-xs text-primary hover:underline mt-2 font-semibold"
        >
          {isAuthenticated ? "Skip to Dashboard →" : "Skip to Sign In →"}
        </button>
      </div>

      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
    </main>
  );
}
