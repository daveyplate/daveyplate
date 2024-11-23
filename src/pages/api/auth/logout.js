import { createClient } from '@/utils/supabase/api'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).appendHeader('Allow', 'GET').end()
        return
    }

    const supabase = createClient(req, res)
    await supabase.auth.signOut({ scope: "local" })

    res.redirect('/login')
}