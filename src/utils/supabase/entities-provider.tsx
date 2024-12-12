import { SupabaseClient, QueryData } from "@supabase/supabase-js"
import { Database } from "database.types"
import { QueryFilters, useEntities, useEntity } from "./supabase-swr"
import { createBrowserClient } from "@supabase/ssr"
import { getURL } from "../utils"

const supabaseClient: SupabaseClient<Database> = createBrowserClient(
    getURL() + "/api",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { isSingleton: false }
)

export const createQueries = () => {
    return {
        "profiles": supabaseClient.from("profiles").select(),
        "articles": supabaseClient.from("articles").select(),
    }
}

const queries = createQueries()

export type Profile = QueryData<typeof queries["profiles"]>[0]
export type Article = QueryData<typeof queries["articles"]>[0]

export function useProfiles(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Profile>(enabled ? "profiles" : null, filters)
}

export function useProfile(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Profile>((id || filters) ? "profiles" : null, id, filters)
}