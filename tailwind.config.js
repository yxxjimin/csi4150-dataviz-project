/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: 'Avenir'
      },
      colors: {
        'dark-bg': '#1a1a1a',
        'dark-text': '#d5d5d5',
        'dark-mist': '#282828',
      }
    },
  },
  plugins: [],
}

