import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'
import { useEffect } from 'react'
import { SWRConfig } from "swr"

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

import TimeAgo from 'javascript-time-ago'
import de from 'javascript-time-ago/locale/de'
import en from 'javascript-time-ago/locale/en'
TimeAgo.addLocale(en)
TimeAgo.addLocale(de)
TimeAgo.setDefaultLocale('en')

import { NextUIProvider } from "@nextui-org/react"
import { ThemeProvider } from "next-themes"
import { toast } from 'sonner'

import { PageTitleProvider } from '@daveyplate/next-page-title'
import { AutoTranslateProvider } from 'next-auto-translate'

import { useLocaleRouter, usePathname } from "@/i18n/routing"
import { createClient } from '@/utils/supabase/component'
import { iOS } from '@/utils/utils'
import i18nConfig from 'i18n.config'

import { CapacitorProvider } from "@/components/providers/capacitor-provider"
import { useWindowFocusBlur } from "@daveyplate/use-window-focus-blur"

import MetaTheme from "@/components/providers/meta-theme"
import ToastProvider from "@/components/providers/toast-provider"
import NotificationToaster from "../notifications/notification-toaster"

const localeValues = [
    'fr-FR', 'fr-CA', 'de-DE', 'en-US', 'en-GB', 'ja-JP',
    'da-DK', 'nl-NL', 'fi-FI', 'it-IT', 'nb-NO', 'es-ES',
    'sv-SE', 'pt-BR', 'zh-CN', 'zh-TW', 'ko-KR', 'bg-BG',
    'hr-HR', 'cs-CZ', 'et-EE', 'hu-HU', 'lv-LV', 'lt-LT',
    'pl-PL', 'ro-RO', 'ru-RU', 'sr-SP', 'sk-SK', 'sl-SI',
    'tr-TR', 'uk-UA', 'ar-AE', 'ar-DZ', 'AR-EG', 'ar-SA',
    'el-GR', 'he-IL', 'fa-AF', 'am-ET', 'hi-IN', 'th-TH'
]

export default function Providers(
    { children, ...pageProps }: { children: React.ReactNode } & { locale: string, messages: object[] }
) {
    const localeRouter = useLocaleRouter()
    const pathname = usePathname()
    const supabase = createClient()
    useWindowFocusBlur()

    const nextUILocale = localeValues.find((locale) => locale.startsWith(pageProps.locale))

    useEffect(() => {
        window.history.scrollRestoration = iOS() ? 'auto' : 'manual'
    }, [])

    return (
        <PageTitleProvider>
            <SessionContextProvider supabaseClient={supabase}>
                <SWRConfig value={{
                    onError: (error) => {
                        if (error.status !== 403 && error.status !== 404) {
                            // We can send the error to Sentry,
                            // or show a notification UI.
                        }

                        toast.error(error.message)
                    }
                }}>
                    <NextUIProvider locale={nextUILocale} navigate={localeRouter.push}>
                        <ThemeProvider attribute="class" disableTransitionOnChange>
                            <NuqsAdapter>
                                <AutoTranslateProvider
                                    pathname={pathname}
                                    defaultLocale={i18nConfig.defaultLocale}
                                    locales={i18nConfig.locales}
                                    messages={pageProps.messages || []}
                                    locale={pageProps.locale}
                                    debug={false}
                                    disabled={true}
                                >
                                    <MetaTheme />

                                    {children}

                                    <ToastProvider />
                                    <NotificationToaster />
                                    <CapacitorProvider />

                                    <SpeedInsights debug={false} />
                                    <Analytics debug={false} />
                                </AutoTranslateProvider>
                            </NuqsAdapter>
                        </ThemeProvider>
                    </NextUIProvider>
                </SWRConfig>
            </SessionContextProvider>
        </PageTitleProvider>
    )
}