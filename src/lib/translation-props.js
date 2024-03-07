import i18nextConfig from '../../next-i18next.config'

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