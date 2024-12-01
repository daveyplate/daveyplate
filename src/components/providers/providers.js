import { useEffect } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { SWRConfig } from "swr"
import { useCacheProvider } from "@piotr-cz/swr-idb-cache"
import PullToRefresh from 'pulltorefreshjs'
import ReactDOMServer from 'react-dom/server'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'

import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import de from 'javascript-time-ago/locale/de'
TimeAgo.addLocale(en)
TimeAgo.addLocale(de)
TimeAgo.setDefaultLocale('en')

import { ThemeProvider } from "next-themes"
import { NextUIProvider, Spinner } from "@nextui-org/react"
import { toast } from 'sonner'

import { AutoTranslateProvider } from 'next-auto-translate'
import { useWindowFocusBlur } from "@daveyplate/use-window-focus-blur"
import { PageTitleProvider } from '@daveyplate/next-page-title'

import i18nConfig from 'i18n.config'
import { usePathname, useLocaleRouter } from "@/i18n/routing"
import { createClient } from '@/utils/supabase/component'
import { iOS } from '@/utils/utils'

import MetaTheme from "@/components/providers/meta-theme"
import ToastProvider from "@/components/providers/toast-provider"
import CheckoutStatus from "@/components/providers/checkout-status"
import { CapacitorProvider } from "@/components/providers/capacitor-provider"
import { ArrowDownIcon } from '@heroicons/react/24/outline'

const localeValues = [
    'fr-FR', 'fr-CA', 'de-DE', 'en-US', 'en-GB', 'ja-JP',
    'da-DK', 'nl-NL', 'fi-FI', 'it-IT', 'nb-NO', 'es-ES',
    'sv-SE', 'pt-BR', 'zh-CN', 'zh-TW', 'ko-KR', 'bg-BG',
    'hr-HR', 'cs-CZ', 'et-EE', 'hu-HU', 'lv-LV', 'lt-LT',
    'pl-PL', 'ro-RO', 'ru-RU', 'sr-SP', 'sk-SK', 'sl-SI',
    'tr-TR', 'uk-UA', 'ar-AE', 'ar-DZ', 'AR-EG', 'ar-SA',
    'el-GR', 'he-IL', 'fa-AF', 'am-ET', 'hi-IN', 'th-TH'
]

export default function Providers({ children, ...pageProps }) {
    useWindowFocusBlur()
    const localeRouter = useLocaleRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const cacheProvider = useCacheProvider({
        dbName: 'daveyplate',
        storeName: 'swr-cache',
    })

    const nextUILocale = localeValues.find((locale) => locale.startsWith(pageProps.locale))

    useEffect(() => {
        window.history.scrollRestoration = iOS() ? 'auto' : 'manual'

        // Enable pull to refresh for iOS PWA
        const standalone = window.matchMedia("(display-mode: standalone)").matches

        if (standalone) {
            PullToRefresh.init({
                instructionsReleaseToRefresh: " ",
                instructionsPullToRefresh: " ",
                instructionsRefreshing: " ",
                iconRefreshing: ReactDOMServer.renderToString(
                    <Spinner color="white" size="sm" className="invert dark:invert-0" />
                ),
                iconArrow: ReactDOMServer.renderToString(
                    <ArrowDownIcon className="size-5 mx-auto text-foreground" />
                )
            })
        }

        return () => PullToRefresh.destroyAll()
    }, [])

    return (
        <PageTitleProvider>
            <SessionContextProvider supabaseClient={supabase}>
                <SWRConfig value={{
                    onError: (error, key) => {
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
                                    defaultLocale={i18nConfig.i18n.defaultLocale}
                                    locales={i18nConfig.i18n.locales}
                                    messages={pageProps.messages || []}
                                    locale={pageProps.locale}
                                    debug={false}
                                    disabled={true}
                                >
                                    <MetaTheme />

                                    {children}

                                    <CheckoutStatus />
                                    <ToastProvider />
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