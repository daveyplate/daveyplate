import { useRouter } from "next/router"
import { SessionContextProvider } from '@supabase/auth-helpers-react'

import { ThemeProvider } from "next-themes"
import { NextUIProvider } from "@nextui-org/react"
import { SWRConfig } from "swr"
import { useCacheProvider } from "@piotr-cz/swr-idb-cache"

import { NextIntlClientProvider } from 'next-intl'
import { AutoTranslateProvider } from 'next-auto-translate'

import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { useWindowFocusBlur } from "@daveyplate/use-window-focus-blur"

import { createClient } from '@/utils/supabase/component'

import MetaTheme from "@/components/providers/meta-theme"
import ToastProvider from "@/components/providers/toast-provider"
import CheckoutStatus from "@/components/providers/checkout-status"
import ReactivateUser from "@/components/providers/reactivate-user"
import { CapacitorProvider } from "@/components/providers/capacitor-provider"

export default function Providers({ children, ...pageProps }) {
    useWindowFocusBlur()
    const router = useRouter()
    const supabase = createClient()
    const cacheProvider = useCacheProvider({
        dbName: 'daveyplate',
        storeName: 'swr-cache',
    })

    return (
        <SessionContextProvider supabaseClient={supabase}>
            <SWRConfig value={{ provider: cacheProvider }}>
                <NextUIProvider navigate={router.push}>
                    <ThemeProvider
                        attribute="class"
                        disableTransitionOnChange
                    >
                        <NextIntlClientProvider
                            locale={pageProps.locale || "en"}
                            messages={pageProps.messages}
                            timeZone="America/Los_Angeles"
                        >
                            <AutoTranslateProvider
                                pathname={router.pathname}
                                defaultLocale={pageProps.defaultLocale}
                                locales={pageProps.locales}
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
                        </NextIntlClientProvider>
                    </ThemeProvider>
                </NextUIProvider>
            </SWRConfig>
        </SessionContextProvider>
    )
}