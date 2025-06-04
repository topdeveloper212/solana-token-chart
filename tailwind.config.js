/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#1a1b1e',
          secondary: '#2c2d31',
          accent: '#3b82f6',
          text: '#e2e8f0',
          'text-secondary': '#94a3b8',
        }
      }
    },
  },
  plugins: [],
} 