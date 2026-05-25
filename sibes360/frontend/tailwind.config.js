/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sibesNavy: '#1a1f36',
        sibesBg: '#f4f6fb',
        sibesCard: '#ffffff',
        sibesPrimary: '#6c63ff',
        sibesDanger: '#ff6584',
        sibesSuccess: '#2dce89',
        sibesWarning: '#ffb236',
        sibesTextPrimary: '#1a1f36',
        sibesTextSecondary: '#8898aa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
