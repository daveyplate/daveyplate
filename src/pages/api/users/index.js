
import { createClient } from '@/utils/supabase/service-role'
import applyRateLimit from '@/utils/apply-rate-limit'
import { runMiddleware } from '@/utils/utils'

import Cors from "cors"
const cors = Cors()

export default async (req, res) => {
    await applyRateLimit(req, res)
    await runMiddleware(req, res, cors)

    if (req.method === 'GET') {
        // res.setHeader('Cache-Control', 'public, s-maxage=10, max-age=10, stale-while-revalidate=59')
        await applyRateLimit(req, res)

        const supabase = createClient()

        // Start building the query
        let query = supabase
            .from('users')
            .select('id, full_name, avatar_url, claims, bio') // include 'bio' if you need to search in it
            .limit(100)
            .eq('deactivated', false)
            .order('created_at', { ascending: false })

        // Modify the query to search
        let { q } = req.query

        if (q) {
            // Remove disallowed characters for ilike:
            q = q.replace(/[^a-zA-Z0-9\s]/g, '')

            query = query.or(`full_name.ilike.%${q}%,bio.ilike.%${q}%`)
        }

        const { data: users, error } = await query

        if (error) {
            console.error(error)
            return res.status(500).json({ error: error.message })
        }

        return res.json(users)
    }

    return res.status(405).json({ error: 'Method Not Allowed' })
}