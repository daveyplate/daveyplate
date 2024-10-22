import Head from "next/head"
import { useTheme } from "next-themes"

const lightBackground = '#FFFFFF'
const darkBackground = '#000000'

export default function MetaTheme() {
    const { resolvedTheme } = useTheme()

    return (
        <Head>
            <meta
                name="theme-color"
                content={resolvedTheme == 'dark' ? darkBackground : lightBackground}
            />
        </Head>
    )
}