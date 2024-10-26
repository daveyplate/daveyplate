import Head from "next/head"
import { useRouter } from "next/router"

export default function MetaTags({ title, description, image, ogType = "website" }) {
    const router = useRouter()
    image = image || process.env.NEXT_PUBLIC_BASE_URL + "/apple-touch-icon.png"
    title = title ? `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME}` : process.env.NEXT_PUBLIC_SITE_NAME

    return (
        <Head>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={process.env.NEXT_PUBLIC_SITE_NAME} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={process.env.NEXT_PUBLIC_BASE_URL + router.asPath} />

            {/* Twitter */}
            <meta property="twitter:image" content={image} />
            <meta property="twitter:card" content="summary" />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
        </Head>
    )
}