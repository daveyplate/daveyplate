import { createClient } from '@/utils/supabase/api'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).appendHeader('Allow', 'GET').end()
        return
    }

    const supabase = createClient(req, res)
    await supabase.auth.signOut({ scope: "local" })

    res.redirect('/login')
}