/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        'cyber-bg': '#0a192f',
        'cyber-surface': 'rgba(17, 34, 64, 0.7)',
        'cyber-cyan': '#64ffda',
        'cyber-blue': '#8892b0',
        'cyber-red': '#ff6464',
        'cyber-yellow': '#f7f7-79',
        'cyber-green': '#64ffda',
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(100, 255, 218, 0.3), 0 0 25px rgba(100, 255, 218, 0.2)',
        'glow-green': '0 0 15px rgba(100, 255, 218, 0.3), 0 0 25px rgba(100, 255, 218, 0.2)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'flicker': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.7 },
          '50%': { opacity: 1 },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'scan-line': 'scan-line 8s linear infinite',
        'flicker': 'flicker 1.5s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
    },
  },
  plugins: [],
}