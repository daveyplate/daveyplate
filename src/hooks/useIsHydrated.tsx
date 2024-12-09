import { useSyncExternalStore } from "react"

function subscribe() {
    return () => { }
}

export function useIsHydrated(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
}