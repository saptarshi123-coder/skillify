import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

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
    <div className="w-full pb-20 transition-colors">
      <Navbar
        title={`${activeSubject.name} Assessment`}
        showBack={true}
        onBack={() => {
          if (window.confirm("Exit assessment? Answers will be evaluated.")) {
            submitQuiz();
          }
        }}
      />

      <main className="px-4 py-4 space-y-4 w-full">
        
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
    </div>
  );
}
