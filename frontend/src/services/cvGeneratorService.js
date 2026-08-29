/**
 * ============================================================================
 * Skillify AI - Frontend CV Generator Client Service
 * ============================================================================
 * Architectural Role:
 * - Bridges student profile data, badges, certifications, and skills to the
 *   backend CV generation engine (backend/cv_generator & chatbot API).
 * - Multi-tier fallback across Remote Ngrok (.env) -> Dev Proxy -> Localhost Flask (:5001) -> Localhost FastAPI (:8000).
 * - Formats profile payloads into normalized schemas matching schemas.py.
 * - Handles PDF binary streams, browser preview blobs, and native mobile downloads.
 */

// 1. URL Normalizer: Ensures base URL has no trailing slash and ends with /api
function normalizeApiBase(url) {
  if (!url) return null;
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api')) {
    clean += '/api';
  }
  return clean;
}

// 2. Read Remote Tunnel URL from .env
const REMOTE_ENV_URL = normalizeApiBase(
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_CV_API_URL || import.meta.env?.VITE_CHATBOT_API_URL)) ||
  'https://profanity-manor-overeager.ngrok-free.dev'
);

// 3. Candidate Bases for Multi-Tier Discovery
const CANDIDATE_CV_BASES = [
  REMOTE_ENV_URL ? `${REMOTE_ENV_URL}/cv` : null,
  REMOTE_ENV_URL ? `${REMOTE_ENV_URL}/v1/cv` : null,
  '/api/cv',
  '/api/v1/cv',
  'http://localhost:5001/api/cv',
  'http://127.0.0.1:5001/api/cv',
  'http://localhost:8000/api/v1/cv',
  'http://127.0.0.1:8000/api/v1/cv'
].filter(Boolean);

// Deduplicate candidate endpoints
const DEDUPLICATED_CANDIDATES = [...new Set(CANDIDATE_CV_BASES)];

const API_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

export const CV_DOMAINS = [
  {
    id: 'SDE',
    name: 'Software Development (SDE)',
    shortName: 'SDE / SWE',
    icon: 'code',
    tag: 'Full Stack & Backend',
    desc: 'Algorithms, Data Structures, Web Systems & High-Scale Backend Engineering',
    badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    accentColor: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'AI/ML',
    name: 'AI & Machine Learning',
    shortName: 'AI / MLOps',
    icon: 'psychology',
    tag: 'Deep Learning & NLP',
    desc: 'Neural Networks, Transformer Models, NLP Pipelines & MLOps Infrastructure',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    accentColor: 'from-purple-600 to-pink-600'
  },
  {
    id: 'Data Science',
    name: 'Data Science & Analytics',
    shortName: 'Data Science',
    icon: 'analytics',
    tag: 'Big Data & Insights',
    desc: 'Statistical Modeling, SQL, Predictive Analytics & Data Visualization',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    accentColor: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'UI/UX',
    name: 'UI/UX & Product Design',
    shortName: 'UI/UX Design',
    icon: 'palette',
    tag: 'Design Systems & Figma',
    desc: 'Human-Centered Design, Wireframing, User Research, Prototyping & Design Systems',
    badgeColor: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30',
    accentColor: 'from-pink-600 to-rose-600'
  },
  {
    id: 'Engineering',
    name: 'Core Engineering & IoT',
    shortName: 'Engineering',
    icon: 'precision_manufacturing',
    tag: 'Robotics & Embedded',
    desc: 'Embedded Systems, Microcontrollers, Robotics & Applied Technical Hardware',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    accentColor: 'from-amber-600 to-orange-600'
  },
  {
    id: 'Marketing',
    name: 'Growth & Digital Marketing',
    shortName: 'Marketing',
    icon: 'campaign',
    tag: 'SEO & Growth Ops',
    desc: 'Conversion Rate Optimization, Data-Driven Campaigns, SEO & Content Strategy',
    badgeColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
    accentColor: 'from-orange-600 to-red-600'
  },
  {
    id: 'Writer',
    name: 'Technical & Content Writing',
    shortName: 'Technical Writing',
    icon: 'edit_note',
    tag: 'Docs & Storytelling',
    desc: 'Developer Documentation, Technical Articles, Copywriting & Narrative Design',
    badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    accentColor: 'from-cyan-600 to-blue-600'
  },
  {
    id: 'Videography',
    name: 'Videography & Motion Design',
    shortName: 'Videography',
    icon: 'videocam',
    tag: 'Visual Storytelling',
    desc: 'Cinematography, Video Editing, Motion Graphics, Sound Design & Color Grading',
    badgeColor: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    accentColor: 'from-violet-600 to-purple-600'
  },
  {
    id: 'Photography',
    name: 'Photography & Visual Arts',
    shortName: 'Photography',
    icon: 'photo_camera',
    tag: 'Commercial & Portrait',
    desc: 'Studio Lighting, Composition, Color Theory, Photojournalism & Editing',
    badgeColor: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    accentColor: 'from-yellow-600 to-amber-600'
  }
];

