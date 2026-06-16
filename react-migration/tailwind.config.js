/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          50: '#f0fcff',
          100: '#e0fbfd',
          200: '#b9f4fc',
          300: '#81e6f4',
          400: '#5ce5ed',
          500: '#3ddbdb',
          600: '#0e7490', // Основной цвет бренда (из оригинального проекта)
          700: '#115e7c',
          800: '#134a6b',
          900: '#123d57',
        },
      }
    },
  },
  plugins: [],
}
