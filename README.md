# SKILLIFY 🚀

An AI-powered learning and freelance platform featuring an intelligent chatbot assistant and interactive skill quizzes.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Capacitor
- **Backend:** Python (Flask), NLTK, NLP engines

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
npm --prefix frontend install
```

### 2. Run the App
To run both the **Chatbot API** (`:5001`) and the **Frontend** (`:5173`) simultaneously:

```bash
npm run dev:all
```
*(The Python virtual environment and dependencies will be built automatically on first run).*

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev:all` | Run frontend & chatbot backend together |
| `npm run dev` | Run Vite frontend only (`localhost:5173`) |
| `npm run chatbot` | Run Flask chatbot API only (`localhost:5001`) |
| `npm run build` | Build frontend for production |
| `npm run android:sync` | Sync build with Capacitor Android project |
| `npm run android:open` | Open project in Android Studio |