/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        bg2: '#161b22',
        bg3: '#21262d',
        bg4: '#30363d',
        accent: '#7ee8a2',
        accent2: '#56d48e',
        accent3: '#3ab374',
        purple: '#c084fc',
        blue: '#60a5fa',
        amber: '#fbbf24',
        red: '#f87171',
        text: '#e6edf3',
        text2: '#8b949e',
        text3: '#6e7681',
        border: '#30363d',
        border2: '#21262d',
      },
      fontFamily: {
        'head': ['DM Serif Display', 'serif'],
        'body': ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        'card': '14px',
        'sm': '8px',
      }
    },
  },
  plugins: [],
}
