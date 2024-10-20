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
        "tall": { "raw": "(min-height: 800px)" },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: '#000000'
          }
        }
      }
    }),
    require("tailwindcss-animate"),
    require('tailwindcss-safe-area'),
    require('autoprefixer'),
  ],
}