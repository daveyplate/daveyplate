import i18nextConfig from 'next-i18next.config'

/**
 * Get an array of paths for each supported language.
 * @returns {Array} Array of paths for each supported language.
 */
export const getI18nPaths = () =>
  i18nextConfig.i18n.locales.map((locale) => ({
    params: { locale }
  }))

/**
 * @typedef StaticPaths
 * @property {boolean} fallback - Whether to enable fallback for this path.
 * @property {Array} paths - Array of paths for each supported language.
 */

/**
 * Get static paths for languages.
 * @returns {StaticPaths} Object containing fallback status and paths for languages.
 */
export const getStaticPaths = () => ({
  fallback: false,
  paths: getI18nPaths()
})