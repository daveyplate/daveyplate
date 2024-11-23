import Head from "next/head"
import { NextIntlClientProvider } from 'next-intl'

import "@/styles/global.css"
import "@/styles/custom.css"

import DefaultFont from "@/styles/fonts"

import Providers from "@/components/providers/providers"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { OpenGraph } from "@daveyplate/next-open-graph"
import NewHeader from "@/components/new-header"
import NewFooter from "@/components/new-footer"
import { useRouter } from "next/router"
import { cn } from "@nextui-org/react"

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
                    "relative flex min-h-dvh w-full flex-col py-safe  px-safe"
                )}>
                    <NewHeader {...pageProps} />
                    <Component {...pageProps} />
                </div>
            </Providers>
        </NextIntlClientProvider>
    )
}

export default MyApp

/*


                <main className={`flex min-h-svh w-svh
                    pt-[calc(4rem+env(safe-area-inset-top))] 
                    pb-[calc(4rem+env(safe-area-inset-bottom))] 
                    px-safe
                `}>
                    <Component {...pageProps} />
                </main>


                */