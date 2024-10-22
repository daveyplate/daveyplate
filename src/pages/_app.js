import Head from "next/head"

import "@/styles/global.css"
import "@/styles/custom.css"

import DefaultFont from "@/styles/fonts"

import Providers from "@/components/providers/providers"
import Header from "@/components/header"
import Footer from "@/components/footer"

const MyApp = ({ Component, pageProps }) => {
    return (
        <Providers {...pageProps}>
            <Head>
                <meta name="description" content="Description" />
                <meta name="keywords" content="Keywords" />

                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/favicon.ico" sizes="48x48" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </Head>

            <style jsx global>{`
                html {
                  font-family: ${DefaultFont.style.fontFamily}
                }
            `}</style>

            <main className={`flex flex-col min-h-svh w-svh`}>
                <Header {...pageProps} />
                <Component {...pageProps} />
                <Footer {...pageProps} />
            </main>
        </Providers>
    )
}

export default MyApp