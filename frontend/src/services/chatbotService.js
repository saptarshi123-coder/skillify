import intentsData from '../data/chatbotIntents.json';

// Configuration
const DEFAULT_NGROK_URL = 'https://script-ungloved-plutonium.ngrok-free.dev/api';
const DIRECT_API_BASE = 'http://localhost:5001/api';
const PROXY_API_BASE = '/api';

// Configurable via Vite environment variable VITE_CHATBOT_API_URL or defaults to your ngrok tunnel
const NGROK_API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHATBOT_API_URL)
  ? `${import.meta.env.VITE_CHATBOT_API_URL.replace(/\/$/, '')}/api`
  : DEFAULT_NGROK_URL;

// Default headers for API calls (including ngrok-skip-browser-warning for ngrok free tier)
const API_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

// Check if running inside mobile native / Capacitor webview
const isMobileNative = () => {
  return typeof window !== 'undefined' && (
    window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'file:' ||
    !window.location.hostname ||
    window.location.hostname === 'localhost' && window.location.port === ''
  );
};

// Humorous Typing Indicators
const TYPING_INDICATORS = [
  "Skille is consulting the neural matrix... 🧠",
  "Untangling neural cables... 🔌",
  "Consulting the rubber duck on desk... 🦆",
  "Searching the SKILLIFY knowledge base... 🔍",
  "Synthesizing optimal response... ⚡",
  "Doing quick computational acrobatics... 🤸‍♂️",
  "Crafting high-octane coding advice... 💻",
  "Optimizing algorithmic synapses... 🚀"
];

// Common texting slang dictionary from nlp_engine.py
const TEXTING_SLANG = {
  "u": "you",
  "ur": "your",
  "r": "are",
  "thx": "thanks",
  "ty": "thank you",
  "pls": "please",
  "plz": "please",
  "idk": "i do not know",
  "tbh": "to be honest",
  "imo": "in my opinion",
  "imho": "in my humble opinion",
  "btw": "by the way",
  "fyi": "for your information",
  "asap": "as soon as possible",
  "wbu": "what about you",
  "hbu": "how about you",
  "np": "no problem",
  "yw": "you are welcome",
  "sup": "what is up",
  "gonna": "going to",
  "wanna": "want to",
  "gotta": "got to",
  "k": "okay",
  "ok": "okay",
  "msg": "message",
  "acc": "account",
  "pwd": "password",
  "dev": "developer",
  "proj": "project"
};

// Common typos dictionary from nlp_engine.py
const COMMON_TYPOS = {
  "freelncr": "freelancer",
  "freelanser": "freelancer",
  "freelencer": "freelancer",
  "freelancr": "freelancer",
  "frelancer": "freelancer",
  "freelancng": "freelancing",
  "prposal": "proposal",
  "proposl": "proposal",
  "paymnt": "payment",
  "paymet": "payment",
  "pymnt": "payment",
  "escro": "escrow",
  "escrw": "escrow",
  "pythn": "python",
  "javascrpt": "javascript",
  "rect": "react",
  "anglar": "angular",
  "prfl": "profile",
  "profl": "profile",
  "bg": "badge",
  "bdg": "badge",
  "quz": "quiz",
  "quzz": "quiz"
};

