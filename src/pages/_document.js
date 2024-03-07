import { Html, Head, Main, NextScript } from 'next/document'

import { ThemeScript } from '@/components/meta-theme'

export default function Document() {
    return (
        <Html>
            <Head>
                <ThemeScript />
            </Head>

            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}