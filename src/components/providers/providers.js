import { SessionContextProvider } from '@supabase/auth-helpers-react'

import { ThemeProvider } from "next-themes"
import { NextUIProvider } from "@nextui-org/react"
import { SWRConfig } from "swr"
import { useCacheProvider } from "@piotr-cz/swr-idb-cache"

import { AutoTranslateProvider } from 'next-auto-translate'

import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { useWindowFocusBlur } from "@daveyplate/use-window-focus-blur"

import i18nConfig from 'i18n.config'
import { createClient } from '@/utils/supabase/component'

import MetaTheme from "@/components/providers/meta-theme"
import ToastProvider from "@/components/providers/toast-provider"
import CheckoutStatus from "@/components/providers/checkout-status"
import ReactivateUser from "@/components/providers/reactivate-user"
import { CapacitorProvider } from "@/components/providers/capacitor-provider"
import { usePathname, useLocaleRouter } from "@/i18n/routing"

export default function Providers({ children, ...pageProps }) {
    useWindowFocusBlur()
    const localeRouter = useLocaleRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const cacheProvider = useCacheProvider({
        dbName: 'daveyplate',
        storeName: 'swr-cache',
    })

    return (
        <SessionContextProvider supabaseClient={supabase}>
            <SWRConfig value={{ provider: cacheProvider }}>
                <NextUIProvider navigate={localeRouter.push} >
                    <ThemeProvider attribute="class" disableTransitionOnChange>
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

                            <ReactivateUser />
                            <CheckoutStatus />
                            <ToastProvider />
                            <CapacitorProvider />

                            <SpeedInsights debug={false} />
                            <Analytics debug={false} />
                        </AutoTranslateProvider>
                    </ThemeProvider>
                </NextUIProvider>
            </SWRConfig>
        </SessionContextProvider >
    )
}