// Expanded Tech & Coding Knowledge Base
const TECH_KNOWLEDGE = {
  "binary search": {
    intent: "tech_dsa",
    response: "### 🔍 Binary Search Algorithm\n\nBinary Search repeatedly divides the search space in half on a sorted array:\n\n```python\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n```\n\n- **Time Complexity:** $O(\\log N)$\n- **Space Complexity:** $O(1)$ (Iterative)\n- **Rule:** The input collection must be sorted!",
    suggestedActions: [
      { label: "📝 Take Python DSA Quiz", screen: "quiz-select" },
      { label: "🏆 View DSA Badges", screen: "badges" }
    ]
  },
  "hash table": {
    intent: "tech_dsa",
    response: "### ⚡ Hash Table Collisions & Resolution\n\nHash collisions occur when two different keys generate the same bucket index. Key resolution strategies:\n\n1. **Separate Chaining:** Each bucket holds a linked list or dynamic array of entries.\n2. **Open Addressing:** Probes for the next available slot when collision occurs:\n   - *Linear Probing:* `h(k, i) = (h'(k) + i) % m`\n   - *Quadratic Probing:* `h(k, i) = (h'(k) + c1*i + c2*i^2) % m`\n   - *Double Hashing:* `h(k, i) = (h1(k) + i * h2(k)) % m`\n\nPython `dict` and JavaScript `Map` optimize hash lookup down to average $O(1)$!",
    suggestedActions: [
      { label: "📝 Take Python Quiz", screen: "quiz-select" },
      { label: "📂 Explore DSA Projects", screen: "discover" }
    ]
  },
  "react": {
    intent: "tech_frontend",
    response: "### ⚛️ React 18 & 19 Performance Best Practices\n\nKey techniques for lightning-fast React interfaces:\n\n1. **Memoization:** Wrap expensive pure components in `React.memo` and computed data in `useMemo()`.\n2. **Callback Stability:** Pass stable handler functions with `useCallback()` to prevent child rerenders.\n3. **State Colocation:** Keep state localized to the specific component subtree where it is consumed.\n4. **Concurrent Rendering:** Use `useTransition()` and `useDeferredValue()` for non-blocking search and filters.\n5. **Virtualization:** Use virtual list windows (`react-window`) when rendering thousands of items.",
    suggestedActions: [
      { label: "📂 View React Projects", screen: "discover" },
      { label: "📝 React Quiz", screen: "quiz-select" }
    ]
  },
  "python": {
    intent: "tech_python",
    response: "### 🐍 Python Pro-Tips & Architecture\n\n- **List Comprehensions:** `[x**2 for x in nums if x % 2 == 0]` is faster than manual loops.\n- **Generators & Yield:** Save memory when streaming large data using generator functions.\n- **Context Managers:** Always use `with open(...)` or `async with` for automatic resource cleanup.\n- **Type Hints:** Use `typing` (e.g. `def process(data: list[str]) -> bool:`) for robust IDE validation.",
    suggestedActions: [
      { label: "📝 Take Python AI Quiz", screen: "quiz-select" },
      { label: "🏆 View Python Badges", screen: "badges" }
    ]
  },
  "pointer": {
    intent: "tech_systems",
    response: "### 💾 C++ Pointers & Memory Safety\n\nIn C++, pointers store direct memory addresses:\n\n```cpp\nint val = 42;\nint* ptr = &val; // stores address\n*ptr = 100;      // dereferences and modifies val\n```\n\n**Modern C++ Best Practice:** Always prefer **Smart Pointers** (`std::unique_ptr`, `std::shared_ptr`) over raw `new`/`delete` to prevent memory leaks and dangling pointer errors!",
    suggestedActions: [
      { label: "📂 Open C++ Repo", screen: "project-repo" },
      { label: "📝 C++ Memory Quiz", screen: "quiz-select" }
    ]
  },
  "git": {
    intent: "tech_tools",
    response: "### 🌿 Essential Git Commands\n\n- `git checkout -b <branch>`: Create & switch to feature branch\n- `git stash push -m 'wip'`: Temporarily shelve uncommitted work\n- `git rebase -i HEAD~3`: Cleanly squash and tidy up recent commits\n- `git cherry-pick <hash>`: Apply a specific commit to your current branch",
    suggestedActions: [
      { label: "📂 Discover Git Repos", screen: "discover" },
      { label: "🏆 View Badges", screen: "badges" }
    ]
  },
  "docker": {
    intent: "tech_devops",
    response: "### 🐳 Containerization with Docker\n\nDocker packages applications with all dependencies into reproducible container images:\n\n```dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]\n```\n\n- Multi-stage builds reduce final production image sizes by up to 80%!",
    suggestedActions: [
      { label: "📂 DevOps Projects", screen: "discover" },
      { label: "📝 Tech Quiz", screen: "quiz-select" }
    ]
  }
};

// Tech & Freelancing Jokes from Humor Engine
const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
  "There are only 10 types of people in the world: those who understand binary and those who don't. 🤖",
  "A SQL query walks into a bar, sees two tables and asks: 'Can I join you?' 🍺",
  "Why did the developer go broke? Because he used up all his cache! 💰",
  "Why do Java developers wear glasses? Because they don't C#! 👓",
  "What do you call a freelancer who finishes ahead of schedule? A rare species indeed! 🦄",
  "How does a freelancer exercise? By doing proposal push-ups and deadline crunches every morning! 💪",
  "Why did the freelance designer break up with the font? Because they found someone more appealing! 🎨",
  "What's a programmer's favorite hangout place? Foo Bar! 🍸",
  "How many programmers does it take to change a light bulb? None — that's a hardware problem! 💡",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "I'm reading a book about anti-gravity. It's impossible to put down! 🚀"
];

