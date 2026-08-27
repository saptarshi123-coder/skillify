/**
 * ============================================================================
 * Skillify AI - Frontend SQLite Client & Persistence Service
 * ============================================================================
 * Architectural Role:
 * - Implements a client-side SQLite relational store matching database/schema/schema.sql.
 * - Stores users, skills, projects, certificates, chat_messages, and internships with
 *   localStorage durability and query operations.
 */

import { INITIAL_INTERNSHIPS } from '../data/internshipsData';

const DB_STORAGE_KEY = 'skillify_sqlite_data';

class SQLiteService {
  constructor() {
    this.tables = {
      users: [],
      skills: [],
      projects: [],
      certificates: [],
      chat_messages: [],
      internships: [],
      saved_internship_ids: [],
      internship_applications: []
    };
    this.isInitialized = false;
  }

  async initDB() {
    try {
      const savedData = localStorage.getItem(DB_STORAGE_KEY);
      if (savedData) {
        this.tables = JSON.parse(savedData);
        if (this.tables.users && this.tables.users.length > 0) {
          const u = this.tables.users[0];
          // Migrate legacy Alex Rivera demo user to clean Guest User
          if (u.name === "Alex Rivera" || u.id === "usr_alex_rivera" || u.email === "alex.rivera@tit.edu") {
            u.name = "Guest User";
            u.email = "guest@skillify.ai";
            u.auth_provider = "guest";
            u.avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";
          }
          u.skills = Array.isArray(u.skills) ? u.skills.filter(s => !['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL', 'TypeScript'].includes(s)) : [];
          u.level = 1;
          u.xp = 0;
          u.streak = 0;
          u.skills_progress = [
            { name: "Frontend Development", progress: 0 },
            { name: "Data Structures & Algorithms", progress: 0 },
            { name: "UI/UX Design", progress: 0 },
            { name: "Python & Data Science", progress: 0 }
          ];
        }
        if (this.tables.projects && Array.isArray(this.tables.projects)) {
          // Remove legacy pre-seeded mock projects so users start with 0 submitted projects
          this.tables.projects = this.tables.projects.filter(
            p => !['proj-log-manager', 'proj-elearning-dash', 'proj-ai-code-analyzer'].includes(p.id)
          );
        }
        if (this.tables.skills && Array.isArray(this.tables.skills)) {
          // Remove legacy pre-seeded skills so user starts with 0 pre-selected skills
          this.tables.skills = this.tables.skills.filter(
            s => !['sk_1', 'sk_2', 'sk_3', 'sk_4', 'sk_5'].includes(s.id)
          );
        }
        if (this.tables.chat_messages && Array.isArray(this.tables.chat_messages)) {
          // Remove legacy pre-seeded messages and purge messages older than 30 minutes
          this.tables.chat_messages = this.tables.chat_messages.filter(
            m => !['msg_1', 'msg_2', 'msg_3'].includes(m.id)
          );
          this.purgeExpiredChatMessages(30);
        }
        if (!this.tables.internships || !Array.isArray(this.tables.internships) || this.tables.internships.length === 0) {
          this.tables.internships = [...INITIAL_INTERNSHIPS];
        }
        if (!this.tables.saved_internship_ids) {
          this.tables.saved_internship_ids = [];
        }
        if (!this.tables.internship_applications) {
          this.tables.internship_applications = [];
        }
        this._persist();
      } else {
        this._seedInitialData();
      }
      this.isInitialized = true;
      console.log('SQLite Database Initialized with tables: users, skills, projects, certificates, chat_messages, internships');
      return true;
    } catch (e) {
      console.error('Error initializing SQLite DB:', e);
      this._seedInitialData();
      return false;
    }
  }

