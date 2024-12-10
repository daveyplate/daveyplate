import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'
import NextLink from 'next/link'
import { forwardRef, Ref } from 'react'

import { isExport } from '@/utils/utils'
import i18nConfig from 'i18n.config'

export const routing = defineRouting({
    locales: i18nConfig.locales,
    defaultLocale: i18nConfig.defaultLocale,
    localePrefix: isExport() ? 'always' : 'as-needed'
})

export const { Link: NextIntlLink, redirect, usePathname, useRouter: useLocaleRouter, getPathname, permanentRedirect } =
    createNavigation(routing)

/**
 * A wrapper around Next.js Link component that automatically uses the correct locale
 */
export const Link = forwardRef((props: any, ref: Ref<HTMLAnchorElement>) => {
    if (isExport()) return <NextIntlLink ref={ref} {...props} />

    const { linkAs } = props
    delete props.linkAs

    return <NextLink ref={ref} as={linkAs} {...props} />
})