// Suggested Actions Map per Intent
const INTENT_ACTIONS = {
  find_freelancer: [
    { label: "🔍 Browse Freelancers", screen: "explore" },
    { label: "📄 Post a Job", screen: "submit-project" },
    { label: "💡 How Escrow Works", prompt: "How does escrow payment work?" }
  ],
  post_job: [
    { label: "🚀 Post a Job Listing", screen: "submit-project" },
    { label: "📊 View Pricing & Fees", prompt: "What are the platform fees?" },
    { label: "👥 Browse Talent", screen: "explore" }
  ],
  skills_badges: [
    { label: "🏆 View My Badges", screen: "badges" },
    { label: "📝 Take Skill Assessment", screen: "quiz-select" },
    { label: "🎯 Select Skills", screen: "select-skill" }
  ],
  payments: [
    { label: "🛡️ Escrow FAQ", prompt: "How does escrow protect me?" },
    { label: "💳 Withdraw Earnings", prompt: "How do I withdraw my earnings?" },
    { label: "📜 View Contracts", screen: "dashboard" }
  ],
  how_skillify_works: [
    { label: "🌟 Explore Platform", screen: "explore" },
    { label: "🎓 Take Skill Quizzes", screen: "quiz-select" },
    { label: "💼 View Project Showcase", screen: "discover" }
  ],
  job_search: [
    { label: "📂 Projects", screen: "discover" },
    { label: "🏆 Earn Skill Badges", screen: "badges" },
    { label: "✏️ Update Profile", screen: "edit-profile" }
  ],
  profile_setup: [
    { label: "✏️ Edit Profile", screen: "edit-profile" },
    { label: "🎯 Manage Skills", screen: "select-skill" },
    { label: "👤 View Public Profile", screen: "public-profile" }
  ],
  joke: [
    { label: "😂 Tell Another Joke", prompt: "Tell me another joke!" },
    { label: "💡 Freelancing Tips", prompt: "Give me some freelancing tips" },
    { label: "🚀 What can you do?", prompt: "What can you do?" }
  ],
  greeting: [
    { label: "🎯 Take a Skill Quiz", screen: "quiz-select" },
    { label: "🌟 Projects", screen: "discover" },
    { label: "💡 How does Skillify work?", prompt: "How does Skillify work?" }
  ],
  emotional_sadness: [
    { label: "🌟 Give Me a Pep Talk", prompt: "Can you motivate me? I feel like giving up" },
    { label: "😂 Tell Me a Light Joke", prompt: "Tell me a joke!" },
    { label: "🎯 Explore Practice Quizzes", screen: "quiz-select" }
  ],
  emotional_excitement: [
    { label: "📝 Take Another Quiz", screen: "quiz-select" },
    { label: "🏆 View My Badges", screen: "badges" },
    { label: "🌟 Projects", screen: "discover" }
  ],
  emotional_frustration: [
    { label: "🦆 Explain Debugging Steps", prompt: "How do I debug code step by step?" },
    { label: "😂 Tell a Coding Joke", prompt: "Tell me a joke!" },
    { label: "💻 Ask a Tech Question", prompt: "Explain Binary Search" }
  ],
  emotional_stress_anxiety: [
    { label: "🌿 Breathing & Reset Tips", prompt: "How to deal with coding stress and exam anxiety?" },
    { label: "🗺️ Simple Study Roadmap", prompt: "Give me a step-by-step coding roadmap" },
    { label: "🎯 Practice Easy Quiz", screen: "quiz-select" }
  ],
  emotional_gratitude_love: [
    { label: "🚀 Explore New Skills", screen: "select-skill" },
    { label: "📝 Take a Coding Quiz", screen: "quiz-select" },
    { label: "🌟 Projects", screen: "discover" }
  ],
  emotional_motivation: [
    { label: "🔥 Start a Quiz Assessment", screen: "quiz-select" },
    { label: "✨ Give Me Another Pep Talk", prompt: "Give me more motivation!" },
    { label: "💡 Freelancing Tips", prompt: "Give me some freelancing tips" }
  ],
  emotional_confusion: [
    { label: "🗺️ Frontend Roadmap", prompt: "What is the best roadmap to learn web development?" },
    { label: "🐍 Python Basics", prompt: "Explain Python basics simply" },
    { label: "🎯 Choose My Skills", screen: "select-skill" }
  ]
};

