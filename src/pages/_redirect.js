
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import languageDetector from '@/utils/language-detector'
import { getTranslationProps } from "@/utils/translation-props"

// Index redirect for static export & Capacitor
export default () => {
    const router = useRouter()
    let to = router.asPath

    // Language detection
    useEffect(() => {
        if (!to || to == "/") {
            const detectedLng = languageDetector.detect()
            to = `/${detectedLng}${to}`
        }

        router.replace(to)
    }, [])
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}