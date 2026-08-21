import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function SubmitProjectScreen() {
  const { submitProject, goBack, showToast, userProfile } = useApp();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Computer Science',
    language: 'Python',
    description: '',
    link: '',
    badge: 'Public'
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDirectCodeMode, setIsDirectCodeMode] = useState(false);
  const [directCodeText, setDirectCodeText] = useState('');
  const [directFileName, setDirectFileName] = useState('main.py');

  const detectLanguageFromFile = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py':
        return { language: 'Python', category: 'AI & ML' };
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'h':
      case 'hpp':
      case 'c':
        return { language: 'C++', category: 'Computer Science' };
      case 'js':
      case 'jsx':
        return { language: 'JavaScript', category: 'Web Engineering' };
      case 'ts':
      case 'tsx':
        return { language: 'TypeScript', category: 'Web Engineering' };
      case 'rs':
        return { language: 'Rust', category: 'Computer Science' };
      case 'java':
        return { language: 'Java', category: 'Computer Science' };
      case 'html':
      case 'css':
        return { language: 'JavaScript', category: 'Web Engineering' };
      case 'sql':
        return { language: 'Python', category: 'Cloud Systems' };
      default:
        return null;
    }
  };

  const processFiles = (filesList) => {
    const validFiles = Array.from(filesList);
    if (!validFiles.length) return;

    let processedCount = 0;
    const newFiles = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lineCount = (content.match(/\n/g) || []).length + 1;
        const sizeInKB = (file.size / 1024).toFixed(1);

        newFiles.push({
          name: file.name,
          type: 'code',
          commit: 'Added via code file upload',
          time: 'Just now',
          content: content,
          size: `${sizeInKB} KB`,
          lines: lineCount,
          rawFile: file
        });

        processedCount++;
        if (processedCount === validFiles.length) {
          setUploadedFiles((prev) => [...prev, ...newFiles]);
          setActivePreviewIndex(0);

          // Auto-detect language & category from the first file
          const detected = detectLanguageFromFile(newFiles[0].name);
          if (detected) {
            setFormData((prev) => ({
              ...prev,
              language: detected.language,
              category: detected.category,
              title: prev.title || newFiles[0].name.replace(/\.[^/.]+$/, '')
            }));
          }

          showToast(`📁 ${newFiles.length} code file(s) loaded successfully!`);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activePreviewIndex >= indexToRemove && activePreviewIndex > 0) {
      setActivePreviewIndex(activePreviewIndex - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please provide a project title", "error");
      return;
    }

    let finalFiles = [...uploadedFiles];

    // If in direct paste mode and has code
    if (isDirectCodeMode && directCodeText.trim()) {
      finalFiles.push({
        name: directFileName.trim() || 'main.py',
        type: 'code',
        commit: 'Direct source code input',
        time: 'Just now',
        content: directCodeText,
        size: `${(directCodeText.length / 1024).toFixed(1)} KB`,
        lines: (directCodeText.match(/\n/g) || []).length + 1
      });
    }

    // Add default README if not present
    if (!finalFiles.some((f) => f.name.toLowerCase().includes('readme'))) {
      finalFiles.push({
        name: 'README.md',
        type: 'draft',
        commit: 'Create README.md for project',
        time: 'Just now',
        content: `# 🚀 ${formData.title}\n\n${formData.description || 'Project source code.'}\n\n### Tech Stack\n- Language: ${formData.language}\n- Category: ${formData.category}\n- Author: ${userProfile?.name || 'Student'}\n- Repository: ${formData.link || 'Internal Skillify Portfolio'}`
      });
    }

    const projectPayload = {
      ...formData,
      author: userProfile?.name || 'Student',
      files: finalFiles,
      codeContent: finalFiles.find((f) => f.type === 'code')?.content || directCodeText,
      fileName: finalFiles.find((f) => f.type === 'code')?.name || directFileName,
      fileSize: finalFiles.find((f) => f.type === 'code')?.size || '1.0 KB',
      commitsCount: finalFiles.length + 1,
      branch: 'main'
    };

    submitProject(projectPayload);
  };

  const activeFile = uploadedFiles[activePreviewIndex];

  return (
    <div className="w-full pb-28 transition-colors">
      <Navbar title="Submit Project" showBack={true} onBack={goBack} />

      <main className="px-4 py-4 space-y-4 w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Main Details Card */}
          <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 space-y-4">
            
            <div className="border-b border-surface-variant/40 pb-2">
              <h2 className="font-headline text-base font-bold text-on-surface dark:text-inverse-on-surface">
                Showcase Your Code
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">
                Upload your code files and publish your project to the portfolio gallery.
              </p>
            </div>

            {/* Project Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Distributed Task Scheduler"
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-primary text-on-surface dark:text-inverse-on-surface"
              />
            </div>

            {/* Category & Language */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-2 text-xs outline-none text-on-surface dark:text-inverse-on-surface"
                >
                  <option value="Computer Science">DSA / Systems</option>
                  <option value="Web Engineering">Fullstack Web</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Cloud Systems">Cloud & DevOps</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-2 text-xs outline-none text-on-surface dark:text-inverse-on-surface"
                >
                  <option value="Python">Python</option>
                  <option value="C++">C++</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Rust">Rust</option>
                  <option value="Java">Java</option>
                </select>
              </div>
            </div>

            {/* GitHub / Repo Link */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider">
                Repository / Live Link (Optional)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://github.com/username/project"
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-primary text-on-surface dark:text-inverse-on-surface"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider">
                Description & Architecture *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the data structures, algorithms, and key features..."
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-primary text-on-surface dark:text-inverse-on-surface"
              />
            </div>

          </div>

          {/* CODE FILE UPLOAD SECTION */}
          <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 space-y-4">
            
            <div className="flex items-center justify-between border-b border-surface-variant/40 pb-2">
              <div>
                <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">code</span>
                  <span>Upload Code Files</span>
                </h3>
                <p className="text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">
                  Attach your source files or paste code snippets directly
                </p>
              </div>

              {/* Mode switcher toggle */}
              <div className="flex bg-surface-container-high dark:bg-surface-container-highest rounded-xl p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setIsDirectCodeMode(false)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    !isDirectCodeMode
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setIsDirectCodeMode(true)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    isDirectCodeMode
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Paste Code
                </button>
              </div>
            </div>

            {!isDirectCodeMode ? (
              <>
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : 'border-outline-variant/70 hover:border-primary bg-surface/50 dark:bg-inverse-surface/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-2xl">
                      upload_file
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                      Click to browse or drag & drop code files
                    </p>
                    <p className="text-[10px] text-secondary">
                      Supports .py, .cpp, .js, .ts, .rs, .java, .html, .css, .json, .md, .sql
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".js,.jsx,.ts,.tsx,.py,.cpp,.c,.h,.hpp,.rs,.java,.html,.css,.json,.md,.sql,.txt,.go,.kt,.swift,.rb,.php,.sh"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files Chips */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider">
                      Uploaded Files ({uploadedFiles.length})
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActivePreviewIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono transition-all cursor-pointer ${
                            activePreviewIndex === idx
                              ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                              : 'border-outline-variant/60 bg-surface dark:bg-inverse-surface/40 text-on-surface dark:text-inverse-on-surface'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm text-primary">
                            {file.name.endsWith('.md') ? 'description' : 'code'}
                          </span>
                          <span className="truncate max-w-[140px]">{file.name}</span>
                          <span className="text-[10px] text-secondary">({file.size})</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            className="hover:text-error text-secondary p-0.5"
                            title="Remove file"
                          >
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Code Previewer Box */}
                    {activeFile && (
                      <div className="rounded-2xl border border-surface-variant/40 overflow-hidden bg-[#16181f] text-slate-100 mt-3 shadow-inner">
                        <div className="bg-[#1e212b] px-3.5 py-2 flex items-center justify-between text-xs border-b border-white/10 font-mono">
                          <span className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                            <span className="material-symbols-outlined text-xs text-primary">terminal</span>
                            <span>{activeFile.name}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {activeFile.lines} lines • {activeFile.size}
                          </span>
                        </div>

                        <pre className="p-3.5 overflow-x-auto text-[11px] leading-relaxed max-h-56 font-mono hide-scrollbar select-text text-slate-200">
                          <code>{activeFile.content}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Direct Code Paste Mode */
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">
                      File Name
                    </label>
                    <input
                      type="text"
                      value={directFileName}
                      onChange={(e) => {
                        setDirectFileName(e.target.value);
                        const detected = detectLanguageFromFile(e.target.value);
                        if (detected) {
                          setFormData((prev) => ({
                            ...prev,
                            language: detected.language,
                            category: detected.category
                          }));
                        }
                      }}
                      placeholder="e.g. solution.py, App.jsx, tracker.cpp"
                      className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:border-primary text-on-surface dark:text-inverse-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider">
                    Source Code
                  </label>
                  <textarea
                    rows={8}
                    value={directCodeText}
                    onChange={(e) => setDirectCodeText(e.target.value)}
                    placeholder="Paste or write your full code implementation here..."
                    className="w-full bg-[#16181f] text-slate-200 border border-white/10 rounded-2xl p-3 text-xs font-mono outline-none focus:border-primary leading-relaxed hide-scrollbar"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary-container transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">cloud_upload</span>
            <span>Publish Project to Portfolio & Discover</span>
          </button>

        </form>
      </main>
    </div>
  );
}