// Default Quick Replies
const DEFAULT_QUICK_REPLIES = [
  "How does SKILLIFY work?",
  "Take Python Assessment",
  "Explain Hash Table Collisions",
  "How does Escrow work?",
  "Tell me a Joke"
];

class LocalNLPClient {
  constructor() {
    this.intents = intentsData || {};
    this.jokes = JOKES;
  }

  cleanText(text) {
    let lower = text.toLowerCase().trim();
    // Normalize punctuation
    lower = lower.replace(/[^\w\s]/g, ' ');
    // Expand Slang and Fix Typos
    const words = lower.split(/\s+/).map(w => {
      if (TEXTING_SLANG[w]) return TEXTING_SLANG[w];
      if (COMMON_TYPOS[w]) return COMMON_TYPOS[w];
      return w;
    });
    return words.join(' ');
  }

  tokenize(text) {
    return this.cleanText(text)
      .split(/\s+/)
      .filter(w => w.length > 1);
  }

  detectSentiment(text) {
    const lower = text.toLowerCase();
    const positiveWords = ['great', 'awesome', 'good', 'love', 'thanks', 'thank', 'perfect', 'excellent', 'amazing', 'happy', 'cool', 'nice', 'help', 'best', 'super', 'glad'];
    const negativeWords = ['bad', 'terrible', 'hate', 'angry', 'bug', 'error', 'scam', 'fraud', 'fail', 'slow', 'worst', 'issue', 'problem', 'broken', 'difficult', 'annoying'];
    const curiousWords = ['how', 'why', 'what', 'explain', 'tell', 'where', 'when', 'who', 'could', 'can', 'should', 'difference', 'compare'];

    let posScore = 0;
    let negScore = 0;
    let curiousScore = 0;

    positiveWords.forEach(w => { if (lower.includes(w)) posScore++; });
    negativeWords.forEach(w => { if (lower.includes(w)) negScore++; });
    curiousWords.forEach(w => { if (lower.includes(w)) curiousScore++; });

    if (negScore > posScore && negScore > 0) return 'negative';
    if (posScore > 0) return 'positive';
    if (curiousScore > 0) return 'curious';
    return 'neutral';
  }

  findBestIntent(text) {
    const rawLower = text.toLowerCase().trim();
    const cleaned = this.cleanText(text);
    const tokens = this.tokenize(text);

    // 1. Direct Tech Knowledge Lookups
    for (const [key, item] of Object.entries(TECH_KNOWLEDGE)) {
      if (rawLower.includes(key) || cleaned.includes(key)) {
        return {
          intent: item.intent,
          confidence: 0.96,
          response: item.response,
          suggestedActions: item.suggestedActions,
          isTech: true
        };
      }
    }

    // 2. Jokes and Humor Queries
    if (rawLower.includes('joke') || rawLower.includes('funny') || rawLower.includes('humor') || rawLower.includes('laugh') || rawLower.includes('pun')) {
      const randomJoke = this.jokes[Math.floor(Math.random() * this.jokes.length)];
      return {
        intent: 'joke',
        confidence: 0.99,
        response: randomJoke,
        suggestedActions: INTENT_ACTIONS.joke,
        isTech: false
      };
    }

    // 3. Match against JSON Intent Patterns
    let bestIntent = 'unknown';
    let highestScore = 0;

    for (const [intentName, intentObj] of Object.entries(this.intents)) {
      const patterns = intentObj.patterns || [];
      for (const pattern of patterns) {
        const pLower = pattern.toLowerCase();
        const pClean = this.cleanText(pattern);

        // Exact match
        if (rawLower === pLower || cleaned === pClean) {
          return {
            intent: intentName,
            confidence: 0.99,
            response: this.getRandomResponse(intentObj.responses),
            suggestedActions: INTENT_ACTIONS[intentName] || []
          };
        }

        // Substring match
        if (rawLower.includes(pLower) || cleaned.includes(pClean)) {
          const score = (pLower.length / Math.max(rawLower.length, 1)) * 0.8 + 0.3;
          if (score > highestScore) {
            highestScore = score;
            bestIntent = intentName;
          }
        }

        // Token Jaccard similarity
        const pTokens = this.tokenize(pLower);
        const overlap = tokens.filter(t => pTokens.includes(t)).length;
        if (pTokens.length > 0) {
          const jaccard = overlap / (tokens.length + pTokens.length - overlap);
          if (jaccard > highestScore && jaccard > 0.25) {
            highestScore = jaccard;
            bestIntent = intentName;
          }
        }
      }
    }

    if (bestIntent !== 'unknown' && this.intents[bestIntent]) {
      return {
        intent: bestIntent,
        confidence: Math.min(0.95, Math.round(highestScore * 100) / 100),
        response: this.getRandomResponse(this.intents[bestIntent].responses),
        suggestedActions: INTENT_ACTIONS[bestIntent] || []
      };
    }

    // 4. Intelligent Fallback Response
    return {
      intent: 'general_assistance',
      confidence: 0.7,
      response: `I'm Skille, your AI Learning & Career Guide on SKILLIFY! 🚀\n\nI can help you with:\n- **Skill Certifications:** Take AI-graded assessments in Python, Web Dev, and App Dev.\n- **Coding Assistance:** Ask about Algorithms, Binary Search, Hash Tables, React, C++, and Git.\n- **Freelancing & Platform Guidance:** Learn about Escrow protection, posting jobs, and earning verified badges.`,
      suggestedActions: [
        { label: "🎯 Take a Skill Quiz", screen: "quiz-select" },
        { label: "💡 How Escrow Works", prompt: "How does escrow payment work?" },
        { label: "😂 Tell me a Joke", prompt: "Tell me a joke!" }
      ]
    };
  }

