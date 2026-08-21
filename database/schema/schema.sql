-- Skillify AI Database Schema (SQLite)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 1,
    auth_provider TEXT DEFAULT 'local',
    skills_progress TEXT, -- JSON string array
    target_role TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    category TEXT,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'acquired', 'certified'
    acquired_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT, -- JSON string array
    github_url TEXT,
    live_demo_url TEXT,
    status TEXT DEFAULT 'submitted', -- 'submitted', 'in_review', 'verified'
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    issuer TEXT DEFAULT 'Skillify AI Academy',
    issue_date TEXT,
    credential_id TEXT UNIQUE,
    credential_url TEXT,
    skill_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    sender TEXT NOT NULL, -- 'user' | 'bot'
    text TEXT NOT NULL,
    timestamp TEXT,
    intent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
