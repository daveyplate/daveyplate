import { createBrowserClient } from '@supabase/ssr'
import { Database } from 'database.types'
import { getURL } from '../utils'
import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestClient } from '@supabase/postgrest-js'

type MutableSupabaseClient<T> = SupabaseClient<T> & {
  rest: PostgrestClient
}

export function createClient() {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as MutableSupabaseClient<Database>

  supabase.rest.url = supabase.rest.url.replace(process.env.NEXT_PUBLIC_SUPABASE_URL!, getURL() + "/api")

  return supabase
}