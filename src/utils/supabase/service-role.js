import { createClient as createClientPrimitive } from '@supabase/supabase-js'

export function createClient() {
    const supabase = createClientPrimitive(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    return supabase
}