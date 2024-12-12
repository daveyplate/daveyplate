import { QueryData, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "database.types"
import { createClient } from "./component"
import { QueryFilters, useEntities, useEntity } from "./supabase-swr"

const supabaseClient: SupabaseClient<Database> = createClient()

export const createQueries = () => {
    return {
        "profiles": supabaseClient.from("profiles").select(),
        "articles": supabaseClient.from("articles").select(),
    }
}

export type Profile = QueryData<ReturnType<typeof createQueries>["profiles"]>[0]
export type Article = QueryData<ReturnType<typeof createQueries>["articles"]>[0]

export function useProfiles(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Profile>(enabled ? "profiles" : null, filters)
}

export function useProfile(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Profile>((id || filters) ? "profiles" : null, id, filters)
}