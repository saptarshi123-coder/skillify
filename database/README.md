# Skillify AI - Database Layer 🗄️

The **Database** directory contains the canonical SQL schema definitions, database migrations, seed datasets, and AI question banks used across Skillify AI.

---

## 📁 Directory Structure

```
database/
├── schema/
│   ├── schema.sql          # Formal SQLite table schemas (users, skills, projects, certificates, etc.)
│   └── sqlite.js           # Reusable JavaScript SQLite client service with localStorage persistence
├── question_banks/         # Canonical assessment question banks for skill testing
│   ├── python.json         # Python programming assessment questions (MCQ, snippet, open-ended)
│   ├── webdev.json         # Full-stack Web Development assessment questions
│   └── appdev.json         # Mobile & Cross-platform App Development questions
├── seed_data/              # Initial seed datasets for application bootstrap
│   ├── studentsData.js     # Demo student profiles and leaderboard benchmarks
│   ├── quizData.js         # Default subject curricula and question sets
│   ├── communityProjects.js # Curated open-source projects for student contributions
│   ├── chatbotIntents.json # AI conversational intents and NLP training patterns
│   ├── learning_data.json  # Chatbot dynamic learning memory seed
│   └── correction_log.json # NLP correction training logs
└── README.md               # Database documentation
```

---

## 📊 Database Tables Overview

| Table Name | Primary Key | Description |
|---|---|---|
| `users` | `id` (TEXT) | Student profiles, auth provider, level, XP, streak, skills progress |
| `skills` | `id` (TEXT) | Skills mastered, verified badge status, quiz completion timestamps |
| `projects` | `id` (TEXT) | Portfolio projects, repository URLs, tags, and review feedback |
| `certificates` | `id` (TEXT) | Earned course and skill certificates with verification hash |
| `chat_messages` | `id` (TEXT) | Historical chat messages exchanged with the AI chatbot assistant |
| `internships` | `id` (TEXT) | Available internship opportunities, stipends, and deadlines |
| `internship_applications` | `id` (TEXT) | Applications submitted by students with status tracking |
