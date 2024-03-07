import { createServerClient, serialize } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient(req, res) {
    if (req.headers.authorization) {
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            { global: { headers: { Authorization: req.headers.authorization } } }
        )

        return supabase
    } else {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    get(name) {
                        return req.cookies[name]
                    },
                    set(name, value, options) {
                        res.setHeader('Set-Cookie', serialize(name, value, options))
                    },
                    remove(name, options) {
                        res.setHeader('Set-Cookie', serialize(name, '', options))
                    },
                },
            }
        )

        return supabase
    }
}