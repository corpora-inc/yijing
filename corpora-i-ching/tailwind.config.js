/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure all source files are scanned
  ],
  safelist: [
    'text-zh',
    'text-zh-hexagram',
  ],
  theme: {
    extend: {
      fontSize: {
        zh: '3rem', // 48px for most Chinese text (for testing, as you set)
        'zh-hexagram': '3.5rem', // 56px for hexagram names (slight increase)
      },
    },
  },
  plugins: [],
};