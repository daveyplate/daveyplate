import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
    const cookieStore = cookies()

    return createServerClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
            cookies: {
                async getAll() {
                    return (await cookieStore).getAll()
                },
                async setAll(cookiesToSet) {
                    try {
                        const resolvedCookiesStore = await cookieStore

                        cookiesToSet.forEach(({ name, value, options }) =>
                            resolvedCookiesStore.set(name, value, options),
                        )
                    } catch { }
                },
            },
        },
    )
}