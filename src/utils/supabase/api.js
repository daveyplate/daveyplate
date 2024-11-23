import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerClient, serializeCookieHeader } from '@supabase/ssr'

export function createClient(req, res) {
    // Custom Implementation - For CORS, use Bearer token
    if (req.headers.authorization) {
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            { global: { headers: { Authorization: req.headers.authorization } } }
        )

        return supabase
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return Object.keys(req.cookies).map((name) => ({ name, value: req.cookies[name] || '' }))
                },
                setAll(cookiesToSet) {
                    res.setHeader(
                        'Set-Cookie',
                        cookiesToSet.map(({ name, value, options }) =>
                            serializeCookieHeader(name, value, options)
                        )
                    )
                },
            },
        }
    )

    return supabase
}