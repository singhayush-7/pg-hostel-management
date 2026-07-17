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
        // ─── SaaS Brand Colors ─────────────────────────────────────────────
        primary: {
          50:  "#eff0fe",
          100: "#e0e1fd",
          200: "#c7c9fb",
          300: "#a5a9f8",
          400: "#8185f4",
          500: "#5B5FEF", // Main Primary
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        secondary: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366F1", // Main Secondary
          600: "#4f46e5",
        },
        // ─── Surface Colors ────────────────────────────────────────────────
        surface: {
          50:  "#F8FAFC", // Background
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A", // Dark Text
        },
        // ─── Status Colors ─────────────────────────────────────────────────
        success: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          500: "#10B981",
          600: "#059669",
        },
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          500: "#F59E0B",
          600: "#d97706",
        },
        danger: {
          50:  "#fef2f2",
          100: "#fee2e2",
          500: "#EF4444",
          600: "#dc2626",
        },
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
        "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        "card": "0 2px 10px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 12px 24px rgba(0, 0, 0, 0.08)",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
