import { useEffect, useState } from "react"
import { useTheme } from 'next-themes'

// TODO load from theme config file??? IDK
const lightBackground = '#FFFFFF'
const darkBackground = '#000000'

export default function MetaTheme() {
    const { resolvedTheme, theme, systemTheme } = useTheme()
    const [initialized, setInitialized] = useState(false)

    const updateTheme = () => {
        if (!initialized) {
            setInitialized(true)
            return
        }

        const metaThemeColor = resolvedTheme == 'light' ? lightBackground : darkBackground
        const themeColorMetaTag = document.querySelector('meta[name="theme-color"]')

        themeColorMetaTag?.setAttribute('content', metaThemeColor)
    }

    useEffect(() => {
        updateTheme()
    }, [theme, resolvedTheme, systemTheme])
}

export const ThemeScript = () => {
    const script = `
        (function() {
            const lightBackground = '${lightBackground}';
            const darkBackground = '${darkBackground}';
            let themeColor = darkBackground; // Default to dark theme if no preference is set

            // Assuming you store the user's theme preference in localStorage under the key 'theme'
            const userPreference = localStorage.getItem('theme');

            if (userPreference === 'light') {
                themeColor = lightBackground;
            } else if (userPreference == 'dark') {
                themeColor = darkBackground;
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                // If no user preference is set, fall back to system preference
                themeColor = lightBackground;
            }

            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = themeColor;
            document.head.appendChild(meta);
        })();
    `

    return <script dangerouslySetInnerHTML={{ __html: script }} />
}