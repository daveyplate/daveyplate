
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import languageDetector from '@/i18n/language-detector'

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