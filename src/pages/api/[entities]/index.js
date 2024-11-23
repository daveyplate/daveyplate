import { entitiesRoute } from '@daveyplate/supabase-swr-entities/server'
import { createClient } from '@/utils/supabase/api'

export default async (req, res) => {
    const supabase = createClient(req, res)

    const { status, body } = await entitiesRoute({
        supabase,
        ...req
    })

    res.status(status).json(body)
}