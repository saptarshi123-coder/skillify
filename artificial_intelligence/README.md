# Skillify AI - Artificial Intelligence Services 🧠⚙️

The **`artificial_intelligence/`** directory contains all Artificial Intelligence, Natural Language Processing, skill assessment, and dynamic document generation engines.

---

## 📁 Directory Structure

```
artificial_intelligence/
├── chatbot/                # AI Conversational Assistant Microservice (Flask on :5001)
│   ├── app.py              # Flask API Entry Point
│   ├── chatbot.py          # Main ChatBot class, memory & cross-engine orchestrator
│   ├── nlp_engine.py       # NLP intent classification & sentiment analysis
│   ├── humor_engine.py     # Dynamic developer humor & conversational banter
│   ├── learning_engine.py  # Adaptive feedback logging & dynamic memory
│   ├── data/               # Intents, learned patterns & correction logs
│   │   ├── intents.json
│   │   ├── learning_data.json
│   │   └── correction_log.json
│   └── requirements.txt    # Chatbot Python dependencies
│
├── quiz_engine/            # AI Assessment & Skill Verification Engine
│   ├── api.py              # SkillQuizAPI session management and scoring
│   ├── quiz_engine.py      # Question selection, timer & assessment engine
│   ├── nlp_checker.py      # NLP-powered open-ended answer validation
│   ├── question_banks/     # Assessment datasets (Python, Web, App)
│   └── requirements.txt    # Quiz engine Python dependencies
│
├── cv_generator/           # AI CV & Resume Generator Service (FastAPI / ReportLab)
│   ├── main.py             # CV Generation API endpoints and router
│   ├── server.py           # Standalone FastAPI server app factory
│   ├── service.py          # PDF generation orchestration
│   ├── pdf_builder.py      # ReportLab canvas drawing & typography engine
│   ├── domain_engine.py    # Target domain ATS customization (SDE, AI/ML, Design)
│   ├── repository.py       # Data normalization layer
│   ├── schemas.py          # Pydantic data schemas & contracts
│   ├── sample_data.py      # Demo profile fixtures
│   └── requirements.txt    # CV generator Python dependencies
│
├── server.py               # AI FastAPI & CV server runner
├── requirements.txt        # Consolidated Python dependencies for all AI services
└── README.md               # AI architecture documentation
```

---

## 🚀 Running AI Services

### 1. Install Dependencies
```bash
pip install -r artificial_intelligence/requirements.txt
```

### 2. Run the AI Chatbot Assistant (:5001)
```bash
# Direct runner
python artificial_intelligence/chatbot/app.py

# Or from workspace root
npm run chatbot
```

### 3. Run the AI CV Generator Server (:8000)
```bash
# Direct runner
python artificial_intelligence/server.py

# Or from workspace root
npm run ai:cv
```

### 4. Run the AI Quiz Engine
```bash
# Run interactive CLI quiz engine
python artificial_intelligence/quiz_engine/quiz_engine.py

# Or from workspace root
npm run ai:quiz
```
