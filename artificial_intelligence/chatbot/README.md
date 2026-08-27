# Skillify AI - Chatbot Assistant Service 🤖

The **Chatbot** module is a dedicated conversational AI microservice built with Flask, custom NLP engines, humor synthesis, and continuous learning feedback loops.

---

## 📁 Architecture & File Layout

```
chatbot/
├── app.py                  # Microservice entry point (runs Flask on :5001)
├── chatbot.py              # Main ChatBot class, session management & routing
├── nlp_engine.py           # NLP tokenizer, intent classification & sentiment analysis
├── humor_engine.py         # Contextual tech humor, witty banter & Easter eggs
├── learning_engine.py      # Adaptive correction logging & dynamic learning
├── data/
│   ├── intents.json        # Core conversational intent definitions & response patterns
│   ├── learning_data.json  # Learned user phrases and confidence adjustments
│   └── correction_log.json # History of corrections and intent overrides
├── requirements.txt        # Python dependencies for the Chatbot service
└── start.sh                # Shell script helper to launch the chatbot server
```

---

## 🚀 Running the Chatbot Service

### Prerequisites
- Python 3.9+
- Install dependencies:
```bash
pip install -r chatbot/requirements.txt
```

### Start the Service
```bash
# Run directly with Python
python chatbot/app.py

# Or via npm from root
npm run chatbot
```
The service will start listening on `http://localhost:5001`.

---

## 🔌 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Main conversational endpoint (handles queries, humor, memory) |
| `POST` | `/api/chat/stream` | Server-Sent Events (SSE) streaming chat response |
| `POST` | `/api/feedback` | User correction / feedback for dynamic learning |
| `GET` | `/api/health` | Health check & engine status verification |
| `GET` | `/api/history` | Retrieves conversation history for a session |
| `POST` | `/api/quiz/start` | Proxies quiz generation to `backend/quiz_engine` |
| `POST` | `/api/cv/generate` | Proxies CV generation to `backend/cv_generator` |
| `GET` | `/api/cv/demo/random` | Generates a sample domain CV |
