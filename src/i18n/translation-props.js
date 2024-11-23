import i18nConfig from 'i18n.config'

/**
 * @typedef {Object} TranslationProps
 * @property {Object} messages - The translation messages for the locale.
 * @property {string} locale - The current locale.
 */

/**
 * Fetch and return translation properties for a given locale.
 * @param {Object} context - The context object with locale and/or params.
 * @param {string} [context.locale] - The locale to fetch translations for.
 * @param {Object} [context.params] - Params object from getStaticProps.
 * @returns {Promise<TranslationProps>} An object containing the messages, locale, and locales.
 */
export const getTranslationProps = async ({ locale, params }) => {
  locale = params?.locale || locale || i18nConfig.i18n.defaultLocale

  let messages = {}
  try { messages = (await import(`messages/${locale}.json`)).default } catch { }

  return {
    messages,
    locale
  }
}