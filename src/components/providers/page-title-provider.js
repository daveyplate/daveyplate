import Head from "next/head"
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from "next/router"

const PageTitleContext = createContext()

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

export const PageTitleProvider = ({ children, formatTitle }) => {
    const router = useRouter()
    const [pageTitle, setPageTitle] = useState(router.pathname == "/" ? siteName : null)

    return (
        <PageTitleContext.Provider value={{ pageTitle, setPageTitle, formatTitle }}>
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
    const { setPageTitle, formatTitle } = usePageTitle()

    if (title == undefined) {
        title = formatPathToTitle(router.pathname)

        if (formatTitle) {
            title = formatTitle(title)
        }
    }

    useEffect(() => {
        setPageTitle(router.pathname == "/" ? siteName : title)
    }, [title])

    return (
        <Head>
            <title>
                {router.pathname == "/" ? siteName : title ? `${title} | ${siteName}` : null}
            </title>
        </Head>
    )
}

const formatPathToTitle = (path) => {
    const firstPart = path?.split('/') // Split the path by '/'
        .filter(Boolean) // Remove any empty strings
        .shift() // Take the first non-empty segment

    // Replace hyphens with spaces and capitalize each word
    return firstPart?.replace("_", "").split('-') // Split the part on hyphen
        .map(subPart => subPart.charAt(0).toUpperCase() + subPart.slice(1)) // Capitalize the first letter of each sub-part
        .join(' ') // Join the sub-parts with spaces
        || ""
}