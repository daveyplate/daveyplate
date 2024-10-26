import NextLink from 'next/link'
import { forwardRef } from 'react'
import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

import i18nConfig from 'i18n.config'
import { isExport } from '@/utils/utils'

export const routing = defineRouting({
    locales: i18nConfig.i18n.locales,
    defaultLocale: i18nConfig.i18n.defaultLocale,
    localePrefix: isExport() ? 'always' : 'as-needed'
})

export const { Link: NextIntlLink, redirect, usePathname, useRouter: useLocaleRouter, getPathname, permanentRedirect } =
    createNavigation(routing)

/**
 * A wrapper around Next.js Link component that automatically uses the correct locale
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<import("next/link").LinkProps> & React.RefAttributes<HTMLElement>>}
 */
export const Link = forwardRef(({ ...props }, ref) => {
    if (isExport()) return <NextIntlLink ref={ref} {...props} />

    return <NextLink ref={ref} {...props} />
})