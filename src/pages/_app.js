import Head from "next/head"
import { NextIntlClientProvider } from 'next-intl'

import "@/styles/global.css"
import "@/styles/custom.css"

import DefaultFont from "@/styles/fonts"

import Providers from "@/components/providers/providers"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { iOS } from "@/utils/utils"
import OpenGraph from "@/components/open-graph"

const MyApp = ({ Component, pageProps }) => {
    const router = useRouter()

    useEffect(() => {
        window.history.scrollRestoration = iOS() ? 'auto' : 'manual'
    }, [router])

    return (
        <NextIntlClientProvider
            locale={pageProps.locale || "en"}
            messages={pageProps.messages}
            timeZone="America/Los_Angeles"
        >
            <Providers {...pageProps}>
                <Head>
                    <meta
                        name='viewport'
                        content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
                    />

                    <link rel="icon" href="/favicon.ico" sizes="48x48" />
                    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                </Head>

                <OpenGraph description="Welcome to Daveyplate" />

                <style jsx global>{`
                    html {
                    font-family: ${DefaultFont.style.fontFamily}
                    }
                `}</style>

                <Header {...pageProps} />

                <main className={`flex min-h-svh w-svh
                    pt-[calc(4rem+env(safe-area-inset-top))] 
                    pb-[calc(4rem+env(safe-area-inset-bottom))] 
                    px-safe
                `}>
                    <Component {...pageProps} />
                </main>
                <Footer {...pageProps} />
            </Providers>
        </NextIntlClientProvider>
    )
}

export default MyApp