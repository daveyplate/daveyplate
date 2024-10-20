import i18nextConfig from '@/../next-i18next.config'

/**
 * @typedef {Object} TranslationProps
 * @property {Object} messages - The translation messages for the locale.
 * @property {string} locale - The current locale.
 * @property {Array} locales - The array of all available locale strings.
 */

/**
 * Fetch and return translation properties for a given locale.
 * @param {Object} context - The context object with parameters and query.
 * @param {string} context.locale - The locale to fetch translations for.
 * @param {Array} context.locales - The array of all available locale strings.
 * @returns {Promise<TranslationProps>} An object containing the messages, locale, and locales.
 */
export const getTranslationProps = async ({ locale = i18nextConfig.i18n.defaultLocale, locales = i18nextConfig.i18n.locales, ...context }) => {
    locale = context.params?.locale || context.query?.locale || locale

    let messages = {}
    try { messages = (await import(`messages/${locale}.json`)).default } catch { }

    return {
        messages,
        locale,
        locales
    }
}