import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"
import { isExport } from "@/utils/utils"
import { getEntity } from '@daveyplate/supabase-swr-entities/server'
import ArticlePage from '../article'

export default ArticlePage

export async function getStaticPaths() {
  if (isExport()) return getLocalePaths()

  return {
    paths: [],
    fallback: true
  }
}

export async function getStaticProps({ locale, params }) {
  const translationProps = await getTranslationProps({ locale, params })

  if (isExport()) return { props: { ...translationProps, canGoBack: true } }

  const { article_id } = params
  const { entity: article } = await getEntity('articles', article_id, { lang: locale })

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