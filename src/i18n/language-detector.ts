import i18nConfig from 'i18n.config'
import languageDetector from 'next-language-detector'

export default languageDetector({
    supportedLngs: i18nConfig.locales,
    fallbackLng: i18nConfig.defaultLocale
})