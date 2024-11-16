import i18nConfig from 'i18n.config'
import { GetStaticPathsResult } from 'next'

/**
 * Get static paths for supported languages from i18next config.
 * @returns {GetStaticPathsResult} The static paths for supported languages.
 */
export const getLocalePaths = () => ({
  fallback: false,
  paths: i18nConfig.i18n.locales.map((locale) => ({ params: { locale } }))
})