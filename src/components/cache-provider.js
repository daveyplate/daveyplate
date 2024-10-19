import useSWR, { SWRConfig, useSWRConfig } from "swr"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useCacheProvider } from "@piotr-cz/swr-idb-cache"

/** Hook for clearing cache */
export const useClearCache = () => {
    const { cache } = useSWRConfig()

    const clearCache = () => {
        for (let key of cache.keys()) cache.delete(key)
    }

    return clearCache
}

/**
 * Wraps useSWR with enabled state 
 * @param {string} query - The query to fetch
 * @param {object} config - The options for the fetch
 * @returns {import("swr").SWRResponse} - The SWR response
 */
export const useCache = (query, config) => {
    const { provider } = useSWRConfig()
    const swr = useSWR(provider ? query : null, config)

    return { ...swr, isLoading: swr.isLoading || !provider }
}

/** Integrates SWR with IndexedDB to persist the cache */
export default function CacheProvider({ children, swrConfig = {} }) {
    const supabase = useSupabaseClient()
    const cacheProvider = useCacheProvider({
        dbName: 'daveyplate',
        storeName: 'swr-cache',
    })

    const fetcher = async (url) => {
        const headers = {}
        let basePath = ""

        // Use base URL for export
        if (process.env.NEXT_PUBLIC_IS_EXPORT == "1") {
            // Pass session access token
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            if (!url.startsWith("http")) {
                basePath = process.env.NEXT_PUBLIC_BASE_URL
            }
        }

        const res = await fetch(basePath + url, { headers })
        if (res.ok) {
            return res.json()
        } else {
            throw new Error(res.statusText)
        }
    }

    return (
        <SWRConfig value={{
            fetcher,
            provider: cacheProvider,
            ...swrConfig
        }}>
            {children}
        </SWRConfig>
    )
}