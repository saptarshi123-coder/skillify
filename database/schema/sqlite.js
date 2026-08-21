// SQLite Database Layer for Skillify Mobile Application
// Uses SQL database tables to store users, skills, projects, certificates, and AI chatbot messages.

const DB_STORAGE_KEY = 'skillify_sqlite_data';

class SQLiteService {
  constructor() {
    this.tables = {
      users: [],
      skills: [],
      projects: [],
      certificates: [],
      chat_messages: []
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
          if (u.level === 14 || !u.skills_progress) {
            u.level = 1;
            u.xp = 0;
            u.streak = 1;
            u.skills_progress = [
              { name: "Frontend Development", progress: 0 },
              { name: "Data Structures & Algorithms", progress: 0 },
              { name: "UI/UX Design", progress: 0 },
              { name: "Python & Data Science", progress: 0 }
            ];
          }
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
        this._persist();
      } else {
        this._seedInitialData();
      }
      this.isInitialized = true;
      console.log('SQLite Database Initialized with tables: users, skills, projects, certificates, chat_messages');
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
}

export const sqliteDB = new SQLiteService();
sqliteDB.initDB();
