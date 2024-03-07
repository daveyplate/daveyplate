import Link from 'next/link'
import { useRouter } from 'next/router'
import i18nextConfig from '../../next-i18next.config'
import { forwardRef } from 'react'
import { isExport } from '@/utils/utils'

export const localeHref = (pathname, locale = i18nextConfig.i18n.defaultLocale) => {
  if (!isExport()) return pathname

  // Prevent looping
  if (pathname.startsWith(`/${locale}`)) return pathname

  // Remove trailing slash from index
  if (pathname == '/') return `/${locale}`

  // For other pages, prepend the locale prefix
  return `/${locale}${pathname}`
}

const LocaleLink = forwardRef((props, ref) => {
  let href = props.href

  if (!isExport() || !href) return <Link ref={ref} {...props}>{props.children}</Link>

  const router = useRouter()
  const locale = props.locale || router.query.locale || router.locale || i18nextConfig.i18n.defaultLocale

  // Rewrite dynamic routes to include the locale and use query parameters
  if (href.pathname && href.query) {
    // Prepend the locale to the href pathname
    if (!href.pathname.startsWith(`/${locale}`)) {
      href.pathname = `/${locale}${href.pathname.replace('[', '').replace(']', '')}`
    }

    return <Link ref={ref} {...props} href={href}>{props.children}</Link>
  }

  // Prepend the locale to the href
  if (!href.startsWith(`/${locale}`)) {
    href = `/${locale}${href}`
  }

  return <Link ref={ref} {...props} href={href}>{props.children}</Link>
})

export default LocaleLink