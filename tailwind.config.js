/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1120",
        surface: "#1E293B",
        border: "#334155",
        text: "#F8FAFC",
        textMuted: "#94A3B8",
        risk: {
          high: "#EF4444",
          medium: "#F97316",
          safe: "#10B981",
        },
        severity: {
          info: "#3B82F6",
          low: "#10B981",
          medium: "#EAB308",
          high: "#F97316",
          critical: "#EF4444",
        },
      },
    },
  },
  plugins: [],
}
