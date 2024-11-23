import { useEffect } from "react"
import { useSessionContext } from "@supabase/auth-helpers-react"
import { usePathname, useLocaleRouter } from "@/i18n/routing"

/**
 * Custom hook to ensure that the user is authenticated.
 * Redirects unauthenticated users to the login page, with an optional return path to bring them back after login.
 * 
 * @param {Object} options - Options object for configuring the hook.
 * @param {string} options.locale - The locale to be used for the redirect path.
 * @returns {import("@supabase/auth-helpers-react").SessionContext} An object containing the session and isLoading state.
 */
const useAuthenticatedPage = () => {
    const { session, isLoading, error, supabaseClient } = useSessionContext()
    const localeRouter = useLocaleRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!isLoading && !session) {
            localeRouter.replace(`/login?returnTo=${pathname}`)
        }
    }, [session, isLoading])

    return { session, isLoading, error, supabaseClient }
}

export default useAuthenticatedPage