import { useEffect, useState } from 'react'
import Head from "next/head"
import { useRouter } from "next/router"

import { localeHref } from "@/components/locale-link"

const siteName = "Daveyplate"

export function useDocumentTitle() {
    const [title, setTitle] = useState(typeof (document) != "undefined" ? document.title : "")

    useEffect(() => {
        // Observe the title element for changes
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === "childList") {
                    setTitle(document.title)
                }
            })
        })

        const target = document.querySelector('title')
        if (target) {
            observer.observe(target, { childList: true })
        }

        setTitle(document.title)

        // Cleanup observer on component unmount
        return () => observer.disconnect()
    }, [])

    return title.split('|')[0].trim()
}

export default function PageTitle({ title, locale }) {
    const router = useRouter()
    const basePath = localeHref('/', locale)

    if (title == undefined) {
        title = formatPathToTitle(router.pathname)
    }

    return (
        <Head>
            <title>
                {router.asPath == basePath ? siteName : `${title} | ${siteName}`}
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