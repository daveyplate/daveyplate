import Head from "next/head"
import { NextIntlClientProvider } from 'next-intl'

import "@/styles/global.css"
import "@/styles/custom.css"

import DefaultFont from "@/styles/fonts"

import Providers from "@/components/providers/providers"
import Header from "@/components/header"
import { OpenGraph } from "@daveyplate/next-open-graph"
import { useRouter } from "next/router"
import { cn } from "@nextui-org/react"
import Footer from "@/components/footer"

const MyApp = ({ Component, pageProps }) => {
    const router = useRouter()

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