import { useEffect } from "react"
import { Capacitor, CapacitorCookies } from '@capacitor/core'

import { useClearCache } from "@daveyplate/supabase-swr-entities/client"
import { PageTitle } from "@daveyplate/next-page-title"

import { Spinner } from "@nextui-org/react"

import { useLocaleRouter } from "@/i18n/routing"
import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"
import { createClient } from "@/utils/supabase/component"

export default () => {
    const supabase = createClient()
    const localeRouter = useLocaleRouter()
    const clearCache = useClearCache()

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            CapacitorCookies.clearAllCookies()
            CapacitorCookies.clearCookies()
        }

        setTimeout(() => {
            supabase.auth.signOut({ scope: "local" })
                .finally(() => {
                    localeRouter.replace("/login")
                    clearCache()
                })
        }, 0)
    }, [])

    return (
        <div className="flex-center">
            <PageTitle title="" />

            <Spinner color="current" />
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined