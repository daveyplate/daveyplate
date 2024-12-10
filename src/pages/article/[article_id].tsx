import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"
import { isExport } from "@/utils/utils"
import { getEntity } from '@daveyplate/supabase-swr-entities/server'
import ArticlePage from '../article'
import { GetStaticProps } from "next"

export default ArticlePage

export async function getStaticPaths() {
    if (isExport()) return getLocalePaths()

    return {
        paths: [],
        fallback: true
    }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
    const translationProps = await getTranslationProps({ locale, params })

    if (isExport()) return { props: { ...translationProps, canGoBack: true } }

    const { article_id } = params!
    const { entity: article } = await getEntity('articles', article_id as string, { lang: locale })

    return {
        props: {
            ...translationProps,
            article_id,
            article,
            canGoBack: true
        },
        revalidate: 60
    }
}