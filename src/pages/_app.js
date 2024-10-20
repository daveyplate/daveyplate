import Head from "next/head"

import { motion } from "framer-motion"

import "@/styles/global.css"
import "@/styles/custom.css"

import DefaultFont from "@/styles/fonts"

import Providers from "@/components/providers/providers"
import Header from "@/components/header"
import Footer from "@/components/footer"

const lightBackground = '#FFFFFF'
const darkBackground = '#000000'

const MyApp = ({ Component, pageProps }) => {
    return (
        <Providers {...pageProps}>
            <Head>
                <meta
                    name='viewport'
                    content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
                />

                <meta name="theme-color" key="light-theme-color" media="(prefers-color-scheme: light)" content={lightBackground} />
                <meta name="theme-color" key="dark-theme-color" media="(prefers-color-scheme: dark)" content={darkBackground} />

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