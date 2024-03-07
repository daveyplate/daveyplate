import applyRateLimit from '@/utils/apply-rate-limit'
import { createClient } from '@/utils/supabase/service-role'
import { runMiddleware } from '@/utils/utils'

import Cors from "cors"
const cors = Cors()

export default async (req, res) => {
    await applyRateLimit(req, res)
    await runMiddleware(req, res, cors)

    // Get the public profile of a user
    if (req.method === 'GET') {
        // res.setHeader('Cache-Control', 'public, s-maxage=10, max-age=10, stale-while-revalidate=59')

        const supabase = createClient()

        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, avatar_url, claims, bio')
            .eq('id', req.query.user_id)
            .single()

        if (error) {
            console.error(error)
            return res.status(500).json({ error: error.message })
        }

        return res.json(user)
    }

    return res.status(405).json({ error: 'Method Not Allowed' })
}