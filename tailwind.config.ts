import { nextui } from "@nextui-org/react"
import type { Config } from "tailwindcss"

export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@daveyplate/supabase-auth-nextui/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@daveyplate/nextui-crop-image-modal/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "tall": { "raw": "(min-height: 800px)" },
      },
      keyframes: {
        "scrolling-banner": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)/2))" },
        },
        "scrolling-banner-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-50% - var(--gap)/2))" },
        },
      },
      animation: {
        "scrolling-banner": "scrolling-banner var(--duration) linear infinite",
        "scrolling-banner-vertical": "scrolling-banner-vertical var(--duration) linear infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: "#000000"
          }
        }
      }
    }),
    require("tailwindcss-animate"),
    require("tailwindcss-safe-area"),
  ],
} satisfies Config