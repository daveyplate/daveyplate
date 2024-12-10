import i18nConfig from 'i18n.config'

/**
 * Get static paths for supported languages from i18next config.
 */
export const getLocalePaths = () => ({
  fallback: false,
  paths: i18nConfig.locales.map((locale) => ({ params: { locale } }))
})