/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "rgb(var(--color-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--color-primary-container) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        "on-primary-container": "rgb(var(--color-on-primary-container) / <alpha-value>)",
        "primary-fixed": "rgb(var(--color-primary-fixed) / <alpha-value>)",
        "primary-fixed-dim": "rgb(var(--color-primary-fixed-dim) / <alpha-value>)",
        "on-primary-fixed": "rgb(var(--color-on-primary-fixed) / <alpha-value>)",
        "on-primary-fixed-variant": "rgb(var(--color-on-primary-fixed-variant) / <alpha-value>)",
        "inverse-primary": "rgb(var(--color-inverse-primary) / <alpha-value>)",
        
        "surface": "rgb(var(--color-surface) / <alpha-value>)",
        "surface-dim": "rgb(var(--color-surface-dim) / <alpha-value>)",
        "surface-bright": "rgb(var(--color-surface-bright) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
        "surface-container-low": "rgb(var(--color-surface-container-low) / <alpha-value>)",
        "surface-container": "rgb(var(--color-surface-container) / <alpha-value>)",
        "surface-container-high": "rgb(var(--color-surface-container-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--color-surface-container-highest) / <alpha-value>)",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        "inverse-surface": "rgb(var(--color-inverse-surface) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--color-inverse-on-surface) / <alpha-value>)",
        "surface-tint": "rgb(var(--color-surface-tint) / <alpha-value>)",
        
        "secondary": "rgb(var(--color-secondary) / <alpha-value>)",
        "secondary-container": "rgb(var(--color-secondary-container) / <alpha-value>)",
        "on-secondary": "rgb(var(--color-on-secondary) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--color-on-secondary-container) / <alpha-value>)",
        "secondary-fixed": "rgb(var(--color-secondary-fixed) / <alpha-value>)",
        "secondary-fixed-dim": "rgb(var(--color-secondary-fixed-dim) / <alpha-value>)",
        "on-secondary-fixed": "rgb(var(--color-on-secondary-fixed) / <alpha-value>)",
        "on-secondary-fixed-variant": "rgb(var(--color-on-secondary-fixed-variant) / <alpha-value>)",

        "tertiary": "#323435",
        "tertiary-container": "#494b4b",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#babbbb",
        "tertiary-fixed": "#e2e2e2",
        "tertiary-fixed-dim": "#c6c6c7",
        "on-tertiary-fixed": "#1a1c1c",
        "on-tertiary-fixed-variant": "#454747",

        "outline": "rgb(var(--color-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--color-outline-variant) / <alpha-value>)",
        "background": "rgb(var(--color-background) / <alpha-value>)",
        "on-background": "rgb(var(--color-on-background) / <alpha-value>)",

        "error": "rgb(var(--color-error) / <alpha-value>)",
        "error-container": "rgb(var(--color-error-container) / <alpha-value>)",
        "on-error": "rgb(var(--color-on-error) / <alpha-value>)",
        "on-error-container": "rgb(var(--color-on-error-container) / <alpha-value>)",

        "cherry-cola": "#960018",
        "cream-vanilla": "#faf8f6"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "base": "8px",
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        "gutter": "24px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "32px",
        "container-max": "1280px"
      },
      fontFamily: {
        "sans": ["Hanken Grotesk", "sans-serif"],
        "headline": ["'Ndot 55'", "sans-serif"],
        "headline-xl": ["'Ndot 55'", "sans-serif"],
        "headline-lg": ["'Ndot 55'", "sans-serif"],
        "headline-lg-mobile": ["'Ndot 55'", "sans-serif"],
        "headline-md": ["'Ndot 55'", "sans-serif"],
        "body-lg": ["Hanken Grotesk", "sans-serif"],
        "body-md": ["Hanken Grotesk", "sans-serif"],
        "label-md": ["Geist", "sans-serif"],
        "label-sm": ["Geist", "sans-serif"],
        "mono": ["Geist", "monospace"]
      },
      fontSize: {
        "headline-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }]
      },
      boxShadow: {
        "card": "0 4px 14px 0 rgba(0, 0, 0, 0.04)",
        "card-hover": "0 12px 28px 0 rgba(150, 0, 24, 0.18)",
        "modal": "0 16px 36px 0 rgba(0, 0, 0, 0.28)",
        "breathe": "0 0 25px rgba(150, 0, 24, 0.35)",
        "glow": "0 4px 18px 0 rgba(150, 0, 24, 0.40)"
      }
    },
  },
  plugins: [],
}
