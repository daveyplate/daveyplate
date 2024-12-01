import { useSyncExternalStore } from "react"

function subscribe() {
    return () => { }
}

/**
 * Custom hook that uses the `useSyncExternalStore` hook to determine if the component is hydrated.
 *
 * @returns {boolean} - Returns `true` if the component is hydrated, otherwise `false`.
 */
export function useIsHydrated() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
}