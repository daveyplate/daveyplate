import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { SupabaseClient, QueryData } from "@supabase/supabase-js"
import { Database } from "database.types"
import { QueryFilters, useSupabaseSWR } from "./supabase-swr"

export function useProfiles(enabled = true, filters?: QueryFilters | null) {
    const table = "profiles"
    const supabase: SupabaseClient<Database> = useSupabaseClient()

    const query = supabase.from(table).select()
    type QueryType = QueryData<typeof query>

    const swr = useSupabaseSWR<QueryType>("profiles", enabled ? query : null, filters)

    return { ...swr }
}

export function useProfile(id?: string | null, filters?: QueryFilters | null) {
    const swr = useProfiles(!!id || !!filters, id ? { id, ...filters } : filters)
    return { ...swr, data: swr.data?.[0] }
}
