import i18nConfig from 'i18n.config'

/**
 * Get static paths for supported languages from i18next config.
 * @returns {import("next").GetStaticPathsResult} The static paths for supported languages.
 */
export const getLocalePaths = () => ({
  fallback: false,
  paths: i18nConfig.locales.map((locale) => ({ params: { locale } }))
})