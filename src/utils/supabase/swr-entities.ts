import { QueryData, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "database.types"
import { createClient } from "@/utils/supabase/component"
import { QueryFilters, useEntities, useEntity } from "./supabase-swr"

const supabaseClient: SupabaseClient<Database> = createClient()

export const createQueries = () => {
    return {
        "profiles": supabaseClient.from("profiles").select(),
        "articles": supabaseClient.from("articles").select(),
    }
}

export type Profiles = QueryData<ReturnType<typeof createQueries>["profiles"]>
export type Articles = QueryData<ReturnType<typeof createQueries>["articles"]>

export function useProfiles(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Profiles>(enabled ? "profiles" : null, filters)
}

export function useProfile(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Profiles>((id || filters) ? "profiles" : null, id, filters)
}