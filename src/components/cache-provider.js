import { useEffect, useRef, useState } from "react"
import useSWR, { SWRConfig, useSWRConfig } from "swr"
import axios from "axios"

import { useSession } from "@supabase/auth-helpers-react"

import { compress, decompress, isExport } from "@/utils/utils"
import { toast } from "@/components/toast-provider"

const useLocalStorage = true

/** Hook for clearing cache and local storage */
export const useClear = () => {
    const { cache } = useSWRConfig()

    const clearCache = () => {
        for (let key of cache.keys()) cache.delete(key)

        useLocalStorage && localStorage.clear()
    }

    return clearCache
}

/** Wraps useSWR with enabled state */
export const useCache = (query, opts, errorToast = true) => {
    const { enabled } = useSWRConfig()

    const swr = useSWR(enabled ? query : null, opts)

    useEffect(() => {
        if (swr.error) {
            console.error("error.message", swr.error.message)
            console.error(swr.error)

            // Skip the error toast if it's a network error
            if (swr.error.message == "Network Error") return
            if (swr.error.message == "Failed to fetch") return
            if (swr.error.message == "Load failed") return
            if (!swr.error.message) return

            if (errorToast) {
                toast("Server Error", { color: "danger" })
            }
        }
    }, [swr.error])

    return swr
}

/** Integrates SWR with localStorage to persist the cache */
export default function CacheProvider({ children }) {
    const session = useSession()
    const [cacheMap, setCacheMap] = useState(useLocalStorage ? null : new Map())
    const [lastCache, setLastCache] = useState(null)
    const cacheMapRef = useRef(cacheMap);
    const lastCacheRef = useRef(lastCache);
    const clearCache = useClear()

    // Update the refs when the state changes
    useEffect(() => {
        cacheMapRef.current = cacheMap
        lastCacheRef.current = lastCache
    }, [cacheMap, lastCache])

    if (useLocalStorage) {
        // Persist the cache to local storage
        const persistCache = async () => {
            if (!cacheMapRef.current) return

            const currentCache = JSON.stringify(Array.from(cacheMapRef.current.entries()))
            if (lastCacheRef.current == currentCache) return

            setLastCache(currentCache)

            const compressedCache = await compress(currentCache)

            try {
                localStorage.setItem('app-cache', compressedCache)

                const localStorageSize = new Blob(Object.values(localStorage)).size;
                console.log("Cache Persisted", Math.round((localStorageSize / 1024) * 100) / 100, "KB")
            } catch (error) {
                console.error(error)
                clearCache()
            }
        }

        // Load the cache from local storage
        const loadCache = async () => {
            let compressedCache = localStorage.getItem('app-cache')

            if (compressedCache) {
                try {
                    const cache = (await decompress(compressedCache)).toString()
                    setLastCache(cache)

                    const jsonCache = JSON.parse(cache.toString())
                    const map = new Map(jsonCache)

                    setCacheMap(map)
                } catch (e) {
                    localStorage.clear()
                    console.error(e)
                    setCacheMap(new Map())
                }
            } else {
                setCacheMap(new Map())
            }
        }

        // Load the cache from local storage on mount
        useEffect(() => {
            loadCache()

            // Check for changes in the cache and persist them
            const cacheInterval = setInterval(() => {
                persistCache(cacheMap)
            }, 1000)

            // Persist the cache before the page is unloaded
            window.addEventListener('beforeunload', persistCache)

            return () => {
                clearInterval(cacheInterval)
                window.removeEventListener('beforeunload', persistCache)
            }
        }, [])
    }

    const fetcher = async (resource, init) => {
        let baseUrl = ""

        const headers = init?.headers || {}

        // If we're exporting the site, use the base URL for fetches
        if (isExport()) {
            // Check if there's a session and if it contains an access token
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            if (!resource.startsWith("http")) {
                baseUrl = process.env.NEXT_PUBLIC_BASE_URL
            }
        }

        const response = await axios({
            url: baseUrl + resource,
            headers: headers,
            timeout: 25000, // 25 seconds timeout
            ...init
        })

        return JSON.parse(JSON.stringify(response.data))
    }

    return (
        <SWRConfig value={{
            fetcher,
            enabled: !!cacheMap,
            provider: cacheMap ? () => cacheMap : undefined,
            // focusThrottleInterval: 30000,
            // dedupingInterval: 30000
        }}>
            {children}
        </SWRConfig>
    )
}