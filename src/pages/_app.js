import { NextIntlClientProvider } from 'next-intl'
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect } from "react"

import { OpenGraph } from "@daveyplate/next-open-graph"

import { cn } from "@nextui-org/react"

import "@/styles/custom.css"
import "@/styles/global.css"
import "@/styles/webkit-fixes.css"

import DefaultFont from "@/styles/fonts"

import Footer from "@/components/footer"
import Header from "@/components/header"
import Providers from "@/components/providers/providers"

const MyApp = ({ Component, pageProps }) => {
    const router = useRouter()

    useEffect(() => {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            document.documentElement.classList.add('ua-ios')
        }
    }, [])

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
                    &.ua-ios {
                        @supports (font: -apple-system-body) {
                            font: -apple-system-body;
                            font-size-adjust: 0.5;
                        }
                    }
                        
                    body {
                        font-family: ${DefaultFont.style.fontFamily};
                    }
                `}</style>

                <div className={cn(router.pathname == "/" && "bg-gradient-to-br from-background via-secondary-100 to-primary-100 dark:via-secondary-50 dark:to-primary-50",
                    "flex flex-col min-h-dvh px-safe"
                )}>
                    <Header {...pageProps} />

                    <main className="flex flex-col grow">
                        <Component {...pageProps} />
                    </main>

                    <Footer />
                </div>
            </Providers>
        </NextIntlClientProvider>
    )
}

export default MyApp