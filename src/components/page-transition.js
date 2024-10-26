import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { isSafari } from 'react-device-detect'

const PageTransition = ({ children }) => {
    const router = useRouter()
    const [direction, setDirection] = useState('forward')
    const [currentKeyIndex, setCurrentKeyIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [disableAnimation, setDisableAnimation] = useState(false)
    const windowHistoryKeys = useRef([])

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(max-width: 640px)").matches)
        }

        checkMobile()

        const mediaQuery = window.matchMedia("(max-width: 640px)")
        mediaQuery.addEventListener('change', checkMobile)

        return () => mediaQuery.removeEventListener('change', checkMobile)
    }, [])


    const onRouteChange = () => {
        const keyIndex = windowHistoryKeys.current.indexOf(window.history.state.key)

        // If we are already on this key, don't do anything
        if (keyIndex == currentKeyIndex) return

        // Add this key if it doesn't exist
        if (keyIndex == -1) {
            windowHistoryKeys.current = windowHistoryKeys.current.slice(0, currentKeyIndex + 1)
            windowHistoryKeys.current.push(window.history.state.key)
            setCurrentKeyIndex(windowHistoryKeys.current.length - 1)
            setDirection('forward')
        } else {
            // Determine the direction
            if (keyIndex < currentKeyIndex) {
                setDirection('backward')
            } else {
                setDirection('forward')
            }

            setCurrentKeyIndex(keyIndex)
        }
    }

    useEffect(() => {
        // Override pushState and replaceState
        const originalPushState = history.pushState
        const originalReplaceState = history.replaceState

        if (windowHistoryKeys.current.length == 0) {
            onRouteChange()
        }
        const onRouteChangeComplete = () => {
            setDisableAnimation(false)
        }

        router.events.on('routeChangeComplete', onRouteChangeComplete)

        history.pushState = function () {
            originalPushState.apply(this, arguments)
            onRouteChange()
        }

        history.replaceState = function () {
            originalReplaceState.apply(this, arguments)
            onRouteChange()
        }

        router.beforePopState(() => {
            if (isSafari && !global.backPressed) {
                setDisableAnimation(true)
            }

            global.backPressed = false
            onRouteChange()

            return true
        })

        // Cleanup function
        return () => {
            history.pushState = originalPushState
            history.replaceState = originalReplaceState
            router.events.off('routeChangeComplete', onRouteChangeComplete)
        }
    }, [currentKeyIndex, router])

    return (
        <AnimatePresence initial={false}>
            <motion.div
                key={router.asPath}
                className="absolute w-svw h-svh bg-background"
                initial={{
                    x: direction === 'forward' ? '100%' : '-25%',
                    opacity: isMobile ? 1 : 0
                }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                    x: direction === 'forward' ? '-10%' : '100%',
                    zIndex: direction === 'forward' ? 0 : 1,
                    opacity: isMobile ? 1 : 0,
                }}
                transition={{ ease: 'easeInOut', duration: (disableAnimation || !isMobile) ? 0 : 0.2 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default PageTransition