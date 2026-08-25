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
        "sans": ["'Plus Jakarta Sans'", "Inter", "system-ui", "-apple-system", "sans-serif"],
        "headline": ["'Ndot 55'", "'NDOT 55'", "'Plus Jakarta Sans'", "Inter", "sans-serif"],
        "headline-xl": ["'Ndot 55'", "'NDOT 55'", "'Plus Jakarta Sans'", "Inter", "sans-serif"],
        "headline-lg": ["'Ndot 55'", "'NDOT 55'", "'Plus Jakarta Sans'", "Inter", "sans-serif"],
        "headline-lg-mobile": ["'Ndot 55'", "'NDOT 55'", "'Plus Jakarta Sans'", "Inter", "sans-serif"],
        "headline-md": ["'Ndot 55'", "'NDOT 55'", "'Plus Jakarta Sans'", "Inter", "sans-serif"],
        "body-lg": ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        "body-md": ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        "label-md": ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        "label-sm": ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        "mono": ["'JetBrains Mono'", "Geist", "monospace"]
      },
      fontSize: {
        "2xs": ["0.7rem", { lineHeight: "0.95rem" }],
        "xs": ["0.78rem", { lineHeight: "1.15rem", letterSpacing: "0.01em" }],
        "sm": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.005em" }],
        "base": ["0.98rem", { lineHeight: "1.45rem" }],
        "lg": ["1.125rem", { lineHeight: "1.6rem" }],
        "xl": ["1.28rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "1.95rem" }],
        "3xl": ["1.85rem", { lineHeight: "2.2rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.6rem" }],
        "headline-xl": ["44px", { lineHeight: "52px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["30px", { lineHeight: "36px", letterSpacing: "-0.015em", fontWeight: "700" }],
        "headline-lg-mobile": ["26px", { lineHeight: "32px", fontWeight: "700" }],
        "headline-md": ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "25px", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "label-md": ["13.5px", { lineHeight: "18px", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }]
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
