# Skillify AI - Firebase Google Authentication & Firestore Rules Analysis

This document provides an in-depth technical analysis and step-by-step resolution for:
1. **Why Firebase Google Authentication fails on Mobile (Capacitor / Android)**
2. **Why Firebase Google Authentication fails on Localhost (Web)**
3. **Why there are two `firestore.rules` files and how to resolve the duplication**

---

## 1. Why Firebase Google Authentication Fails on Mobile (Capacitor / Android)

### Root Causes

#### 1.1. Google OAuth Blocks Embedded WebViews (`disallowed_useragent`)
- **The Issue**: On Android, Capacitor runs your React frontend inside an `Android WebView` (`https://localhost` or `capacitor://localhost`).
- **Why it breaks**: Google OAuth 2.0 strictly forbids authentication inside embedded WebViews to prevent phishing and man-in-the-middle attacks. When `signInWithPopup()` or `signInWithRedirect()` is called inside a WebView, Google throws:
  ```
  Error 403: disallowed_useragent
  ```
- **Window Popup Failure**: `signInWithPopup` attempts to call `window.open()`. In native Android WebViews, multiple window management is either disabled or opens an unhandled blank tab, resulting in `auth/popup-blocked` or `auth/popup-closed-by-user`.

#### 1.2. `@capacitor-firebase/authentication` is Installed but Never Used in Code
- **The Issue**: In `frontend/package.json` and Gradle build scripts, `@capacitor-firebase/authentication` (`^8.5.1`) is installed and synced:
  ```json
  "@capacitor-firebase/authentication": "^8.5.1"
  ```
- **Why it breaks**: In `frontend/src/context/AppContext.jsx` (lines 451–508), the app **only** calls the standard Firebase Web JS SDK:
  ```javascript
  // AppContext.jsx currently does:
  const result = await signInWithPopup(auth, googleProvider);
  ```
  It **never imports or calls** `FirebaseAuthentication.signInWithGoogle()` from `@capacitor-firebase/authentication`. As a result, the native Google Sign-In intent is never triggered on Android.

#### 1.3. Missing `google-services.json` in the Android Project
- **The Issue**: In `frontend/android/app/`, there is no `google-services.json` file.
- **Why it breaks**: Look at `frontend/android/app/build.gradle` (lines 51–58):
  ```groovy
  try {
      def servicesJSON = file('google-services.json')
      if (servicesJSON.text) {
          apply plugin: 'com.google.gms.google-services'
      }
  } catch(Exception e) {
      logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
  }
  ```
  Without `google-services.json`, Google Play Services cannot verify the Android client ID, package name (`com.skillify.ai`), or OAuth credentials.

#### 1.4. Missing Android App & SHA-1 Fingerprint in Firebase Console
- **The Issue**: Native Android Google Sign-In requires your app's debug/release **SHA-1 certificate fingerprint** registered in the Firebase Console.
- **Why it breaks**: Without SHA-1, Google Sign-In fails immediately with error code `10: DEVELOPER_ERROR` or `12500`.

---

## 2. Why Firebase Google Authentication Fails on Localhost (Web)

### Root Causes

#### 2.1. Google Sign-In Provider Disabled in Firebase Console
- In Firebase Console > **Authentication** > **Sign-in method**, the **Google** provider must be toggled **Enabled** and configured with a support email.
- If not enabled, `signInWithPopup()` returns `auth/operation-not-allowed` or `auth/configuration-not-found`.

#### 2.2. Domain / Origin Not in Authorized Domains
- In Firebase Console > **Authentication** > **Settings** > **Authorized domains**:
  - `localhost` is allowed by default.
  - **However**, if you access your app via:
    - `http://127.0.0.1:5173`
    - `http://192.168.x.x:5173` (LAN / mobile testing on same Wi-Fi)
    - ngrok / cloudflared tunnels (e.g. `https://profanity-manor-overeager.ngrok-free.dev`)
  - Firebase rejects the popup with `auth/unauthorized-domain`.

#### 2.3. Browser Pop-up Blocker & Third-Party Cookie Restrictions
- When `signInWithPopup()` is triggered from an asynchronous callback rather than a direct synchronous user click, modern browsers (Chrome, Safari, Firefox, Brave) treat it as an unprompted popup and block it (`auth/popup-blocked`).
- Brave Shields and Chrome third-party cookie restrictions block storage access to `skillify-27986.firebaseapp.com`, causing `auth/cancelled-popup-request`.

#### 2.4. Google Cloud API Key Restrictions
- In Google Cloud Console > **APIs & Services** > **Credentials**, if the API Key `AIzaSyAa2FDi-Ps4o97tyYXNfLT7E_PQKPdKwBE` has HTTP Referrer restrictions that exclude `http://localhost:*`, all authentication requests fail with `auth/api-key-not-valid` or network errors.

---

## 3. How to Fix Firebase Google Authentication (Hybrid Web & Mobile)

### Step 1: Update Code to Use Native Auth on Mobile & Web Popup on Desktop

Update `frontend/src/context/AppContext.jsx` to dynamically switch between `@capacitor-firebase/authentication` on native Android/iOS and `signInWithPopup` on web:

