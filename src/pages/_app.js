import Head from "next/head"

import { motion } from "framer-motion"

import "@/styles/global.css"
import "@/styles/custom.css"

import DefaultFont from "@/styles/fonts"

import Providers from "@/components/providers"
import Header from "@/components/header"
import Footer from "@/components/footer"

const MyApp = ({ Component, pageProps }) => {
    return (
        <Providers {...pageProps}>
            <Head>
                <meta
                    name='viewport'
                    content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
                />

                <meta name="description" content="Description" />
                <meta name="keywords" content="Keywords" />

                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/icons/icon-512x512.png"></link>
            </Head>

            <style jsx global>{`
                html {
                  font-family: ${DefaultFont.style.fontFamily}
                }
            `}</style>

            <main className={`relative flex flex-col h-dvh w-dvh`}>
                <Header {...pageProps} />

                <motion.div
                    className="flex-grow flex"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Component {...pageProps} />
                </motion.div>

                <Footer {...pageProps} />
            </main>
        </Providers>
    )
}

export default MyApp