export const cvGeneratorService = {
  activeApiBase: null,

  /**
   * Probes candidate endpoints to find the active CV backend.
   */
  async resolveActiveBase() {
    if (this.activeApiBase) return this.activeApiBase;

    for (const base of DEDUPLICATED_CANDIDATES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`${base}/domains`, {
          signal: controller.signal,
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          this.activeApiBase = base;
          return base;
        }
      } catch (e) {
        // Try next candidate
      }
    }

    // Default fallback to first candidate if discovery fails
    this.activeApiBase = DEDUPLICATED_CANDIDATES[0] || '/api/cv';
    return this.activeApiBase;
  },

  /**
   * Fetch domain listing from backend or return local catalogue.
   */
  async getDomains() {
    try {
      const base = await this.resolveActiveBase();
      const res = await fetch(`${base}/domains`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.domains) {
          return json.domains;
        }
      }
    } catch (e) {
      console.warn('Backend domains endpoint unreachable, using local domain catalogue:', e);
    }
    return CV_DOMAINS;
  },

  /**
   * Builds formatted ProfileRequest payload from AppContext state.
   */
  formatProfilePayload(userProfile = {}, badges = [], certificates = [], projects = [], customOverrides = {}) {
    const name = customOverrides.name || userProfile.name || 'Student Technologist';
    const email = customOverrides.email || userProfile.email || 'student@skillify.ai';
    const college = customOverrides.college || userProfile.college || 'Tech Institute of Technology';
    const degree = customOverrides.degree || userProfile.major || 'B.Tech Computer Science';
    const phone = customOverrides.phone || userProfile.phone || '+91 98765 43210';
    const headline = customOverrides.headline || userProfile.headline || `${degree} Candidate & Problem Solver`;
    const gradYear = customOverrides.graduationYear || '2027';

    // Group verified skills
    const skillCategories = [];
    const progressSkills = (userProfile.skillsProgress || []).filter(s => s.progress > 0);
    if (progressSkills.length > 0) {
      skillCategories.push({
        category: 'Verified Technical Proficiencies',
        items: progressSkills.map(s => `${s.name} (${s.progress}% Assessed)`)
      });
    }

    const standardSkills = (userProfile.skills && userProfile.skills.length > 0)
      ? userProfile.skills
      : ['React', 'JavaScript', 'Python', 'Tailwind CSS', 'Git & GitHub', 'SQL'];

    skillCategories.push({
      category: 'Core Technologies & Tools',
      items: standardSkills.slice(0, 8)
    });

    // Certifications
    const certList = (certificates || []).map(c => ({
      name: `${c.title || 'Skill Certificate'} (Score: ${c.score || 'Pass'})`,
      issuer: c.issuer || 'Skillify Academic Network',
      year: c.issueDate ? String(c.issueDate).slice(-4) : '2026'
    }));

    if (certList.length === 0) {
      certList.push({
        name: 'Skillify Verified Platform Developer',
        issuer: 'Skillify AI Authority',
        year: '2026'
      });
    }

    // Achievements & Badges
    const badgeAchievements = (badges || []).map(b => ({
      title: `${b.name || 'Honor'} Verified Badge`,
      description: `Cryptographically verified achievement on Skillify (${b.date || 'Active'})`
    }));

    if (userProfile.honorsRoll) {
      badgeAchievements.push({
        title: "Dean's Honors Roll Candidate",
        description: 'Recognized for top percentile assessment accuracy and consistency'
      });
    }

    if (badgeAchievements.length === 0) {
      badgeAchievements.push({
        title: 'Active Skillify Academic Contributor',
        description: 'Verified participant in algorithmic challenges and skill evaluations'
      });
    }

    // Projects
    const projectList = (projects || []).slice(0, 4).map(p => ({
      title: p.title || 'Software Engineering Project',
      description: p.description || 'Full-stack application built with modern architecture and responsive design.',
      tech_stack: p.language ? [p.language, p.category || 'Web'].filter(Boolean) : ['React', 'Node.js', 'Vite'],
      link: p.link || 'https://skillify.ai'
    }));

    if (projectList.length === 0) {
      projectList.push({
        title: 'Skillify AI Learning & Freelance Portal',
        description: 'Modern student portal featuring real-time AI assistance, skill assessments, and verified credential management.',
        tech_stack: ['React', 'Python', 'Tailwind CSS', 'ReportLab'],
        link: 'https://skillify.ai'
      });
    }

    // Soft Skills & Languages
    const softSkills = [
      'Algorithmic Problem Solving',
      'Team Leadership & Collaboration',
      'Agile / Scrum Methodology',
      'System Architecture Design'
    ];

    const languages = [
      { name: 'English', level: 'Fluent / Professional' },
      { name: 'Hindi', level: 'Native / Bilingual' }
    ];

    const interests = [
      'Open Source Development',
      'Autonomous AI Systems',
      'Cloud Architecture',
      'Interactive Web Experiences'
    ];

    return {
      full_name: name,
      email: email,
      phone: phone,
      college: college,
      degree: degree,
      graduation_year: gradYear,
      headline: headline,
      linkedin_url: customOverrides.linkedin || 'https://linkedin.com/in/student',
      github_url: customOverrides.github || 'https://github.com/student',
      portfolio_url: customOverrides.portfolio || 'https://skillify.ai',
      photo_base64: userProfile.avatar?.startsWith('data:') ? userProfile.avatar : null,
      skills: skillCategories,
      certifications: certList.slice(0, 5),
      achievements: badgeAchievements.slice(0, 5),
      projects: projectList,
      languages: languages,
      soft_skills: softSkills,
      interests: interests
    };
  },

  /**
   * Calls /api/cv/generate (or /api/v1/cv/generate) and returns the PDF as a Blob + ObjectURL for preview.
   */
  async generateCV({
    targetDomain = 'SDE',
    userProfile = {},
    badges = [],
    certificates = [],
    projects = [],
    customOverrides = {},
    download = false
  }) {
    const formattedProfile = this.formatProfilePayload(
      userProfile,
      badges,
      certificates,
      projects,
      customOverrides
    );

    const payload = {
      target_domain: targetDomain,
      download: Boolean(download),
      profile: formattedProfile
    };

    let lastError = null;
    const candidateBases = this.activeApiBase 
      ? [this.activeApiBase, ...DEDUPLICATED_CANDIDATES.filter(b => b !== this.activeApiBase)]
      : DEDUPLICATED_CANDIDATES;

    for (const base of candidateBases) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for PDF compilation

        const res = await fetch(`${base}/generate`, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          let errDetail = 'Failed to generate CV';
          try {
            const errJson = await res.json();
            errDetail = errJson.detail || errJson.error || errDetail;
          } catch (e) {
            errDetail = `Server returned status ${res.status}: ${res.statusText}`;
          }
          lastError = new Error(errDetail);
          continue; // Try next candidate
        }

        const pdfBlob = await res.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Extract filename from header if available
        let filename = `${formattedProfile.full_name.replace(/\s+/g, '_')}_${targetDomain}_CV.pdf`;
        const disposition = res.headers.get('Content-Disposition') || res.headers.get('content-disposition');
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        this.activeApiBase = base;

        return {
          success: true,
          blob: pdfBlob,
          url: pdfUrl,
          filename: filename,
          domain: targetDomain,
          profile: formattedProfile
        };
      } catch (e) {
        lastError = e;
      }
    }

    throw lastError || new Error('All candidate CV Generator endpoints failed to respond.');
  },

  /**
   * Trigger automatic file download in the browser.
   */
  downloadBlob(blob, filename = 'Skillify_CV.pdf') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 250);
  }
};
