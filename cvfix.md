# Skillify AI - CV Generator Diagnostic Report & Resolution (`cvfix.md`)

**Date:** August 29, 2026  
**Status:** Root Cause Identified & Solution Blueprint  

---

## 1. Console Log & Network Analysis

Based on the browser console network log:

```text
POST https://profanity-manor-overeager.ngrok-free.dev/api/v1/cv/generate 422 (Unprocessable Content)
```

1. **The `.env` remote connection SUCCEEDED:** The request reached the backend declared in `.env` (`https://profanity-manor-overeager.ngrok-free.dev/api/v1/cv/generate`).
2. **The Backend Rejected the Payload with HTTP 422 (Unprocessable Content):** The server's Pydantic schema validation (`schemas.py`) failed on one or more payload fields.
3. **The Fallback Cascade Caused Secondary Errors:** Because the 422 error was treated as a failure, `cvGeneratorService.js` tried all subsequent fallback endpoints (`http://localhost:5173`, `http://localhost:5001`, `http://localhost:8000`), which are not currently running locally. This produced `net::ERR_CONNECTION_REFUSED` and ended in `TypeError: Failed to fetch`.
4. **Endpoint 404 on `/domains`:** The FastAPI server exposes `/api/v1/cv/generate` and `/api/v1/cv/demo/random`, but does not define a `/domains` route.

---

## 2. Identified Problems

### 🔴 Problem 1: Payload Schema Validation Failure (`HTTP 422`)
In `artificial_intelligence/cv_generator/schemas.py`:
- **`LanguageEntryIn.level` max length is 20 characters:**
  ```python
  class LanguageEntryIn(BaseModel):
      name: str = Field(min_length=1, max_length=40)
      level: str = Field(default="", max_length=20)  # <-- MAX 20 CHARS
  ```
  In `cvGeneratorService.js`:
  ```javascript
  const languages = [
    { name: 'English', level: 'Fluent / Professional' }, // <-- 21 CHARACTERS (FAILS VALIDATION)
    { name: 'Hindi', level: 'Native / Bilingual' }
  ];
  ```
  `"Fluent / Professional".length` is **21 characters**, which violates `max_length=20` and immediately triggers `HTTP 422 Unprocessable Content`.

- **Avatar / `photo_base64` MIME Sniffing:**
  `schemas.py` only accepts `image/png`, `image/jpeg`, and `image/webp`. If a user avatar is SVG (`data:image/svg+xml`) or an invalid data URL, it fails validation with 422.

---

### 🔴 Problem 2: Discovery Probe Uses Non-Existent Route (`/domains` $\rightarrow$ `404`)
- `resolveActiveBase()` in `cvGeneratorService.js` attempts to probe `${base}/domains`.
- The FastAPI standalone server does not have a `/domains` route (it has `/health`, `/api/v1/cv/generate`, and `/api/v1/cv/demo/random`).
- As a result, candidate discovery fails on `/domains` and defaults to fallback URLs.

---

### 🔴 Problem 3: Multi-Tier Loop Fails Over on 4xx Validation Errors
- When the backend responds with a client validation error (`422 Unprocessable Content`), the service should stop immediately and surface the validation error message.
- Instead, the loop ignored the 422 and attempted local offline endpoints (`5001`, `8000`), masking the real validation issue with `ERR_CONNECTION_REFUSED` / `Failed to fetch`.

---

## 3. Concrete Solution

### ✅ Fix 1: Correct Payload Fields in `cvGeneratorService.js`
1. Shorten language levels to be $\le 20$ characters:
   ```javascript
   const languages = [
     { name: 'English', level: 'Professional' },  // 12 chars (<= 20)
     { name: 'Hindi', level: 'Native' }            // 6 chars (<= 20)
   ];
   ```
2. Sanitize `photo_base64` so that non-PNG/JPEG/WebP images (e.g. SVG avatars) are sent as `null` instead of invalid base64 payloads:
   ```javascript
   photo_base64: (userProfile.avatar?.startsWith('data:image/png') ||
                  userProfile.avatar?.startsWith('data:image/jpeg') ||
                  userProfile.avatar?.startsWith('data:image/webp'))
                 ? userProfile.avatar : null,
   ```

---

### ✅ Fix 2: Update Endpoint Probing in `cvGeneratorService.js`
Change the health/probe endpoint from `${base}/domains` to probe `/health` or directly use the normalized `.env` base:
```javascript
// Probe /health on the root API host or direct generate target
const res = await fetch(`${base.replace(/\/api.*$/, '')}/health`, {
  signal: controller.signal,
  headers: { 'ngrok-skip-browser-warning': 'true' }
});
```

---

### ✅ Fix 3: Halt Failover on 4xx Validation Errors
In `generateCV()`, if `res.status === 422` or `res.status === 400`, throw immediately so the developer and user can see the exact validation error from the server instead of continuing to dead local ports:
```javascript
if (!res.ok) {
  let errDetail = 'Failed to generate CV';
  try {
    const errJson = await res.json();
    errDetail = errJson.detail || errJson.error || errDetail;
  } catch (e) {
    errDetail = `Server returned status ${res.status}: ${res.statusText}`;
  }
  // Do NOT fail over to dead local ports if the server explicitly rejected the payload with 4xx
  if (res.status >= 400 && res.status < 500) {
    throw new Error(`Validation Error (${res.status}): ${typeof errDetail === 'object' ? JSON.stringify(errDetail) : errDetail}`);
  }
  lastError = new Error(errDetail);
  continue;
}
```
