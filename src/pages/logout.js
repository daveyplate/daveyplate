import { useEffect } from "react"
import { useRouter } from "next/router"
import { Capacitor, CapacitorCookies } from '@capacitor/core'

import { useClearCache } from "@daveyplate/supabase-swr-entities"

import { Spinner } from "@nextui-org/react"

import { createClient } from "@/utils/supabase/component"
import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from '@/utils/translation-props'
import { isExport } from "@/utils/utils"

import { localeHref } from "@/components/locale-link"
import PageTitle from "@/components/page-title"

export default ({ locale }) => {
    const supabase = createClient()
    const router = useRouter()
    const clearCache = useClearCache()

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            CapacitorCookies.clearAllCookies()
            CapacitorCookies.clearCookies()
        }

        supabase.auth.signOut(
            { scope: "local" }
        ).finally(() => {
            router.replace(localeHref("/login", locale))
            clearCache()
        })
    }, [])

    return (
        <div className="flex-center">
            <PageTitle title="" />
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps, overrideTitle: true } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined