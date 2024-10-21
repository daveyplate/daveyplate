import { useRouter } from "next/router"
import { SessionContextProvider } from '@supabase/auth-helpers-react'

import { ThemeProvider } from "next-themes"
import { NextUIProvider } from "@nextui-org/react"

import { NextIntlClientProvider } from 'next-intl'
import { AutoTranslateProvider } from 'next-auto-translate'

import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { useWindowFocusBlur } from "@daveyplate/use-window-focus-blur"

import { createClient } from '@/utils/supabase/component'
import ToastProvider from "@/components/providers/toast-provider"
import CacheProvider from "@/components/providers/cache-provider"
import CheckoutStatus from "@/components/providers/checkout-status"
import ReactivateUser from "@/components/providers/reactivate-user"
import { CapacitorProvider } from "@/components/providers/capacitor-provider"

export default function Providers({ initialSession, children, title, Component, ...pageProps }) {
    const router = useRouter()
    const supabase = createClient()
    useWindowFocusBlur()

    return (
        <SessionContextProvider supabaseClient={supabase}>
            <CacheProvider>
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
            </CacheProvider>
        </SessionContextProvider>
    )
}