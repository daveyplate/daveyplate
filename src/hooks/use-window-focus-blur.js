import { useEffect } from 'react'

// Prevent the auto focus behaviour when the window is focused (blue outline fix)
const useWindowFocusBlur = () => {
    useEffect(() => {
        const handleFocus = () => {
            document.activeElement.blur()
        }

        window.addEventListener('focus', handleFocus)

        return () => window.removeEventListener('focus', handleFocus)
    }, [])
}

export default useWindowFocusBlur
