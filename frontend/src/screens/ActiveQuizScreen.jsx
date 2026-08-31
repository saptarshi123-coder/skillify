import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';
import { useProctoring } from '../hooks/useProctoring';

export default function ActiveQuizScreen() {
  const {
    activeSubject,
    quizQuestionIndex,
    setQuizQuestionIndex,
    selectedAnswers,
    answerQuestion,
    submitQuiz,
    navigate
  } = useApp();

  const questions = activeSubject?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[quizQuestionIndex];

  const [timeLeft, setTimeLeft] = useState(600);
  const [textInput, setTextInput] = useState('');
  const [violationAlert, setViolationAlert] = useState(null);
  const [isPiPMinimized, setIsPiPMinimized] = useState(false);

  // Live Proctoring & Face Authentication Hook
  const {
    videoRef,
    hasPermission,
    permissionStatus,
    isInitializing,
    strikes,
    maxStrikes,
    faceStatus,
    initMediaStream
  } = useProctoring({
    enabled: true,
    intervalMs: 4000,
    endpoint: '/api/proctor/verify-frame',
    maxStrikes: 3,
    onViolation: (violationRecord) => {
      setViolationAlert({
        strike: violationRecord.strike,
        reason: violationRecord.reason,
        timestamp: Date.now()
      });
    },
    onMaxStrikesExceeded: (strikeCount) => {
      alert(`⚠️ Proctoring Violation: Maximum strikes (${strikeCount}/3) exceeded. Your assessment is being automatically submitted for review.`);
      submitQuiz();
    },
    onVideoOff: (reason) => {
      alert(`⚠️ Proctoring Security Violation: Camera feed was turned OFF (${reason}). Your assessment is being automatically submitted.`);
      submitQuiz();
    }
  });

  // Auto-submit quiz if camera access is permanently denied or revoked after initialization
  useEffect(() => {
    if (!isInitializing && (permissionStatus === 'denied' || (permissionStatus === 'unsupported' && !hasPermission))) {
      const timer = setTimeout(() => {
        alert('⚠️ Proctoring Required: Camera access is disabled or unavailable. Your assessment is being automatically submitted.');
        submitQuiz();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitializing, permissionStatus, hasPermission, submitQuiz]);

  // Auto-dismiss temporary violation alert banner after 6 seconds
  useEffect(() => {
    if (violationAlert) {
      const timer = setTimeout(() => {
        setViolationAlert(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [violationAlert]);

  // Synchronize text input when switching questions
  useEffect(() => {
    if (currentQuestion) {
      const saved = selectedAnswers[currentQuestion.id];
      setTextInput(saved !== undefined ? String(saved) : '');
    }
  }, [quizQuestionIndex, currentQuestion, selectedAnswers]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitQuiz]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = totalQuestions > 0
    ? ((quizQuestionIndex + 1) / totalQuestions) * 100
    : 0;

  const handleNext = () => {
    if (quizQuestionIndex < totalQuestions - 1) {
      setQuizQuestionIndex(quizQuestionIndex + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrev = () => {
    if (quizQuestionIndex > 0) {
      setQuizQuestionIndex(quizQuestionIndex - 1);
    } else {
      if (window.confirm("Exit quiz? Progress will be lost.")) {
        navigate('select-skill');
      }
    }
  };

  const handleTextChange = (val) => {
    setTextInput(val);
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, val);
    }
  };

  if (!activeSubject || !currentQuestion) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">quiz</span>
          </div>
          <p className="font-headline text-sm font-bold text-on-surface">No active quiz questions found.</p>
          <button onClick={() => navigate('select-skill')} className="mt-3 bg-primary text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm">
            Choose a Skill
          </button>
        </div>
      </div>
    );
  }

  const chosenOption = selectedAnswers[currentQuestion.id];
  const isAI = Boolean(activeSubject.isAI);
  const qType = currentQuestion.type || 'mcq';
  const hasOptions = currentQuestion.options && currentQuestion.options.length > 0;

  // Render question text & code blocks
  const renderQuestionBody = () => {
    const text = currentQuestion.question || '';
    if (text.includes('```')) {
      const parts = text.split(/```(?:python|javascript|html|css)?/);
      return (
        <div className="space-y-2">
          {parts[0] && (
            <h2 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface leading-snug">
              {parts[0].trim()}
            </h2>
          )}
          {parts[1] && (
            <div className="bg-[#1e1e1e] text-[#4ec9b0] p-3 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-outline-variant/30 leading-relaxed">
              <pre className="text-white font-mono">{parts[1].replace(/```/g, '').trim()}</pre>
            </div>
          )}
        </div>
      );
    }
    return (
      <h2 className="font-headline text-base font-bold text-on-surface dark:text-inverse-on-surface leading-snug">
        {text}
      </h2>
    );
  };

  return (
    <div className="w-full pb-32 transition-colors relative">
      <Navbar
        title={`${activeSubject.name} Assessment`}
        showBack={true}
        onBack={() => {
          if (window.confirm("Exit assessment? Answers will be evaluated.")) {
            submitQuiz();
          }
        }}
      />

      <main className="px-4 py-4 space-y-4 w-full max-w-4xl mx-auto">
        
        {/* Violation Alert Banner */}
        {violationAlert && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-300 rounded-2xl p-3.5 flex items-center justify-between shadow-md animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl shrink-0">
                warning
              </span>
              <div>
                <p className="text-xs font-bold font-mono tracking-wide">
                  PROCTORING WARNING • STRIKE {violationAlert.strike}/{maxStrikes}
                </p>
                <p className="text-[11px] font-sans text-red-600 dark:text-red-300">
                  {violationAlert.reason}
                </p>
              </div>
            </div>
            <button
              onClick={() => setViolationAlert(null)}
              className="text-xs font-bold font-mono text-red-700 dark:text-red-300 hover:opacity-75 px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* AI Engine Banner */}
        {isAI && (
          <div className="bg-gradient-to-r from-primary/15 via-primary-container/20 to-primary/10 border border-primary/30 rounded-2xl px-3.5 py-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base animate-pulse">psychology</span>
              <span className="text-[11px] font-bold text-primary dark:text-primary-fixed">
                AI Skill Assessment • NLP Evaluator
              </span>
            </div>
            <span className="text-[10px] font-semibold bg-primary text-white px-2 py-0.5 rounded-full">
              {currentQuestion.typeLabel || 'Dynamic AI'}
            </span>
          </div>
        )}

        {/* Quiz Question Card */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 space-y-4">
          
          {/* Progress & Timer Header */}
          <div className="flex justify-between items-center border-b border-surface-variant/40 pb-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-on-surface-variant dark:text-secondary-fixed-dim uppercase tracking-wider">
                Question {quizQuestionIndex + 1} of {totalQuestions}
              </span>
              <div className="w-28 h-2 bg-primary/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-sm">timer</span>
              <span className="text-xs font-bold font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div>
            {renderQuestionBody()}
            <span className="inline-block mt-2.5 text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              {currentQuestion.category || currentQuestion.typeLabel || activeSubject.name}
            </span>
          </div>

          {/* Answer Options / Text Input */}
          {hasOptions ? (
            <div className="space-y-2.5 pt-1">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = chosenOption === idx || chosenOption === option;
                const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

                return (
                  <div
                    key={idx}
                    onClick={() => answerQuestion(currentQuestion.id, idx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 active:scale-[0.99] ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-surface-variant/70 bg-surface dark:bg-inverse-surface/40 hover:border-primary/50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-high dark:bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {optionLetters[idx]}
                    </div>

                    <span className="text-xs text-on-surface dark:text-inverse-on-surface font-medium flex-1">
                      {option}
                    </span>

                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-base icon-filled shrink-0">
                        check_circle
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold text-on-surface-variant dark:text-secondary-fixed-dim">
                {qType === 'output' ? 'Type Expected Output:' : 'Type Your Answer:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={qType === 'output' ? 'e.g. [1, 2, 3] or true' : 'Type concise answer here...'}
                  className="w-full bg-surface dark:bg-inverse-surface/60 border border-outline-variant/70 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                />
                {textInput && (
                  <button
                    onClick={() => handleTextChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary p-1"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-secondary">
                💡 Evaluated dynamically with natural language matching & keyword coverage.
              </p>
            </div>
          )}

          {/* Controls Footer */}
          <div className="flex items-center gap-2 pt-2 border-t border-surface-variant/40">
            <button
              onClick={handlePrev}
              disabled={quizQuestionIndex === 0}
              className="py-2.5 px-3 rounded-xl border border-outline-variant/60 text-xs font-bold text-on-surface-variant disabled:opacity-40 disabled:pointer-events-none hover:bg-black/5"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>{quizQuestionIndex === totalQuestions - 1 ? 'Submit Assessment' : 'Next Question'}</span>
              <span className="material-symbols-outlined text-sm">
                {quizQuestionIndex === totalQuestions - 1 ? 'check' : 'arrow_forward'}
              </span>
            </button>
          </div>

        </div>
      </main>

      {/* Picture-in-Picture (PiP) Live Proctoring Feed */}
      <aside 
        aria-label="Live Proctoring Video Preview"
        className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6 transition-all duration-300"
      >
        <div className={`bg-slate-950/95 dark:bg-[#14171A]/95 backdrop-blur-md rounded-2xl border ${
          strikes > 0 ? 'border-red-500/70 shadow-red-500/20' : 'border-slate-700/60 dark:border-slate-800'
        } shadow-2xl overflow-hidden transition-all duration-300 ${
          isPiPMinimized ? 'w-48 h-12 p-2 flex items-center justify-between' : 'w-48 sm:w-56 p-2 space-y-2'
        }`}>
          
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-1 w-full px-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  hasPermission ? (strikes > 0 ? 'bg-red-400' : 'bg-emerald-400') : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  hasPermission ? (strikes > 0 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-amber-500'
                }`}></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider truncate">
                AI Proctor
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Strike Badge */}
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                strikes === 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
              }`}>
                {strikes}/{maxStrikes} Strikes
              </span>

              {/* Minimize / Expand Button */}
              <button
                onClick={() => setIsPiPMinimized(!isPiPMinimized)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title={isPiPMinimized ? "Expand Preview" : "Minimize Preview"}
              >
                <span className="material-symbols-outlined text-sm leading-none">
                  {isPiPMinimized ? 'open_in_full' : 'close_fullscreen'}
                </span>
              </button>
            </div>
          </div>

          {/* Video Container (Expanded Mode) */}
          {!isPiPMinimized && (
            <div className="relative w-full aspect-4/3 bg-black rounded-xl overflow-hidden border border-slate-800">
              {hasPermission ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  {/* Real-time Status Overlay Badge */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between px-2 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-[9px] font-mono text-slate-200 border border-white/10">
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        faceStatus === 'verified'
                          ? 'bg-emerald-400'
                          : faceStatus === 'violation'
                          ? 'bg-red-400'
                          : 'bg-amber-400 animate-pulse'
                      }`}></span>
                      <span>{faceStatus === 'verified' ? 'Face Verified' : faceStatus === 'violation' ? 'Anomaly Detected' : 'Monitoring'}</span>
                    </span>
                    <span className="material-symbols-outlined text-[11px] text-slate-400">
                      videocam
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center space-y-1.5 bg-slate-900">
                  <span className="material-symbols-outlined text-amber-400 text-xl">
                    {permissionStatus === 'denied' ? 'videocam_off' : 'lock'}
                  </span>
                  <p className="text-[10px] font-mono text-slate-300 leading-tight">
                    {permissionStatus === 'denied' ? 'Camera Blocked' : 'Camera Required'}
                  </p>
                  <button
                    onClick={initMediaStream}
                    className="text-[9px] font-mono font-bold bg-primary text-white px-2 py-1 rounded-md shadow-xs active:scale-95 transition-all"
                  >
                    Enable Camera
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </aside>

    </div>
  );
}
