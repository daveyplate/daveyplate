import { SupabaseClient, QueryData } from "@supabase/supabase-js"
import { Database } from "database.types"
import { createBrowserClient } from "@supabase/ssr"
import { getURL } from "../utils"

const supabaseClient: SupabaseClient<Database> = createBrowserClient<Database>(
    getURL() + "/api",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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