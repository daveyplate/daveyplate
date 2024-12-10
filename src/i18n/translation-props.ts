import i18nConfig from 'i18n.config'
import { GetStaticPropsContext } from 'next'

/**
 * Fetch and return translation properties for a given locale.
 */
export const getTranslationProps = async ({ locale, params }: GetStaticPropsContext) => {
    locale = params?.locale as string || locale || i18nConfig.defaultLocale

    let messages = {}
    try { messages = (await import(`messages/${locale}.json`)).default } catch { }

    return {
        messages,
        locale
    }
}