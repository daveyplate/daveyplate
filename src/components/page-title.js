import Head from "next/head"
import { useAutoTranslate } from "next-auto-translate"
import { usePathname } from "@/i18n/routing"

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

export default function PageTitle({ title }) {
    const pathname = usePathname()
    const { autoTranslate } = useAutoTranslate("page_title")

    if (title == undefined) {
        title = autoTranslate(formatPathToTitle(pathname), formatPathToTitle(pathname))
    }

    return (
        <Head>
            <title>
                {pathname == "/" ? siteName : title ? `${title} | ${siteName}` : null}
            </title>
        </Head>
    )
}

const formatPathToTitle = (path) => {
    const firstPart = path.split('/') // Split the path by '/'
        .filter(Boolean) // Remove any empty strings
        .shift() // Take the first non-empty segment

    // Replace hyphens with spaces and capitalize each word
    return firstPart?.replace("_", "").split('-') // Split the part on hyphen
        .map(subPart => subPart.charAt(0).toUpperCase() + subPart.slice(1)) // Capitalize the first letter of each sub-part
        .join(' ') // Join the sub-parts with spaces
        || ""
}