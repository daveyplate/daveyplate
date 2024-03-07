import { createClient } from "@/utils/supabase/component"
import { useRouter } from "next/router"
import { useEffect } from "react"

import { getStaticPaths as getExportStaticPaths } from "@/lib/get-static"
import { getTranslationProps } from '@/lib/translation-props'
import { isExport } from "@/utils/utils"

import { localeHref } from "@/components/locale-link"
import { Capacitor, CapacitorCookies } from '@capacitor/core'
import PageTitle from "@/components/page-title"

export default ({ locale }) => {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            CapacitorCookies.clearAllCookies()
            CapacitorCookies.clearCookies()
        }

        supabase.auth.signOut().finally(() =>
            router.replace(localeHref("/login", locale))
        )
    }, [])

    return (
        <PageTitle title="" />
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps, overrideTitle: true } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined