import Head from "next/head"
import { useRouter } from "next/router"

export default function MetaTags({ title, description, image, ogType = "website", url }) {
    const router = useRouter()
    image = image || process.env.NEXT_PUBLIC_BASE_URL + "/apple-touch-icon.png"
    title = title ? `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME}` : process.env.NEXT_PUBLIC_SITE_NAME
    url = url || process.env.NEXT_PUBLIC_BASE_URL + router.asPath

    return (
        <Head>
            <meta key="meta-description" name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta key="og:type" property="og:type" content={ogType} />
            <meta key="og:image" property="og:image" content={image} />
            <meta key="og:site_name" property="og:site_name" content={process.env.NEXT_PUBLIC_SITE_NAME} />
            <meta key="og:title" property="og:title" content={title} />
            <meta key="og:description" property="og:description" content={description} />
            <meta key="og:url" property="og:url" content={url} />

            {/* Twitter */}
            <meta key="twitter:image" property="twitter:image" content={image} />
            <meta key="twitter:card" property="twitter:card" content="summary" />
            <meta key="twitter:title" property="twitter:title" content={title} />
            <meta key="twitter:description" property="twitter:description" content={description} />
        </Head>
    )
}