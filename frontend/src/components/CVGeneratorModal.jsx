import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { cvGeneratorService, CV_DOMAINS } from '../services/cvGeneratorService';

export default function CVGeneratorModal() {
  const {
    isCVModalOpen,
    closeCVGenerator,
    userProfile,
    certificates = [],
    badges = [],
    projects = [],
    showToast
  } = useApp();

  // Selected Target Domain (defaults to SDE or user's major domain)
  const [selectedDomain, setSelectedDomain] = useState('SDE');
  const [domainsList, setDomainsList] = useState(CV_DOMAINS);
  const [activeTab, setActiveTab] = useState('generator'); // 'generator', 'preview', 'customize', 'plaintext'

  // Custom Editable Overrides
  const [customFields, setCustomFields] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    degree: '',
    graduationYear: '2027',
    headline: '',
    github: '',
    linkedin: '',
    portfolio: ''
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedPdf, setGeneratedPdf] = useState(null); // { blob, url, filename, domain }
  const [generationError, setGenerationError] = useState(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // Sync customFields from userProfile when modal opens
  useEffect(() => {
    if (isCVModalOpen && userProfile) {
      setCustomFields({
        name: userProfile.name || 'Student Developer',
        email: userProfile.email || 'student@skillify.ai',
        phone: userProfile.phone || '+91 98765 43210',
        college: userProfile.college || 'Tech Institute of Technology',
        degree: userProfile.major || 'B.Tech Computer Science',
        graduationYear: userProfile.graduationYear || '2027',
        headline: userProfile.headline || `${userProfile.major || 'Computer Science'} Candidate & Builder`,
        github: userProfile.github || 'https://github.com/student',
        linkedin: userProfile.linkedin || 'https://linkedin.com/in/student',
        portfolio: userProfile.portfolio || 'https://skillify.ai'
      });

      // Load domains from backend if available
      cvGeneratorService.getDomains().then(doms => {
        if (doms && doms.length > 0) {
          setDomainsList(doms);
        }
      });
    }
  }, [isCVModalOpen, userProfile]);

  // Clean up object URLs when modal unmounts or closes
  useEffect(() => {
    return () => {
      if (generatedPdf?.url) {
        URL.revokeObjectURL(generatedPdf.url);
      }
    };
  }, [generatedPdf]);

  if (!isCVModalOpen) return null;

  const currentDomainMeta = domainsList.find(d => d.id === selectedDomain) || domainsList[0];

  const handleGenerate = async (domainToUse = selectedDomain) => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStep(1);

    try {
      // Step 1: Gathering & normalizing credentials
      await new Promise(r => setTimeout(r, 450));
      setGenerationStep(2);

      // Step 2: Running NLP domain engine & layout planning
      await new Promise(r => setTimeout(r, 550));
      setGenerationStep(3);

      // Step 3: Compiling ReportLab vector PDF from backend
      const result = await cvGeneratorService.generateCV({
        targetDomain: domainToUse,
        userProfile,
        badges,
        certificates,
        projects,
        customOverrides: customFields,
        download: false
      });

      setGeneratedPdf(result);
      setActiveTab('preview');
      showToast(`🎉 AI CV successfully generated for ${domainToUse}!`);
    } catch (err) {
      console.error('CV Generation error:', err);
      setGenerationError(err.message || 'Failed to generate PDF. Check backend server.');
      showToast(`⚠️ CV generation error: ${err.message || 'Server unreachable'}`);
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleDownload = () => {
    if (generatedPdf?.blob) {
      cvGeneratorService.downloadBlob(generatedPdf.blob, generatedPdf.filename);
      showToast(`📥 Downloading ${generatedPdf.filename}...`);
    } else {
      handleGenerate(selectedDomain);
    }
  };

  const handlePrint = () => {
    if (generatedPdf?.url) {
      window.open(generatedPdf.url, '_blank');
    } else {
      window.print();
    }
  };

  const handleCopyPlainText = () => {
    const certsText = certificates.length > 0
      ? certificates.map(c => `- ${c.title} (Issued by: ${c.issuer || 'Skillify'}, Score: ${c.score || 'Pass'}, ID: ${c.credentialId || 'N/A'})`).join('\n')
      : '- Verified Skillify Academic Competency Credential';

    const skillsText = userProfile.skillsProgress && userProfile.skillsProgress.length > 0
      ? userProfile.skillsProgress.map(s => `- ${s.name}: ${s.progress}% Assessed Proficiency`).join('\n')
      : (userProfile.skills || ['React', 'Python', 'Tailwind CSS', 'SQL']).map(s => `- ${s}`).join('\n');

    const badgesText = badges.length > 0
      ? badges.map(b => `- ${b.name} (Verified Achievement, ${b.date || 'Active'})`).join('\n')
      : '- Active Academic Contributor';

    const projectsText = projects.length > 0
      ? projects.map(p => `• ${p.title} (${p.language || 'Code'})\n  ${p.description || ''}`).join('\n\n')
      : '• Skillify AI Platform & Verified Student Portfolio';

    const plainText = `=====================================================
${(customFields.name || userProfile.name || 'STUDENT DEVELOPER').toUpperCase()}
${customFields.degree} • ${customFields.college} (Class of ${customFields.graduationYear})
Domain Specialization: ${selectedDomain}
Email: ${customFields.email} | Phone: ${customFields.phone}
Portfolio: ${customFields.portfolio} | GitHub: ${customFields.github}
=====================================================

[PROFESSIONAL HEADLINE]
${customFields.headline}

[VERIFIED TECHNICAL SKILLS]
${skillsText}

[EARNED SKILL BADGES (${badges.length})]
${badgesText}

[OFFICIAL CERTIFICATIONS (${certificates.length})]
${certsText}

[KEY PROJECTS & REPOSITORIES (${projects.length})]
${projectsText}

=====================================================
Cryptographically Verified & Built by Skillify AI Authority
=====================================================`;

    try {
      navigator.clipboard.writeText(plainText);
      showToast('📋 Plain-text ATS resume copied to clipboard!');
    } catch (e) {
      showToast('📋 Plain-text formatted!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
      <div className={`bg-surface dark:bg-surface-container-high rounded-3xl w-full flex flex-col shadow-2xl border border-surface-variant/60 overflow-hidden transition-all duration-300 ${
        isFullscreenPreview ? 'max-w-5xl h-[94vh]' : 'max-w-3xl max-h-[92vh]'
      }`}>

        {/* Modal Top Header Bar */}
        <div className="px-5 py-4 border-b border-surface-variant/40 flex items-center justify-between bg-surface-container-low dark:bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-sm md:text-base font-bold text-on-surface dark:text-inverse-on-surface">
                  Skillify AI CV Generator
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                  v2.0 PDF
                </span>
              </div>
              <p className="text-[11px] text-secondary">
                Auto-syncs verified badges, certificates & projects into a modern infographic resume
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {generatedPdf && (
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-primary text-white hover:bg-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                title="Download Vector PDF"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              onClick={closeCVGenerator}
              className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Close modal"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 bg-surface-container-low/60 dark:bg-surface-container-lowest/60 border-b border-surface-variant/30 flex items-center justify-between gap-2 overflow-x-auto shrink-0 hide-scrollbar">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-secondary hover:text-on-surface dark:hover:text-inverse-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>Domain & Setup</span>
            </button>

            <button
              onClick={() => {
                if (!generatedPdf) {
                  handleGenerate();
                } else {
                  setActiveTab('preview');
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-secondary hover:text-on-surface dark:hover:text-inverse-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              <span>PDF Preview</span>
              {generatedPdf && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customize')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'customize'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-secondary hover:text-on-surface dark:hover:text-inverse-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => setActiveTab('plaintext')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'plaintext'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-secondary hover:text-on-surface dark:hover:text-inverse-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span>ATS Text</span>
            </button>
          </div>

          {activeTab === 'preview' && generatedPdf && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
                className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-surface-container-high transition-colors"
                title={isFullscreenPreview ? 'Shrink' : 'Expand preview'}
              >
                <span className="material-symbols-outlined text-sm">
                  {isFullscreenPreview ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-surface-container-high transition-colors"
                title="Open PDF in new tab"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* TAB 1: DOMAIN SELECTOR & CREDENTIALS SYNC */}
          {activeTab === 'generator' && (
            <div className="space-y-5">
              
              {/* Synced Credentials Overview Banner */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-2xl icon-filled">verified</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                      Synced Account Credentials
                    </h3>
                    <p className="text-[11px] text-secondary">
                      All verified items below will be dynamically organized into the generated PDF.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="bg-surface-container-highest px-2.5 py-1 rounded-xl text-center border border-outline-variant/40">
                    <span className="block font-headline text-xs font-bold text-primary">{badges.length}</span>
                    <span className="block text-[9px] text-secondary">Badges</span>
                  </div>
                  <div className="bg-surface-container-highest px-2.5 py-1 rounded-xl text-center border border-outline-variant/40">
                    <span className="block font-headline text-xs font-bold text-emerald-600 dark:text-emerald-400">{certificates.length}</span>
                    <span className="block text-[9px] text-secondary">Certs</span>
                  </div>
                  <div className="bg-surface-container-highest px-2.5 py-1 rounded-xl text-center border border-outline-variant/40">
                    <span className="block font-headline text-xs font-bold text-purple-600 dark:text-purple-400">{projects.length}</span>
                    <span className="block text-[9px] text-secondary">Projects</span>
                  </div>
                </div>
              </div>

              {/* Target Domain Grid Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-sm">category</span>
                      <span>Select Target Career Domain</span>
                    </h3>
                    <p className="text-[11px] text-secondary">
                      The AI NLP engine reorganizes section priority & crafts a domain-targeted executive summary.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {selectedDomain}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {domainsList.map((dom) => {
                    const isSelected = selectedDomain === dom.id;
                    return (
                      <div
                        key={dom.id}
                        onClick={() => setSelectedDomain(dom.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/40'
                            : 'bg-surface-container-low dark:bg-surface-container-lowest border-surface-variant/40 hover:border-primary/40 hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-primary text-white' : 'bg-surface-container-high text-secondary'
                          }`}>
                            <span className="material-symbols-outlined text-lg">{dom.icon || 'code'}</span>
                          </div>
                          {isSelected && (
                            <span className="material-symbols-outlined text-primary text-base font-bold">
                              check_circle
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                            {dom.name || dom.id}
                          </h4>
                          <p className="text-[10px] text-secondary line-clamp-2 mt-0.5">
                            {dom.desc || dom.tag}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Domain Action Footer */}
              <div className="pt-3 border-t border-surface-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">shield</span>
                  <span>Infographic ATS-friendly template • 1-page vector output</span>
                </div>

                <button
                  onClick={() => handleGenerate(selectedDomain)}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>Generate {selectedDomain} Resume (PDF)</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: PDF PREVIEW & VIEWER */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              
              {isGenerating ? (
                /* Animated Loading State */
                <div className="py-16 px-4 text-center space-y-4 bg-surface-container-low dark:bg-surface-container-lowest rounded-3xl border border-surface-variant/40">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
                      Generating AI Resume for {selectedDomain}...
                    </h3>
                    <p className="text-xs text-secondary max-w-sm mx-auto">
                      {generationStep === 1 && '1/3 Syncing verified badges, scores & certifications...'}
                      {generationStep === 2 && '2/3 Generating domain-targeted professional summary & hierarchy...'}
                      {generationStep === 3 && '3/3 Building vector ReportLab canvas & PDF stream...'}
                      {generationStep === 0 && 'Connecting to AI CV builder engine...'}
                    </p>
                  </div>

                  <div className="w-48 mx-auto bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${generationStep * 33.33}%` }}
                    ></div>
                  </div>
                </div>
              ) : generatedPdf ? (
                /* Interactive PDF Embed Viewer */
                <div className="space-y-3">
                  
                  {/* Top Bar for PDF Viewer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-surface-container-low dark:bg-surface-container-lowest rounded-2xl border border-surface-variant/40">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">description</span>
                      <span className="font-bold text-xs text-on-surface dark:text-inverse-on-surface truncate max-w-xs">
                        {generatedPdf.filename}
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
                        {generatedPdf.domain}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleDownload}
                        className="px-3 py-1.5 bg-primary text-white hover:bg-primary-container rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>Download PDF</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-secondary hover:text-on-surface rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        <span>Full Tab</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('generator')}
                        className="px-3 py-1.5 border border-outline-variant/60 text-secondary hover:text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">sync</span>
                        <span>Switch Domain</span>
                      </button>
                    </div>
                  </div>

                  {/* PDF Object / Iframe Canvas */}
                  <div className={`w-full rounded-2xl overflow-hidden border border-surface-variant/60 bg-slate-900 shadow-inner ${
                    isFullscreenPreview ? 'h-[75vh]' : 'h-[500px]'
                  }`}>
                    <object
                      data={`${generatedPdf.url}#toolbar=1&navpanes=0`}
                      type="application/pdf"
                      className="w-full h-full"
                    >
                      <iframe
                        src={generatedPdf.url}
                        title="CV Preview"
                        className="w-full h-full border-none"
                      >
                        <div className="p-8 text-center text-white space-y-3">
                          <p>Your browser does not support embedded PDF preview.</p>
                          <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
                          >
                            Download {generatedPdf.filename}
                          </button>
                        </div>
                      </iframe>
                    </object>
                  </div>
                </div>
              ) : (
                /* No PDF generated yet */
                <div className="py-12 px-4 text-center space-y-3 bg-surface-container-low dark:bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                  </div>
                  <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                    No Resume Generated Yet
                  </h3>
                  <p className="text-[11px] text-secondary max-w-sm mx-auto">
                    Click the button below to compile your profile data and verified badges into a one-page PDF CV.
                  </p>
                  <button
                    onClick={() => handleGenerate(selectedDomain)}
                    className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary-container transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>Generate Now ({selectedDomain})</span>
                  </button>
                </div>
              )}

              {generationError && (
                <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-error text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{generationError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMIZE PROFILE DETAILS */}
          {activeTab === 'customize' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                  Customize CV Information
                </h3>
                <p className="text-[11px] text-secondary">
                  These custom values will override default profile fields during PDF generation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-secondary">Full Name</label>
                  <input
                    type="text"
                    value={customFields.name}
                    onChange={(e) => setCustomFields({ ...customFields, name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-secondary">Email Address</label>
                  <input
                    type="email"
                    value={customFields.email}
                    onChange={(e) => setCustomFields({ ...customFields, email: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-secondary">Phone Number</label>
                  <input
                    type="text"
                    value={customFields.phone}
                    onChange={(e) => setCustomFields({ ...customFields, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-secondary">Graduation Year</label>
                  <input
                    type="text"
                    value={customFields.graduationYear}
                    onChange={(e) => setCustomFields({ ...customFields, graduationYear: e.target.value })}
                    placeholder="2027"
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-secondary">College / University</label>
                  <input
                    type="text"
                    value={customFields.college}
                    onChange={(e) => setCustomFields({ ...customFields, college: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-secondary">Degree / Major</label>
                  <input
                    type="text"
                    value={customFields.degree}
                    onChange={(e) => setCustomFields({ ...customFields, degree: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-secondary">Professional Headline</label>
                  <input
                    type="text"
                    value={customFields.headline}
                    onChange={(e) => setCustomFields({ ...customFields, headline: e.target.value })}
                    placeholder="e.g. Aspiring Full Stack Developer & AI Enthusiast"
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-secondary">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={customFields.github}
                    onChange={(e) => setCustomFields({ ...customFields, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-secondary">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={customFields.linkedin}
                    onChange={(e) => setCustomFields({ ...customFields, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => handleGenerate(selectedDomain)}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>Save & Generate Resume</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PLAIN TEXT ATS RESUME */}
          {activeTab === 'plaintext' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                    ATS Plain-Text Resume Format
                  </h3>
                  <p className="text-[11px] text-secondary">
                    Ideal for copy-pasting into applicant tracking systems, job forms & email applications.
                  </p>
                </div>
                <button
                  onClick={handleCopyPlainText}
                  className="px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  <span>Copy Text</span>
                </button>
              </div>

              <div className="bg-surface-container-low dark:bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant/40 font-mono text-[11px] leading-relaxed text-on-surface-variant dark:text-secondary-fixed-dim whitespace-pre-wrap max-h-96 overflow-y-auto">
{`=====================================================
${(customFields.name || userProfile.name || 'STUDENT DEVELOPER').toUpperCase()}
${customFields.degree} • ${customFields.college} (Class of ${customFields.graduationYear})
Domain Specialization: ${selectedDomain}
Email: ${customFields.email} | Phone: ${customFields.phone}
Portfolio: ${customFields.portfolio} | GitHub: ${customFields.github}
=====================================================

[PROFESSIONAL HEADLINE]
${customFields.headline}

[VERIFIED TECHNICAL SKILLS]
${(userProfile.skillsProgress && userProfile.skillsProgress.length > 0)
  ? userProfile.skillsProgress.map(s => `- ${s.name}: ${s.progress}% Assessed Proficiency`).join('\n')
  : (userProfile.skills || ['React', 'Python', 'Tailwind CSS', 'SQL']).map(s => `- ${s}`).join('\n')}

[EARNED SKILL BADGES (${badges.length})]
${badges.length > 0
  ? badges.map(b => `- ${b.name} (Verified Achievement, ${b.date || 'Active'})`).join('\n')
  : '- Active Academic Contributor'}

[OFFICIAL CERTIFICATIONS (${certificates.length})]
${certificates.length > 0
  ? certificates.map(c => `- ${c.title} (Issued by: ${c.issuer || 'Skillify'}, Score: ${c.score || 'Pass'}, ID: ${c.credentialId || 'N/A'})`).join('\n')
  : '- Verified Skillify Academic Competency Credential'}

[KEY PROJECTS & REPOSITORIES (${projects.length})]
${projects.length > 0
  ? projects.map(p => `• ${p.title} (${p.language || 'Code'})\n  ${p.description || ''}`).join('\n\n')
  : '• Skillify AI Platform & Verified Student Portfolio'}

=====================================================
Cryptographically Verified & Built by Skillify AI Authority
=====================================================`}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="p-4 border-t border-surface-variant/40 bg-surface-container-low dark:bg-surface-container-lowest flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-secondary hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Target: <strong>{currentDomainMeta?.name || selectedDomain}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={closeCVGenerator}
              className="px-4 py-2 border border-outline-variant text-secondary rounded-xl text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Close
            </button>

            {activeTab !== 'preview' ? (
              <button
                onClick={() => handleGenerate(selectedDomain)}
                disabled={isGenerating}
                className="px-5 py-2 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>Generate PDF CV</span>
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
