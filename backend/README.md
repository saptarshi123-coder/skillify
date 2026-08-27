# Skillify AI - Discrete Java Backend ☕

The **`backend/`** directory contains the discrete, multi-threaded REST API backend implemented in **Java (JDK 24)** with zero external runtime dependencies.

---

## 🏛️ Architecture & Package Structure

```
backend/
├── src/main/java/com/skillify/backend/
│   ├── SkillifyBackendServer.java   # Main HTTP REST Server & Route Dispatcher (Port :8080)
│   ├── controllers/                 # REST API Controllers
│   │   ├── UserController.java       # User Profile, Streak, XP & Level Handlers
│   │   ├── InternshipController.java # Internship Search, Listings & Applications
│   │   ├── ProjectController.java    # Student Showcase Projects & Submissions
│   │   ├── SkillController.java      # Verified Skill Records & Badges
│   │   └── AIProxyController.java    # Gateway & Health Monitoring to Python AI Service
│   ├── services/                    # Business Logic & Persistence Services
│   │   └── DatabaseService.java      # Thread-safe SQLite/In-memory Data Access Service
│   ├── models/                      # Domain Entities
│   │   ├── User.java
│   │   ├── Skill.java
│   │   ├── Project.java
│   │   ├── Internship.java
│   │   ├── InternshipApplication.java
│   │   └── ApiResponse.java
│   └── utils/                       # Zero-Dependency Utilities
│       ├── JsonUtils.java            # Reflection & AST JSON Parser & Serializer
│       └── CorsHandler.java          # Cross-Origin Resource Sharing (CORS) Filter
├── bin/                             # Compiled Java Bytecode (.class files)
├── build.bat                        # Batch compilation script using javac
├── run.bat                          # Batch execution script using java
└── README.md                        # Java backend documentation
```

---

## 🚀 Running the Java Backend

### Prerequisites
- JDK 17+ or JDK 24 (Standard `javac` and `java` commands)

### 1. Build the Backend
```bash
# Windows
backend\build.bat
```

### 2. Start the Backend Server
```bash
# Direct runner
backend\run.bat

# Or from workspace root via npm
npm run backend
```
The server will start listening on **`http://localhost:8080`**.

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Gateway health check (Java Backend + Python AI status) |
| `GET` | `/api/users/profile` | Retrieve student profile, level, XP, and streak |
| `POST` | `/api/users/profile` | Update profile fields, XP increment, streak updates |
| `GET` | `/api/internships` | List internships (supports `?domain=SDE` and `?search=react`) |
| `POST` | `/api/internships/apply` | Submit an internship application |
| `GET` | `/api/internships/applications` | Retrieve student submitted applications |
| `GET` | `/api/projects` | List community showcase projects |
| `POST` | `/api/projects` | Submit a new student project |
| `GET` | `/api/skills` | List verified skill badges |
| `POST` | `/api/skills/verify` | Record verified skill after quiz completion |
