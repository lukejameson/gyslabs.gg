/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './blog/index.html',
    './blog/posts/**/*.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
