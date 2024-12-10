import { useLocaleRouter, usePathname } from "@/i18n/routing"
import { SessionContext, useSessionContext } from "@supabase/auth-helpers-react"
import { useEffect } from "react"

const useAuthenticatedPage = (): SessionContext => {
    const sessionContext = useSessionContext()
    const { session, isLoading } = sessionContext
    const localeRouter = useLocaleRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!isLoading && !session) {
            localeRouter.replace(`/login?returnTo=${pathname}`)
        }
    }, [session, isLoading])

    return sessionContext
}

export default useAuthenticatedPage