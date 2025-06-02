/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust based on your project structure
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb', // Define a custom border color (e.g., Tailwind's gray-200)
        background: '#ffffff', // Define a custom background color (e.g., white)
        foreground: '#1f2937', // Define a custom text color (e.g., Tailwind's gray-800)
      },
    },
  },
  plugins: [],
};