import { createBrowserClient } from '@supabase/ssr'
import { Database } from 'database.types'
import { getURL } from '../utils'

export function createClient() {
  const supabase = createBrowserClient<Database>(
    getURL() + "/api",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabase
}