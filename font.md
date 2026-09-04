# Skillify AI Typography & Text Styling Report 🎨

This report details where and how all text styling, font families, typography tokens, and font loading mechanisms are defined throughout the Skillify AI codebase.

---

## 📍 1. Primary Entry Points for Font Configuration

| File | Purpose | Key Details |
|---|---|---|
| [`frontend/index.html`](file:///home/alpha/skillify/frontend/index.html) | **HTML Font Preloading & CDN Imports** | Loads Google Fonts (`Sora`, `Hanken Grotesk`, `Geist`, `Material Symbols`) and preloads local `ndot55.woff2` and `rosemary.woff`. |
| [`frontend/src/index.css`](file:///home/alpha/skillify/frontend/src/index.css) | **Global CSS, `@font-face` & Baseline Typography** | Registers `@font-face` for `Ndot 55` & `Rosemary`, sets default `body` font stack, font weight/volume, and headline overrides. |
| [`frontend/tailwind.config.js`](file:///home/alpha/skillify/frontend/tailwind.config.js) | **Tailwind Font Families & Scale Tokens** | Maps semantic utility classes (`font-sans`, `font-headline`, `font-mono`, `text-headline-lg`, etc.). |
| [`frontend/public/fonts/`](file:///home/alpha/skillify/frontend/public/fonts/) | **Local Static Font Assets** | Houses `ndot55.woff2` (headliners) and `rosemary.woff` (body & small text). |

---

## 🔤 2. Active Font Families & Stacks

### A. Body & Default UI Text (`Rosemary`)
- **Configured In**: [`frontend/tailwind.config.js:L85`](file:///home/alpha/skillify/frontend/tailwind.config.js#L85), [`frontend/src/index.css:L168-L202`](file:///home/alpha/skillify/frontend/src/index.css#L168-L202)
- **Primary Stack**:
  ```css
  font-family: 'Rosemary', 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  ```
- **Used by**: Standard paragraphs, inputs, navigation, cards, `.font-mono`, and default Tailwind `font-sans` classes.

### B. Nothing OS Dot-Matrix Headlines (`Ndot 55`)
- **Configured In**: [`frontend/src/index.css:L1-L19`](file:///home/alpha/skillify/frontend/src/index.css#L1-L19), [`frontend/tailwind.config.js:L86-L90`](file:///home/alpha/skillify/frontend/tailwind.config.js#L86-L90)
- **Primary Stack**:
  ```css
  font-family: 'Ndot 55', 'NDOT 55', 'Plus Jakarta Sans', Inter, sans-serif;
  ```
- **Used by**: `.font-headline`, `.font-headline-xl`, `.font-headline-lg`, `.font-headline-md` on prominent screen headers, XP trackers, badge titles, and stat callouts.

### C. Sora (Modern Tech Display & Brand Headings)
- **Imported In**: [`frontend/index.html:L21`](file:///home/alpha/skillify/frontend/index.html#L21) (`family=Sora:wght@400;600;700;800`)
- **Used by**: Chat assistant headers, notification screen brand titles, candidate names in HR screens (`style={{ fontFamily: 'Sora, sans-serif' }}`).

### D. Hanken Grotesk (Editorial & Secondary Body)
- **Imported In**: [`frontend/index.html:L21`](file:///home/alpha/skillify/frontend/index.html#L21) (`family=Hanken+Grotesk:ital,wght@0,300..700`)
- **Used by**: Subtitles, notification message previews, candidate bio text, and conversational message bubbles.

### E. Geist & JetBrains Mono (Monospace & Technical Data)
- **Configured In**: [`frontend/tailwind.config.js:L95`](file:///home/alpha/skillify/frontend/tailwind.config.js#L95), [`frontend/index.html:L21`](file:///home/alpha/skillify/frontend/index.html#L21)
- **Primary Stack**:
  ```css
  font-family: 'Rosemary', 'JetBrains Mono', 'Geist', monospace;
  ```

---

## 📐 3. Typography Scale & Design Tokens

Defined in [`frontend/tailwind.config.js:L97-L115`](file:///home/alpha/skillify/frontend/tailwind.config.js#L97-L115):

```javascript
fontSize: {
  "2xs": ["0.75rem", { lineHeight: "1.05rem" }],
  "xs":  ["0.84rem", { lineHeight: "1.25rem", letterSpacing: "0.01em" }],
  "sm":  ["0.92rem", { lineHeight: "1.35rem", letterSpacing: "0.005em" }],
  "base":["1.05rem", { lineHeight: "1.55rem" }],
  "lg":  ["1.18rem", { lineHeight: "1.65rem" }],
  "xl":  ["1.32rem", { lineHeight: "1.8rem" }],
  "2xl": ["1.55rem", { lineHeight: "2.05rem" }],
  "3xl": ["1.9rem", { lineHeight: "2.3rem" }],
  "4xl": ["2.35rem", { lineHeight: "2.7rem" }],

  // Semantic Typography Roles
  "headline-xl":        ["44px", { lineHeight: "52px", letterSpacing: "-0.02em", fontWeight: "800" }],
  "headline-lg":        ["30px", { lineHeight: "36px", letterSpacing: "-0.015em", fontWeight: "700" }],
  "headline-lg-mobile": ["26px", { lineHeight: "32px", fontWeight: "700" }],
  "headline-md":        ["22px", { lineHeight: "28px", fontWeight: "600" }],
  "body-lg":            ["18px", { lineHeight: "26px", fontWeight: "400" }],
  "body-md":            ["16px", { lineHeight: "24px", fontWeight: "400" }],
  "label-md":           ["14.5px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "500" }],
  "label-sm":           ["13px", { lineHeight: "18px", letterSpacing: "0.02em", fontWeight: "600" }]
}
```

---

## 🎛️ 4. How to Adjust Font Boldness & Volume

You can fine-tune font boldness and thickness directly in [`frontend/src/index.css`](file:///home/alpha/skillify/frontend/src/index.css#L168-L202):

### Locations in `frontend/src/index.css`:
```css
/* In body rule (around line 168) */
body {
  font-family: 'Rosemary', ...;
  font-size: 1.02rem;
  font-weight: 550;                      /* <-- Adjust weight here: 500 (lighter), 600 (bolder), 700 (boldest) */
  -webkit-text-stroke: 0.18px currentColor; /* <-- Adjust stroke volume: 0.10px (subtle) to 0.35px (extra thick) */
}

/* In UI & Mono class rule (around line 194) */
.font-mono,
.font-sans,
.font-body-lg,
.font-body-md,
.font-label-md,
.font-label-sm {
  font-family: 'Rosemary', ... !important;
  font-weight: 550;                      /* <-- Adjust weight here */
  -webkit-text-stroke: 0.18px currentColor; /* <-- Adjust stroke volume here */
}
```

- **To make it even bolder**: Increase `font-weight: 600;` and `-webkit-text-stroke: 0.28px currentColor;`.
- **To make it thinner/lighter**: Change `font-weight: 400;` and remove `-webkit-text-stroke;`.
