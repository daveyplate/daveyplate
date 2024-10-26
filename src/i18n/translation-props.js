import i18nConfig from 'i18n.config'

import enMessages from 'messages/en.json'
import deMessages from 'messages/de.json'

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

    switch (locale) {
        case 'en':
            return { messages: enMessages, locale }
        case 'de':
            return { messages: deMessages, locale }
    }

    return {
        messages: {},
        locale
    }
}