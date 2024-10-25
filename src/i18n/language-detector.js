import languageDetector from 'next-language-detector'
import i18nConfig from 'i18n.config'

export default languageDetector({
    supportedLngs: i18nConfig.i18n.locales,
    fallbackLng: i18nConfig.i18n.defaultLocale
})