  _persist() {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.tables));
    } catch (e) {
      console.error('Error saving SQLite DB state:', e);
    }
  }

  _seedInitialData() {
    this.tables.users = [
      {
        id: "usr_guest",
        name: "Guest User",
        email: "guest@skillify.ai",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
        major: "Computer Science Major",
        college: "Tech Institute of Technology",
        address: "123 Education Lane, Tech City, TC 10101",
        level: 1,
        xp: 0,
        streak: 1,
        skills_progress: [
          { name: "Frontend Development", progress: 0 },
          { name: "Data Structures & Algorithms", progress: 0 },
          { name: "UI/UX Design", progress: 0 },
          { name: "Python & Data Science", progress: 0 }
        ],
        honors_roll: 0,
        looking_for_internships: 1,
        auth_provider: "guest",
        created_at: new Date().toISOString()
      }
    ];

    // Skills start empty so the user chooses their own skills freely
    this.tables.skills = [];

    // Chat messages start completely empty for new users. Messages auto-expire after 30 mins.
    this.tables.chat_messages = [];

    // Projects start empty for new users. Projects appear only after the user submits / uploads them.
    this.tables.projects = [];

    this.tables.certificates = [];

    // Internships initialized from seed
    this.tables.internships = [...INITIAL_INTERNSHIPS];
    this.tables.saved_internship_ids = [];
    this.tables.internship_applications = [];

    this._persist();
  }

  // SQL: SELECT * FROM users WHERE email = ?
  getUserByEmail(email) {
    if (!email) return null;
    return this.tables.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // SQL: SELECT * FROM users LIMIT 1
  getCurrentUser() {
    return this.tables.users[0] || null;
  }

  // SQL: INSERT OR REPLACE INTO users VALUES (...)
  saveUser(userData) {
    const existingIndex = this.tables.users.findIndex(u => 
      (userData.email && u.email && u.email.toLowerCase() === userData.email.toLowerCase()) || 
      (userData.id && u.id === userData.id)
    );
    const existing = existingIndex >= 0 ? this.tables.users[existingIndex] : {};
    
    const updatedUser = {
      id: userData.id || existing.id || `usr_${Date.now()}`,
      name: userData.name || existing.name || "Guest User",
      email: userData.email || existing.email || "guest@skillify.ai",
      avatar: userData.avatar || existing.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      major: userData.major || existing.major || "Computer Science Major",
      college: userData.college || existing.college || "Tech Institute of Technology",
      address: userData.address || existing.address || "123 Education Lane, Tech City",
      level: userData.level !== undefined ? userData.level : (existing.level !== undefined ? existing.level : 1),
      xp: userData.xp !== undefined ? userData.xp : (existing.xp !== undefined ? existing.xp : 0),
      streak: userData.streak !== undefined ? userData.streak : (existing.streak !== undefined ? existing.streak : 1),
      honors_roll: userData.honorsRoll !== undefined ? (userData.honorsRoll ? 1 : 0) : (existing.honors_roll !== undefined ? existing.honors_roll : 0),
      looking_for_internships: userData.lookingForInternships !== undefined ? (userData.lookingForInternships ? 1 : 0) : (existing.looking_for_internships !== undefined ? existing.looking_for_internships : 1),
      auth_provider: userData.auth_provider || userData.authProvider || existing.auth_provider || "guest",
      skills: userData.skills || existing.skills || [],
      skills_progress: userData.skillsProgress || existing.skills_progress || [
        { name: "Frontend Development", progress: 0 },
        { name: "Data Structures & Algorithms", progress: 0 },
        { name: "UI/UX Design", progress: 0 },
        { name: "Python & Data Science", progress: 0 }
      ],
      role: userData.role || existing.role || null,
      role_selected: userData.role_selected !== undefined ? userData.role_selected : (userData.roleSelected !== undefined ? userData.roleSelected : (existing.role_selected || false)),
      job_role: userData.job_role || userData.jobRole || existing.job_role || "Senior Technical Recruiter",
      company_name: userData.company_name || userData.companyName || existing.company_name || "Skillify Inc.",
      hr_location: userData.hr_location || userData.location || existing.hr_location || "Bengaluru, India",
      bio: userData.bio !== undefined ? userData.bio : (existing.bio || "Passionate about connecting top-tier student talent with innovative tech teams. Specialized in engineering and design recruitment with over 8 years of experience."),
      hr_profile_completed: userData.hr_profile_completed !== undefined ? userData.hr_profile_completed : (userData.hrProfileCompleted !== undefined ? userData.hrProfileCompleted : (existing.hr_profile_completed || false)),
      created_at: userData.created_at || existing.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.tables.users[existingIndex] = updatedUser;
    } else {
      this.tables.users.unshift(updatedUser);
    }
    this._persist();
    return updatedUser;
  }

  // Set User Role ('student' | 'recruiter')
  setUserRole(role = 'student') {
    const user = this.getCurrentUser();
    if (user) {
      user.role = role;
      user.role_selected = true;
      this._persist();
      return user;
    }
    return null;
  }

  // Save / Update Complete HR Profile
  saveHRProfile(hrData = {}) {
    const user = this.getCurrentUser();
    if (user) {
      user.role = 'recruiter';
      user.role_selected = true;
      if (hrData.fullName || hrData.name) user.name = hrData.fullName || hrData.name;
      if (hrData.jobRole || hrData.job_role) user.job_role = hrData.jobRole || hrData.job_role;
      if (hrData.companyName || hrData.company_name) user.company_name = hrData.companyName || hrData.company_name;
      if (hrData.location || hrData.hr_location) user.hr_location = hrData.location || hrData.hr_location;
      if (hrData.bio !== undefined) user.bio = hrData.bio;
      if (hrData.avatar) user.avatar = hrData.avatar;
      user.hr_profile_completed = true;
      this._persist();
      return user;
    }
    return null;
  }

  // Get Applicants for Recruiter view
  getApplicantsForRecruiter() {
    return [
      {
        id: 'std_alex_rivera',
        name: 'Alex Rivera',
        email: 'alex.rivera@tit.edu',
        role: 'Frontend Engineering Intern',
        appliedDate: '2 hours ago',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        college: 'Tech Institute of Technology',
        score: '94% Quiz Accuracy',
        badgesCount: 4,
        portfolioUrl: 'https://alexrivera.dev'
      },
      {
        id: 'std_sarah_jenkins',
        name: 'Sarah Jenkins',
        email: 'sarah.j@stanford.edu',
        role: 'UI/UX Design Intern',
        appliedDate: '1 day ago',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        college: 'Stanford University',
        score: '91% Quiz Accuracy',
        badgesCount: 3,
        portfolioUrl: 'https://sarahdesign.io'
      },
      {
        id: 'std_rohit_sharma',
        name: 'Rohit Sharma',
        email: 'rohit.s@iitb.ac.in',
        role: 'Python & AI Engineer Intern',
        appliedDate: '3 days ago',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        college: 'IIT Bombay',
        score: '98% Quiz Accuracy',
        badgesCount: 6,
        portfolioUrl: 'https://github.com/rohitsharma'
      }
    ];
  }

  // Find or Create OAuth User (Google, LinkedIn, GitHub)
  findOrCreateOAuthUser(oauthData) {
    const email = (oauthData.email || '').trim().toLowerCase();
    const existing = this.getUserByEmail(email);

    if (existing) {
      // Retain existing progress, xp, level, and certificates, but update latest auth details
      const merged = this.saveUser({
        ...existing,
        name: oauthData.name || existing.name,
        avatar: oauthData.avatar || existing.avatar,
        auth_provider: oauthData.auth_provider || oauthData.authProvider || existing.auth_provider,
        major: oauthData.major || existing.major,
        college: oauthData.college || existing.college
      });
      return { user: merged, isNew: false };
    }

    // Create fresh user
    const newUser = this.saveUser({
      name: oauthData.name || "Student",
      email: oauthData.email,
      avatar: oauthData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(oauthData.name || 'User')}`,
      major: oauthData.major || "Computer Science Major",
      college: oauthData.college || "Tech Institute of Technology",
      level: 1,
      xp: 0,
      streak: 1,
      honors_roll: 0,
      looking_for_internships: 1,
      auth_provider: oauthData.auth_provider || oauthData.authProvider || "google",
      skills: [],
      skills_progress: [
        { name: "Frontend Development", progress: 0 },
        { name: "Data Structures & Algorithms", progress: 0 },
        { name: "UI/UX Design", progress: 0 },
        { name: "Python & Data Science", progress: 0 }
      ]
    });
    return { user: newUser, isNew: true };
  }

  // SQL: SELECT * FROM skills WHERE user_id = ?
  getUserSkills(userId = "usr_guest") {
    return this.tables.skills.filter(s => s.user_id === userId);
  }

  // SQL: INSERT / UPDATE skills
  setUserSkills(userId, skillNames) {
    this.tables.skills = this.tables.skills.filter(s => s.user_id !== userId);
    skillNames.forEach((sk, idx) => {
      this.tables.skills.push({
        id: `sk_${Date.now()}_${idx}`,
        user_id: userId,
        skill_name: typeof sk === 'string' ? sk : sk.name,
        category: typeof sk === 'object' ? sk.category : 'General Programming',
        icon: typeof sk === 'object' ? sk.icon : 'code',
        selected: 1
      });
    });
    this._persist();
    return this.getUserSkills(userId);
  }

  // Purge chat messages older than maxAgeMinutes (default: 30 mins)
  purgeExpiredChatMessages(maxAgeMinutes = 30) {
    const cutoff = Date.now() - (maxAgeMinutes * 60 * 1000);
    const initialLen = this.tables.chat_messages ? this.tables.chat_messages.length : 0;
    if (this.tables.chat_messages && Array.isArray(this.tables.chat_messages)) {
      this.tables.chat_messages = this.tables.chat_messages.filter(msg => {
        if (msg.created_at_ms) {
          return msg.created_at_ms > cutoff;
        }
        if (msg.created_at) {
          const time = new Date(msg.created_at).getTime();
          return !isNaN(time) && time > cutoff;
        }
        // If message was created without timestamp (legacy demo message), discard it
        return false;
      });
      if (this.tables.chat_messages.length !== initialLen) {
        this._persist();
      }
    } else {
      this.tables.chat_messages = [];
    }
    return [...this.tables.chat_messages];
  }

  // SQL: SELECT * FROM chat_messages ORDER BY id ASC (Auto-purges messages > 30 minutes)
  getChatMessages(maxAgeMinutes = 30) {
    this.purgeExpiredChatMessages(maxAgeMinutes);
    return [...this.tables.chat_messages];
  }

  // SQL: INSERT INTO chat_messages (sender, text, timestamp, metadata) VALUES (?, ?, ?, ?)
  addChatMessage(sender, text, metadata = {}) {
    const nowMs = Date.now();
    const timeStr = new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg_${nowMs}_${Math.random().toString(36).substr(2, 4)}`,
      sender,
      text,
      timestamp: timeStr,
      created_at_ms: nowMs,
      created_at: new Date(nowMs).toISOString(),
      intent: metadata.intent || null,
      confidence: metadata.confidence || null,
      sentiment: metadata.sentiment || null,
      responseType: metadata.responseType || null,
      suggestedActions: metadata.suggestedActions || [],
      engine: metadata.engine || null,
      feedbackRating: null,
      feedbackComment: null
    };
    this.tables.chat_messages.push(newMsg);
    this._persist();
    return newMsg;
  }

  // SQL: UPDATE chat_messages SET feedback_rating = ?, feedback_comment = ? WHERE id = ?
  updateChatMessageFeedback(messageId, rating, comment = '') {
    const msg = this.tables.chat_messages.find(m => m.id === messageId);
    if (msg) {
      msg.feedbackRating = rating;
      msg.feedbackComment = comment;
      this._persist();
      return msg;
    }
    return null;
  }

  // SQL: DELETE FROM chat_messages
  clearChatMessages() {
    this.tables.chat_messages = [];
    this._persist();
    return [];
  }

  // SQL: SELECT * FROM projects
  getProjects() {
    return [...this.tables.projects];
  }

  // SQL: INSERT INTO projects VALUES (...)
  addProject(project) {
    const defaultFiles = project.codeContent ? [
      {
        name: project.fileName || `main.${project.language === 'Python' ? 'py' : project.language === 'C++' ? 'cpp' : project.language === 'Rust' ? 'rs' : project.language === 'TypeScript' ? 'ts' : 'js'}`,
        type: 'code',
        commit: 'Initial code commit',
        time: 'Just now',
        content: project.codeContent
      },
      {
        name: 'README.md',
        type: 'draft',
        commit: 'Create README.md for project',
        time: 'Just now',
        content: `# 🚀 ${project.title}\n\n${project.description || 'Project source code.'}\n\n### Tech Stack\n- Language: ${project.language}\n- Category: ${project.category}`
      }
    ] : [];

    const newProj = {
      id: project.id || `proj_${Date.now()}`,
      user_id: project.user_id || "usr_alex_rivera",
      title: project.title,
      category: project.category || "Computer Science",
      language: project.language || "JavaScript",
      badge: project.badge || "Public",
      description: project.description,
      stars: project.stars || 1,
      likes: project.likes || 1,
      link: project.link || "https://github.com",
      author: project.author || "Guest User",
      tags: project.tags || [project.language, project.category],
      image: project.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuDvfL5T2pcTyFzo2IRJ-HVyj9k0Gmkf-vutT7o4T8PujzuAFVY-B0okyQsy7FcJvdksCU7PuwAgFgkwTGDvpgBrRRtZs_Bwj6l8trT9UogxFTi3yLUYH1VuSwdngJSv4coowBAlyDcksjz6vMCBgIgtgAn7RnIY1zy2N99UDv8NuoXmoBVJNgNFIpX-_PT9l9kB4zIL_DNTEC1z0620uVgYD4ieDL4J8XGEhGg3DMuQCenDWUQTDlWi8w",
      files: (project.files && project.files.length > 0) ? project.files : defaultFiles,
      codeContent: project.codeContent || '',
      fileName: project.fileName || '',
      fileSize: project.fileSize || '',
      branch: project.branch || 'main',
      commitsCount: project.commitsCount || 1,
      created_at: new Date().toISOString()
    };
    this.tables.projects.unshift(newProj);
    this._persist();
    return newProj;
  }

  // SQL: SELECT * FROM certificates
  getCertificates() {
    return [...this.tables.certificates];
  }

  // SQL: INSERT INTO certificates VALUES (...)
  addCertificate(cert) {
    const newCert = {
      id: cert.id || `CERT-${Date.now()}`,
      user_id: cert.user_id || "usr_guest",
      title: cert.title,
      issueDate: cert.issueDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      score: cert.score,
      credentialId: cert.credentialId,
      issuer: cert.issuer || "Skillify AI Certification Authority",
      recipient: cert.recipient || "Guest User",
      badgeIcon: cert.badgeIcon || "workspace_premium",
      category: cert.category || "Coding"
    };
    this.tables.certificates = this.tables.certificates.filter(c => c.title !== newCert.title);
    this.tables.certificates.unshift(newCert);
    this._persist();
    return newCert;
  }

  // SQL: SELECT * FROM internships
  getInternships() {
    return [...(this.tables.internships || [])];
  }

  // SQL: INSERT INTO internships VALUES (...)
  addInternship(internship) {
    const newIntern = {
      id: internship.id || `intern_${Date.now()}`,
      role: internship.role || "Software Intern",
      company: internship.company || "Company",
      location: internship.mode === 'online' ? (internship.location || "Remote (India)") : (internship.location || "On-site, India"),
      mode: internship.mode || 'online',
      workType: internship.mode === 'online' ? 'Online' : 'Offline',
      compensation: internship.compensation || (internship.stipend ? 'paid' : 'unpaid'),
      stipend: internship.compensation === 'unpaid' ? 'Unpaid' : (internship.stipend || (internship.stipendAmount ? `₹${Number(internship.stipendAmount).toLocaleString()}/mo` : '₹15,000/mo')),
      stipendAmount: internship.stipendAmount || 0,
      category: internship.category || "Engineering",
      icon: internship.icon || "corporate_fare",
      tags: internship.tags || [
        internship.compensation === 'unpaid' ? 'Unpaid' : 'Paid',
        internship.mode === 'online' ? 'Online' : 'Offline',
        internship.category || 'Tech'
      ],
      description: internship.description || "Exciting internship opportunity for ambitious students and developers.",
      duration: internship.duration || "3 - 6 Months",
      postedDate: "Just now",
      applicantsCount: 0,
      created_at: new Date().toISOString()
    };
    this.tables.internships.unshift(newIntern);
    this._persist();
    return newIntern;
  }

  // SQL: SELECT * FROM saved_internship_ids
  getSavedInternshipIds() {
    return [...(this.tables.saved_internship_ids || [])];
  }

  // SQL: Toggle Saved Internship
  toggleSaveInternship(internshipId) {
    if (!this.tables.saved_internship_ids) this.tables.saved_internship_ids = [];
    const index = this.tables.saved_internship_ids.indexOf(internshipId);
    let isSaved = false;
    if (index >= 0) {
      this.tables.saved_internship_ids.splice(index, 1);
      isSaved = false;
    } else {
      this.tables.saved_internship_ids.push(internshipId);
      isSaved = true;
    }
    this._persist();
    return { isSaved, savedIds: [...this.tables.saved_internship_ids] };
  }

  // SQL: INSERT INTO internship_applications VALUES (...)
  applyToInternship(internshipId, applicantData = {}) {
    if (!this.tables.internship_applications) this.tables.internship_applications = [];
    const existing = this.tables.internship_applications.find(a => a.internship_id === internshipId);
    if (existing) return { alreadyApplied: true, application: existing };

    const newApp = {
      id: `app_${Date.now()}`,
      internship_id: internshipId,
      applicant_name: applicantData.name || "Student",
      applicant_email: applicantData.email || "guest@skillify.ai",
      status: "Submitted",
      applied_at: new Date().toISOString()
    };
    this.tables.internship_applications.push(newApp);

    // Increment applicantsCount on internship
    const targetIntern = this.tables.internships.find(i => i.id === internshipId);
    if (targetIntern) {
      targetIntern.applicantsCount = (targetIntern.applicantsCount || 0) + 1;
    }

    this._persist();
    return { alreadyApplied: false, application: newApp };
  }

  // SQL: SELECT * FROM internship_applications
  getAppliedInternships() {
    return [...(this.tables.internship_applications || [])];
  }
}

export const sqliteDB = new SQLiteService();
sqliteDB.initDB();
