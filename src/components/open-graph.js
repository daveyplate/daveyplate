
import Head from "next/head"
import { useRouter } from "next/router"

/**
 * OpenGraph component for setting up Open Graph and Twitter meta tags.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.title] - The title of the page.
 * @param {string} [props.description] - The description of the page.
 * @param {string} [props.image] - The URL of the image to be used in the meta tags.
 * @param {string[]} [props.images=[]] - An array of URLs of images to be used in the meta tags (overrides image).
 * @param {string} [props.ogType="website"] - The Open Graph type (default is "website").
 * @param {string} [props.twitterCard="summary"] - The Twitter card type (default is "summary").
 * @param {string} [props.url] - The URL of the page, defaults to current URL.
 * @param {string} [props.siteName] - The name of the site.
 * @returns {JSX.Element} The Head component with meta tags.
 */
export default function OpenGraph({ title, description, image, images = [], ogType = "website", twitterCard = "summary", url, siteName = process.env.NEXT_PUBLIC_SITE_NAME }) {
    const router = useRouter()
    image = image || process.env.NEXT_PUBLIC_BASE_URL + "/apple-touch-icon.png"
    title = title ? `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME}` : process.env.NEXT_PUBLIC_SITE_NAME
    url = url || process.env.NEXT_PUBLIC_BASE_URL + router.asPath

    return (
        <Head>
            {description && <meta key="meta-description" name="description" content={description} />}

            {/* Open Graph / Facebook */}
            {ogType && <meta key="og:type" property="og:type" content={ogType} />}
            {image && <meta key="og:image:0" property="og:image" content={image} />}
            {images.map((image, index) => <meta key={`og:image:${index}`} property="og:image" content={image} />)}
            {siteName && <meta key="og:site_name" property="og:site_name" content={siteName} />}
            {title && <meta key="og:title" property="og:title" content={title} />}
            {description && <meta key="og:description" property="og:description" content={description} />}
            <meta key="og:url" property="og:url" content={url} />

            {/* Twitter */}
            {image && <meta key="twitter:image" property="twitter:image" content={image} />}
            {twitterCard && <meta key="twitter:card" property="twitter:card" content={twitterCard} />}
            {title && <meta key="twitter:title" property="twitter:title" content={title} />}
            {description && <meta key="twitter:description" property="twitter:description" content={description} />}
        </Head>
    )
}