```javascript
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const loginWithGooglePopup = async () => {
  try {
    let user = null;

    if (Capacitor.isNativePlatform()) {
      // 📱 NATIVE ANDROID / IOS FLOW
      const result = await FirebaseAuthentication.signInWithGoogle();
      
      // If result contains an ID token, link with Web SDK auth instance:
      if (result.credential?.idToken) {
        const credential = GoogleAuthProvider.credential(result.credential.idToken);
        const userCredential = await signInWithCredential(auth, credential);
        user = userCredential.user;
      } else if (result.user) {
        user = result.user;
      }
    } else {
      // 💻 WEB / LOCALHOST BROWSER FLOW
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    }

    if (!user) throw new Error("Could not retrieve user details from Google.");

    const email = user.email || "google.user@gmail.com";
    const name = user.displayName || extractNameFromEmail(email);
    const avatar = user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Sync with local SQLite / state
    const { user: dbUser, isNew } = sqliteDB.findOrCreateOAuthUser({
      name: name,
      email: email,
      avatar: avatar,
      major: "Computer Science Major",
      college: "Tech Institute of Technology",
      auth_provider: "google"
    });

    const mergedProfile = {
      ...dbUser,
      id: user.uid,
      email: email,
      name: name,
      avatar: avatar,
      authProvider: "google",
      role: dbUser.role || (isNew ? null : 'student'),
      roleSelected: Boolean(dbUser.role_selected),
      hrProfileCompleted: Boolean(dbUser.hr_profile_completed),
      skills: dbUser.skills || []
    };

    setUserProfile(mergedProfile);
    setIsAuthenticated(true);
    localStorage.setItem('skillify_auth', 'true');
    showToast(`👋 Welcome, ${name}! Signed in via Google.`);
    routeAfterAuth(mergedProfile);
    return true;
  } catch (error) {
    console.error("Firebase Google Auth Error:", error);
    if (error.code === 'auth/popup-closed-by-user') {
      showToast("Google sign-in was cancelled.", "info");
    } else if (error.code === 'auth/popup-blocked') {
      showToast("Popup was blocked by your browser. Please allow popups.", "error");
    } else {
      showToast(error.message || "Google sign-in failed. Please try again.", "error");
    }
    return false;
  }
};
```

---

### Step 2: Configure Android App & Firebase Console

1. **Add Android App in Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/) > Project `skillify-27986` > **Project Settings** > **General**.
   - Under **Your apps**, click **Add app** > **Android**.
   - Package name: `com.skillify.ai` (as defined in `frontend/capacitor.config.json` and `frontend/android/app/build.gradle`).

2. **Generate and Add SHA-1 Fingerprint**:
   - Run the following command in terminal:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   - Copy the `SHA1` string and paste it into **SHA certificate fingerprints** in Firebase Project Settings.

3. **Download `google-services.json`**:
   - Download `google-services.json` from Firebase Console.
   - Place it into `frontend/android/app/google-services.json`.

4. **Sync Capacitor Android Project**:
   ```bash
   cd frontend
   npm run build
   npx cap sync android
   ```

---

### Step 3: Configure Localhost / Web in Firebase Console

1. Go to Firebase Console > **Authentication** > **Sign-in method**.
2. Click **Google** > ensure **Enable** is checked > select your **Project support email** > click **Save**.
3. Go to Firebase Console > **Authentication** > **Settings** > **Authorized domains**:
   - Verify `localhost` is listed.
   - If developing on a network IP or tunnel, add:
     - `127.0.0.1`
     - `profanity-manor-overeager.ngrok-free.dev`

---

## 4. Why Are There Two `firestore.rules` Files?

### The Two Locations
You currently have two `firestore.rules` files in your project:
1. `/home/alpha/skillify/firestore.rules` (Root directory)
2. `/home/alpha/skillify/frontend/firestore.rules` (Frontend subdirectory)

### Contents Comparison
Both files are **100% identical** (491 bytes, 15 lines):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read and write their own data under users/{uid}
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      
      // All nested collections: enrollments, progress, activity, certificates
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

### Why Do Both Exist?
1. **Monorepo / Subdirectory Separation**:
   - When Firebase CLI is initialized (`firebase init firestore`) in the root directory, it creates `firestore.rules` at the root.
   - When the frontend Vite app was organized inside `/frontend`, a copy of `firestore.rules` was placed or generated inside `frontend/` as well.
2. **Missing `firebase.json`**:
   - Neither the root directory nor the `frontend/` directory currently contains a `firebase.json` configuration file.
   - Without `firebase.json`, Firebase CLI does not explicitly know which `firestore.rules` path to deploy, leading to duplicate files created by manual copy/paste.

### Recommended Resolution
1. Keep the single source of truth at the project root: `/home/alpha/skillify/firestore.rules`.
2. Delete the redundant copy: `/home/alpha/skillify/frontend/firestore.rules`.
3. Add a standard root `firebase.json` so deployments are automated and unambiguous:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "hosting": {
    "public": "frontend/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## Summary Checklist

| Component | Root Cause | Solution |
| :--- | :--- | :--- |
| **Mobile (Android/Capacitor)** | WebView blocks OAuth popup; `@capacitor-firebase/authentication` unused; missing `google-services.json` & SHA-1 | Implement `Capacitor.isNativePlatform()` check with `FirebaseAuthentication.signInWithGoogle()`; add `google-services.json` & SHA-1 fingerprint |
| **Localhost (Web)** | Sign-in provider disabled; unauthorized dev domain/IP; popup blockers | Enable Google provider in Firebase console; add domains to Authorized Domains list |
| **Two `firestore.rules`** | Created in root and `frontend/` without a unifying `firebase.json` | Keep root `firestore.rules`, remove `frontend/firestore.rules`, add root `firebase.json` |
