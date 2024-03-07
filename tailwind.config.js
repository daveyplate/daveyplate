// tailwind.config.js
const { nextui } = require("@nextui-org/react")

/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "2xl": "1400px",
        '3xl': '1600px',
        "xs": "475px",
        "tall": { "raw": "(min-height: 800px)" },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui(),
    require("tailwindcss-animate"),
    require('tailwindcss-safe-area'),
    require('autoprefixer'),
  ],
}