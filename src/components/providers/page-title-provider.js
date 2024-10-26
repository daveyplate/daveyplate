import Head from "next/head"
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from "next/router"

const PageTitleContext = createContext()

const isBasePath = (path) => path == "/" || path == "/[locale]"

export const PageTitleProvider = ({ children, formatTitle, siteName = process.env.NEXT_PUBLIC_SITE_NAME }) => {
    const router = useRouter()
    const [pageTitle, setPageTitle] = useState(isBasePath(router.pathname) ? siteName : null)

    return (
        <PageTitleContext.Provider value={{ pageTitle, setPageTitle, formatTitle, siteName }}>
            <PageTitle />

            {children}
        </PageTitleContext.Provider>
    )
}

export const usePageTitle = () => {
    return useContext(PageTitleContext)
}

export default function PageTitle({ title }) {
    const router = useRouter()
    const { setPageTitle, formatTitle, siteName } = usePageTitle()

    if (title == undefined) {
        title = formatPathToTitle(router.pathname)

        if (formatTitle) {
            title = formatTitle(title)
        }
    }

    useEffect(() => {
        setPageTitle(isBasePath(router.pathname) ? siteName : title)
    }, [title])

    return (
        <Head>
            <title>
                {isBasePath(router.pathname) ? siteName : title ? `${title} | ${siteName}` : null}
            </title>
        </Head>
    )
}

const formatPathToTitle = (path) => {
    const firstPart = path?.split('/') // Split the path by '/'
        .filter(Boolean) // Remove any empty strings
        .filter(segment => segment !== '[locale]') // Remove the '[locale]' segment if present
        .shift() // Take the first non-empty segment

    // Replace hyphens with spaces and capitalize each word
    return firstPart?.replace("_", "").split('-') // Split the part on hyphen
        .map(subPart => subPart.charAt(0).toUpperCase() + subPart.slice(1)) // Capitalize the first letter of each sub-part
        .join(' ') // Join the sub-parts with spaces
        || ""
}