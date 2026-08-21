import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getQuizForSkill } from '../data/quizData';
import { isAISupportedSkill } from '../services/aiQuizService';

export default function SelectSkillScreen() {
  const { userProfile, updateProfile, userSelectedSkills, saveSelectedSkills, startQuiz, navigate, showToast } = useApp();
  const fileInputRef = useRef(null);

  const SKILL_OPTIONS = [
    {
      id: "Python",
      name: "Python",
      desc: "AI, data structures, automation & scripting",
      icon: "terminal",
      isAI: true
    },
    {
      id: "Web Development",
      name: "Web Development",
      desc: "HTML, CSS, modern JavaScript, React & Web APIs",
      icon: "language",
      isAI: true
    },
    {
      id: "App Development",
      name: "App Development",
      desc: "Android, Flutter, Kotlin & mobile architecture",
      icon: "smartphone",
      isAI: true
    },
    {
      id: "JavaScript",
      name: "JavaScript",
      desc: "Async JS, DOM manipulation & frontend architecture",
      icon: "javascript",
      isAI: false
    },
    {
      id: "C++",
      name: "C++",
      desc: "Systems programming, memory management & DSA",
      icon: "memory",
      isAI: false
    },
    {
      id: "Rust",
      name: "Rust",
      desc: "Memory safety, borrow checker & high performance",
      icon: "build",
      isAI: false
    },
    {
      id: "Java",
      name: "Java",
      desc: "Enterprise backend, JVM & OOP design patterns",
      icon: "coffee",
      isAI: false
    },
    {
      id: "SQL",
      name: "SQL",
      desc: "Relational queries, schema design & database indexing",
      icon: "database",
      isAI: false
    },
    {
      id: "Flutter",
      name: "Flutter",
      desc: "Cross-platform mobile & desktop app interfaces",
      icon: "flutter_dash",
      isAI: true
    },
    {
      id: "Next.js",
      name: "Next.js",
      desc: "Server-side rendering, React framework & fullstack apps",
      icon: "layers",
      isAI: true
    }
  ];

  const [selected, setSelected] = useState(() => {
    return (userSelectedSkills && userSelectedSkills.length > 0) ? userSelectedSkills : [];
  });

  const toggleSkill = (skillName) => {
    if (selected.includes(skillName)) {
      setSelected(selected.filter(s => s !== skillName));
    } else {
      setSelected([...selected, skillName]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload a valid image file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result;
      if (base64Url) {
        updateProfile({ avatar: base64Url });
        showToast("📸 Profile photo updated!");
      }
    };
    reader.readAsDataURL(file);
  };

  const primarySkill = selected[0] || null;
  const isPrimaryAI = primarySkill ? isAISupportedSkill(primarySkill) : false;

  const handleStartQuizOnSkill = async (skillName) => {
    if (selected.length === 0) {
      showToast("Please tap on at least one skill to select it", "info");
      return;
    }
    const chosenSkill = skillName || primarySkill;
    saveSelectedSkills(selected.includes(chosenSkill) ? selected : [chosenSkill, ...selected]);
    const quizSubject = getQuizForSkill(chosenSkill);
    await startQuiz(quizSubject);
  };

  const handleSkip = () => {
    saveSelectedSkills(selected);
    navigate('dashboard');
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-surface flex flex-col pb-16 transition-colors">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-variant/40 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>school</span>
          </div>
          <span className="font-headline text-base font-extrabold text-primary">Skillify</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs font-bold text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          Skip to Dashboard →
        </button>
      </header>

      {/* Main Container */}
      <main className="px-4 py-5 max-w-md mx-auto w-full space-y-4">
        
        {/* Profile Card */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 flex items-center gap-3.5">
          <div className="relative group shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-sm">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center shadow hover:bg-primary-container transition-all active:scale-95 cursor-pointer"
              title="Change Profile Photo"
            >
              <span className="material-symbols-outlined text-[11px]">photo_camera</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">
                {userProfile.name}
              </h2>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Lvl {userProfile.level}
              </span>
            </div>
            <p className="text-[11px] text-secondary truncate mt-0.5">
              {userProfile.major}
            </p>
            <p className="text-[10px] text-secondary/80 truncate">
              {userProfile.college}
            </p>
          </div>
        </div>

        {/* Headline / Assessment Notice */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold px-3 py-1 rounded-full mb-1">
            <span className="material-symbols-outlined text-sm animate-pulse">psychology</span>
            <span>Skill Assessment Setup</span>
          </div>
          <h1 className="font-headline text-lg font-extrabold text-on-surface dark:text-inverse-on-surface tracking-tight">
            Choose Your Skill Track
          </h1>
          <p className="text-xs text-secondary max-w-xs mx-auto">
            Select your skill competencies. You will take an instant assessment on your primary skill.
          </p>
        </div>

        {/* Skill Bento Cards */}
        <div className="space-y-2.5">
          {SKILL_OPTIONS.map((skill) => {
            const isSelected = selected.includes(skill.name);
            const isFirst = selected[0] === skill.name;

            return (
              <div
                key={skill.id}
                onClick={() => toggleSkill(skill.name)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative shadow-sm ${
                  isSelected
                    ? 'bg-surface-container dark:bg-surface-container-high border-primary ring-1 ring-primary'
                    : 'bg-surface-container-lowest dark:bg-surface-container border-surface-variant/50 hover:border-outline-variant'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-high dark:bg-surface-container-lowest text-primary'
                }`}>
                  <span className="material-symbols-outlined text-xl">{skill.icon}</span>
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">
                      {skill.name}
                    </h3>
                    {skill.isAI && (
                      <span className="text-[9px] font-bold bg-primary/15 text-primary dark:text-primary-fixed px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">smart_toy</span>
                        <span>AI Exam</span>
                      </span>
                    )}
                    {isFirst && (
                      <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-md">
                        Primary Quiz
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-secondary line-clamp-1 mt-0.5">
                    {skill.desc}
                  </p>
                </div>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-primary text-white scale-100' : 'border-2 border-outline-variant/60 scale-90'
                  }`}>
                    {isSelected && (
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="sticky bottom-3 pt-3 flex flex-col gap-2 bg-gradient-to-t from-background via-background/95 to-transparent pb-2">
          <button
            type="button"
            onClick={() => handleStartQuizOnSkill(primarySkill)}
            disabled={selected.length === 0}
            className={`w-full py-3 px-4 rounded-2xl text-xs font-bold font-headline shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
              selected.length > 0
                ? isPrimaryAI
                  ? 'bg-gradient-to-r from-primary via-primary-container to-primary text-white shadow-primary/25'
                  : 'bg-primary text-white hover:bg-primary-container'
                : 'bg-surface-variant text-secondary cursor-not-allowed opacity-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isPrimaryAI ? 'psychology' : 'quiz'}
            </span>
            <span>
              {selected.length > 0
                ? `Start ${primarySkill} Assessment Quiz (${isPrimaryAI ? 'AI Engine' : 'Standard'}) →`
                : 'Select a Skill Above to Start Assessment'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-2.5 text-center text-xs font-bold text-secondary hover:text-primary transition-colors"
          >
            Skip Assessment & Go to Dashboard
          </button>
        </div>

      </main>
    </div>
  );
}
