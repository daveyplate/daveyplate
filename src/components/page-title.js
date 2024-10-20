import Head from "next/head"
import { useRouter } from "next/router"
import { useAutoTranslate } from "next-auto-translate"
import { localeHref } from "@/components/locale-link"

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

export default function PageTitle({ title, locale }) {
    const router = useRouter()
    const basePath = localeHref('/', locale)
    const { autoTranslate } = useAutoTranslate("page_title")

    if (title == undefined) {
        title = autoTranslate(formatPathToTitle(router.pathname), formatPathToTitle(router.pathname))
    }

    return (
        <Head>
            <title>
                {router.asPath == basePath ? siteName : title ? `${title} | ${siteName}` : null}
            </title>
        </Head>
    )
}

const formatPathToTitle = (path) => {
    const firstPart = path.split('/') // Split the path by '/'
        .filter(Boolean) // Remove any empty strings
        .filter(segment => segment !== '[locale]') // Remove the '[locale]' segment if present
        .shift() // Take the first non-empty segment

    // Replace hyphens with spaces and capitalize each word
    return firstPart?.split('-') // Split the part on hyphen
        .map(subPart => subPart.charAt(0).toUpperCase() + subPart.slice(1)) // Capitalize the first letter of each sub-part
        .join(' ') // Join the sub-parts with spaces
        || ""
}