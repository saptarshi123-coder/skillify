import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function ProjectRepoScreen() {
  const { activeProject, goBack, showToast } = useApp();
  const [selectedFile, setSelectedFile] = useState(() => {
    if (activeProject?.files && activeProject.files.length > 0) {
      return activeProject.files[0];
    }
    return null;
  });

  const project = activeProject || {
    title: "log-Manager",
    category: "Computer Science",
    language: "C++",
    badge: "Public",
    description: "A lightweight, blazing-fast, console-based Data Structures and Algorithms (DSA) progress tracker built entirely in C++ with custom Doubly Linked List (DLL) architecture.",
    branch: "main",
    commitsCount: 14,
    author: "Alex Rivera (FzAlpha)",
    stars: 24,
    link: "https://github.com/alexrivera/log-manager",
    files: [
      { name: ".gitignore", type: "draft", commit: "stopped tracking exe", time: "3 months ago", content: "build/\n*.exe\n*.o\n.DS_Store\nlogs.txt" },
      { name: "README.md", type: "draft", commit: "Create README.md for Log Manager project", time: "3 months ago", content: "# 🚀 Log Manager\n\nCustom C++ DSA tracker using Doubly Linked List." },
      { name: "files.txt", type: "draft", commit: "refactored and polished", time: "3 months ago", content: "main.cpp\ntracker.h\ntest.cpp" },
      { name: "main.cpp", type: "code", commit: "refactored to multi-file architecture...", time: "4 months ago", content: `#include <iostream>\n#include "tracker.h"\n\nint main() {\n    DSATracker tracker;\n    tracker.addProblem("Two Sum", "Arrays", "Easy");\n    tracker.addProblem("LRU Cache", "Linked List", "Medium");\n    tracker.displaySummary();\n    return 0;\n}` },
      { name: "tracker.h", type: "data_object", commit: "refactored and polished", time: "3 months ago", content: `#pragma once\n#include <string>\n\nstruct ProblemNode {\n    std::string title;\n    std::string topic;\n    std::string difficulty;\n    ProblemNode* prev;\n    ProblemNode* next;\n};\n\nclass DSATracker {\n    ProblemNode* head;\n    ProblemNode* tail;\npublic:\n    DSATracker() : head(nullptr), tail(nullptr) {}\n    void addProblem(std::string t, std::string top, std::string diff);\n    void displaySummary();\n};` }
    ]
  };

  const handleStar = () => {
    showToast("⭐ Repository starred! Added to your favorites.");
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title={project.title} showBack={true} onBack={goBack} />

      <main className="px-4 py-4 space-y-4 w-full">
        
        {/* Repo Header */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high p-4 rounded-3xl shadow-card border border-surface-variant/40 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-xl">terminal</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface truncate">
                    {project.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-primary text-white font-mono font-bold shadow-2xs">
                    {project.badge || "Public"}
                  </span>
                </div>
                <p className="text-[10px] text-secondary">
                  By {project.author || "Alex Rivera"} • {project.language}
                </p>
              </div>
            </div>

            <button
              onClick={handleStar}
              className="p-2 rounded-xl bg-surface dark:bg-inverse-surface border border-outline-variant/50 flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0"
            >
              <span className="material-symbols-outlined text-sm icon-filled">star</span>
              <span>{project.stars || 24}</span>
            </button>
          </div>

          <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* File Tree */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl shadow-card border border-surface-variant/40 overflow-hidden">
          
          <div className="bg-surface-container-high dark:bg-surface-container-highest px-4 py-2.5 flex items-center justify-between text-xs border-b border-surface-variant/40">
            <span className="font-mono font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">call_split</span>
              <span>{project.branch || 'main'}</span>
            </span>
            <span className="text-[10px] text-secondary">
              {project.commitsCount || 14} Commits
            </span>
          </div>

          <div className="divide-y divide-surface-variant/30">
            {(project.files || []).map((file, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedFile(file)}
                className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                  selectedFile?.name === file.name
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-sm text-primary">
                    {file.name.endsWith('.md') ? 'description' : file.name.endsWith('.cpp') || file.name.endsWith('.h') ? 'code' : 'draft'}
                  </span>
                  <span className="font-mono text-[11px] truncate">{file.name}</span>
                </div>
                <span className="text-[10px] text-secondary shrink-0">{file.time}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Selected File Viewer or Readme */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-surface-variant/40">
            <span className="font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">article</span>
              <span>{selectedFile ? selectedFile.name : 'README.md Preview'}</span>
            </span>
            {selectedFile && (
              <button
                onClick={() => setSelectedFile(null)}
                className="text-[10px] text-primary underline"
              >
                View README
              </button>
            )}
          </div>

          <pre className="p-3 bg-[#1e1b18] text-white rounded-xl overflow-x-auto text-[11px] leading-relaxed hide-scrollbar">
            <code>
              {selectedFile?.content || project.readme || `# ${project.title}\n\n${project.description}`}
            </code>
          </pre>
        </div>

      </main>
    </div>
  );
}
