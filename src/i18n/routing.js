import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

import i18nextConfig from 'next-i18next.config'
import { isExport } from '@/utils/utils'

export const routing = defineRouting({
    locales: i18nextConfig.i18n.locales,
    defaultLocale: i18nextConfig.i18n.defaultLocale,
    localePrefix: isExport() ? 'always' : 'as-needed'
})

export const { Link, redirect, usePathname, useRouter, getPathname, permanentRedirect } =
    createNavigation(routing)