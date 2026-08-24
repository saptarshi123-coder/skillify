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
| `npm run android:build` | Build debug APK (`gradlew assembleDebug`) |
| `npm run android:build:release` | Build release APK (`gradlew assembleRelease`) |

---

## 📱 Android Studio & APK Instructions

### Open in Android Studio
1. Open **Android Studio**.
2. Click **Open** (or `File > Open...`).
3. Select the folder: `frontend/android` (`c:\Users\sapta\skillify ai\frontend\android`).
4. Android Studio will automatically sync Gradle and load the native project.

### Generated APK Locations
- **Root Ready-to-Install APK**: [`Skillify-AI.apk`](file:///c:/Users/sapta/skillify%20ai/Skillify-AI.apk)
- **Gradle Debug APK**: [`frontend/android/app/build/outputs/apk/debug/app-debug.apk`](file:///c:/Users/sapta/skillify%20ai/frontend/android/app/build/outputs/apk/debug/app-debug.apk)
- **Gradle Release APK**: [`frontend/android/app/build/outputs/apk/release/app-release-unsigned.apk`](file:///c:/Users/sapta/skillify%20ai/frontend/android/app/build/outputs/apk/release/app-release-unsigned.apk)