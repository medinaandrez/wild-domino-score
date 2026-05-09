/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        spinner: {
          primary: "#f59e0b",
          dark: "#1e293b",
          surface: "#0f172a",
          card: "#1e293b",
          cardLight: "#334155",
          accent: "#06b6d4",
          win: "#22c55e",
          danger: "#ef4444",
        },
      },
    },
  },
};
