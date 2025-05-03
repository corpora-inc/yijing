/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all source files for Tailwind classes
  ],
  theme: {
    extend: {
      // pt-[env(safe-area-inset-top)] :shrug:
      // maybe this file is not being used or sth :D
      // padding: {
      //   'safe-top': 'env(safe-area-inset-top)',
      //   'safe-bottom': 'env(safe-area-inset-bottom)',
      //   'safe-left': 'env(safe-area-inset-left)',
      //   'safe-right': 'env(safe-area-inset-right)',
      // },
    }, // Add customizations here later if needed
  },
  plugins: [], // Add plugins later if needed
}