  getRandomResponse(responses) {
    if (!responses || responses.length === 0) {
      return "How can I assist you further today on SKILLIFY?";
    }
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getQuickReplies(lastIntent) {
    if (lastIntent && INTENT_ACTIONS[lastIntent]) {
      return INTENT_ACTIONS[lastIntent].map(a => a.prompt || a.label.replace(/^[^\w\s]+\s*/, ''));
    }
    return DEFAULT_QUICK_REPLIES;
  }
}

class ChatbotService {
  constructor() {
    this.localClient = new LocalNLPClient();
    this.isBackendOnline = false;
    this.backendVersion = null;
    this.activeUserId = 'user_' + Date.now();
    this.lastHealthCheck = 0;
    this.activeApiBase = null;
  }

  async checkBackendHealth(force = false) {
    const now = Date.now();
    if (!force && now - this.lastHealthCheck < 8000) {
      return { online: this.isBackendOnline, version: this.backendVersion, activeUrl: this.activeApiBase };
    }

    this.lastHealthCheck = now;

    // Candidate backend endpoints in priority order (Ngrok remote tunnel -> direct localhost -> local proxy)
    const candidateEndpoints = [
      NGROK_API_BASE,
      DIRECT_API_BASE,
      PROXY_API_BASE
    ].filter(Boolean);

    for (const base of candidateEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${base}/health`, {
          signal: controller.signal,
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        clearTimeout(timeoutId);

        if (res && res.ok) {
          const data = await res.json();
          if (data.status === 'healthy' || data.service) {
            this.isBackendOnline = true;
            this.backendVersion = data.version || '2.0.0';
            this.activeApiBase = base;
            return { online: true, version: this.backendVersion, data, activeUrl: base };
          }
        }
      } catch (e) {
        // Continue to check next candidate endpoint
      }
    }

    this.isBackendOnline = false;
    this.activeApiBase = null;
    return { online: false, version: 'Local Standalone Engine' };
  }

  getTypingIndicator() {
    return TYPING_INDICATORS[Math.floor(Math.random() * TYPING_INDICATORS.length)];
  }

  async sendMessage(messageText, userId = this.activeUserId, onStreamChunk = null) {
    const health = await this.checkBackendHealth();
    const sentiment = this.localClient.detectSentiment(messageText);

    // If Python Backend is online (via Ngrok tunnel, localhost, or dev proxy), call live API
    if (health.online && this.activeApiBase) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`${this.activeApiBase}/chat`, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify({ message: messageText, user_id: userId }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res && res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            const botData = result.data;
            const fullResponse = botData.response;

            // Stream words smoothly to frontend
            if (onStreamChunk) {
              const words = fullResponse.split(' ');
              let accumulated = '';
              for (let i = 0; i < words.length; i++) {
                accumulated += (i === 0 ? '' : ' ') + words[i];
                onStreamChunk(accumulated);
                if (i % 3 === 0) {
                  await new Promise(r => setTimeout(r, 18));
                }
              }
            }

            const rawActions = botData.suggested_actions || [];
            const formattedActions = rawActions.map(act => {
              if (typeof act === 'string') {
                return { label: act, prompt: act };
              }
              return act;
            });

            const isTunnel = this.activeApiBase.includes('ngrok');
            const engineName = isTunnel 
              ? `Python Server (Live Tunnel v${this.backendVersion})` 
              : `Python Server (v${this.backendVersion})`;

            return {
              text: fullResponse,
              intent: botData.intent || 'general',
              confidence: botData.confidence || 0.95,
              sentiment: botData.sentiment || sentiment,
              emotion: botData.emotion || {
                style_sentiment: botData.sentiment || sentiment,
                emotion_tags: botData.intent?.startsWith('emotional_') ? [botData.intent.replace('emotional_', '')] : []
              },
              responseType: botData.response_type || 'standard',
              suggestedActions: formattedActions.length > 0 ? formattedActions : (INTENT_ACTIONS[botData.intent] || []),
              engine: engineName,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
        }
      } catch (err) {
        console.warn('Live backend chat failed, switching seamlessly to Local Standalone NLP engine:', err);
      }
    }

    // High Performance Client-side Standalone NLP Engine (100% Offline & Fallback Parity)
    const nlpResult = this.localClient.findBestIntent(messageText);
    const fullText = nlpResult.response;

    if (onStreamChunk) {
      const words = fullText.split(' ');
      let accumulated = '';
      for (let i = 0; i < words.length; i++) {
        accumulated += (i === 0 ? '' : ' ') + words[i];
        onStreamChunk(accumulated);
        if (i % 2 === 0) {
          await new Promise(r => setTimeout(r, 20));
        }
      }
    }

    const localEmotionTag = nlpResult.intent?.startsWith('emotional_') 
      ? [nlpResult.intent.replace('emotional_', '')] 
      : (sentiment === 'positive' ? ['happy'] : sentiment === 'negative' ? ['frustrated'] : []);

    return {
      text: fullText,
      intent: nlpResult.intent,
      confidence: nlpResult.confidence,
      sentiment: sentiment,
      emotion: {
        style_sentiment: sentiment,
        emotion_tags: localEmotionTag
      },
      responseType: 'local_nlp',
      suggestedActions: nlpResult.suggestedActions || INTENT_ACTIONS[nlpResult.intent] || [],
      engine: 'Skillify Standalone AI Engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  async getQuickReplies(userId = this.activeUserId, lastIntent = null) {
    if (this.isBackendOnline && this.activeApiBase) {
      try {
        const res = await fetch(`${this.activeApiBase}/quick-replies`, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify({ user_id: userId, last_intent: lastIntent })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.quick_replies) {
            return json.data.quick_replies.map(r => r.text);
          }
        }
      } catch (e) {
        // fallback
      }
    }
    return this.localClient.getQuickReplies(lastIntent);
  }

  async submitFeedback(userId, messageIndex, rating, comment = '') {
    if (this.isBackendOnline && this.activeApiBase) {
      try {
        await fetch(`${this.activeApiBase}/feedback`, {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify({ user_id: userId, message_index: messageIndex, rating, comment })
        });
      } catch (e) {
        console.warn('Feedback sync skipped:', e);
      }
    }
    return true;
  }

  async getSessionMood(userId = this.activeUserId, localMessages = []) {
    if (this.isBackendOnline && this.activeApiBase) {
      try {
        const res = await fetch(`${this.activeApiBase}/session/${userId}/mood`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        }
      } catch (e) {
        // fallback
      }
    }

    // Local mood analysis
    const counts = { positive: 0, neutral: 0, negative: 0, curious: 0 };
    localMessages.forEach(m => {
      const s = m.sentiment || 'neutral';
      counts[s] = (counts[s] || 0) + 1;
    });

    let dominant = 'positive';
    let max = -1;
    for (const [k, v] of Object.entries(counts)) {
      if (v > max) {
        max = v;
        dominant = k;
      }
    }

    return {
      current_mood: dominant,
      dominant_mood: dominant,
      mood_breakdown: counts,
      mood_trend: localMessages.slice(-8).map(m => m.sentiment || 'neutral')
    };
  }

  async clearBackendConversation(userId = this.activeUserId) {
    if (this.isBackendOnline && this.activeApiBase) {
      try {
        await fetch(`${this.activeApiBase}/conversation/${userId}/clear`, {
          method: 'POST',
          headers: API_HEADERS
        });
      } catch (e) {
        // ignore
      }
    }
  }
}

export const chatbotService = new ChatbotService();
