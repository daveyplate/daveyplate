import i18nextConfig from '@/../next-i18next.config'

export const getI18nPaths = () =>
  i18nextConfig.i18n.locales.map((lng) => ({
    params: {
      locale: lng
    }
  }))

export const getStaticPaths = () => ({
  fallback: false,
  paths: getI18nPaths()
})