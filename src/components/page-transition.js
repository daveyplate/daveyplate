import { useIsClient } from '@uidotdev/usehooks'
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
    const isClient = useIsClient()

    useEffect(() => {
        // Function to check if the screen matches the mobile breakpoint
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(max-width: 640px)").matches)
        }

        // Check initially
        checkMobile()

        // Create a MediaQueryList object
        const mediaQuery = window.matchMedia("(max-width: 640px)")

        // Add an event listener for when the breakpoint changes
        mediaQuery.addEventListener('change', checkMobile)

        // Cleanup function to remove the listener
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

        const onPopstate = () => {
            if (isSafari) {
                console.log("disableAnimation")
                setDisableAnimation(true)
            }

            onRouteChange()
        }

        const onRouteChangeComplete = () => {

            console.log("enableAnimation")
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

        // Listen for popstate event
        window.addEventListener('popstate', onPopstate)

        // Cleanup function
        return () => {
            history.pushState = originalPushState
            history.replaceState = originalReplaceState
            window.removeEventListener('popstate', onPopstate)
            router.events.off('routeChangeComplete', onRouteChangeComplete)
        }
    }, [currentKeyIndex])

    if (!disableAnimation) {
        return (
            <AnimatePresence initial={false}>
                <motion.div
                    key={router.asPath}
                    className="absolute w-svw h-svh bg-background"
                    initial={!disableAnimation && {
                        x: direction === 'forward' ? '100%' : '-25%',
                        opacity: isMobile ? 1 : 0
                    }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={!disableAnimation && {
                        x: direction === 'forward' ? '-10%' : '100%',
                        zIndex: direction === 'forward' ? 0 : 1,
                        opacity: isMobile ? 1 : 0
                    }}
                    transition={{ ease: 'easeInOut', duration: 0.3 }}

                >
                    {children}
                </motion.div>
            </AnimatePresence>
        )
    }

    return children
}

export default PageTransition