import { getEntity } from "@daveyplate/supabase-swr-entities/server"

import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"
import { isExport } from "@/utils/utils"
import UserPage from "../user"
import { GetStaticPropsContext } from "next"

export default UserPage

export async function getStaticPaths() {
    if (isExport()) return getLocalePaths()

    return {
        paths: [],
        fallback: true
    }
}

export async function getStaticProps({ locale, params }: GetStaticPropsContext) {
    const translationProps = await getTranslationProps({ locale, params })

    if (isExport()) return { props: { ...translationProps, canGoBack: true } }

    const { user_id } = params!
    const { entity: user } = await getEntity('profiles', user_id as string, { lang: locale })

    return {
        props: {
            ...translationProps,
            user_id,
            user: user || null,
            canGoBack: true
        },
        revalidate: 60
    }
}
