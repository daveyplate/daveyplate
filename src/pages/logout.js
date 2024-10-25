import { useEffect } from "react"
import { Capacitor, CapacitorCookies } from '@capacitor/core'

import { useClearCache } from "@daveyplate/supabase-swr-entities/client"

import { Spinner } from "@nextui-org/react"

import { useRouter as useLocaleRouter } from "@/i18n/routing"

import { createClient } from "@/utils/supabase/component"
import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from '@/utils/translation-props'
import { isExport } from "@/utils/utils"

import PageTitle from "@/components/page-title"

export default () => {
    const supabase = createClient()
    const localeRouter = useLocaleRouter()
    const clearCache = useClearCache()

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            CapacitorCookies.clearAllCookies()
            CapacitorCookies.clearCookies()
        }

        supabase.auth.signOut(
            { scope: "local" }
        ).finally(() => {
            localeRouter.replace("/login")
            clearCache()
        })
    }, [])

    return (
        <div className="flex-center">
            <PageTitle title="" />

            <Spinner color="current" />
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps, overrideTitle: true } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined