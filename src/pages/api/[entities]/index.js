import { entitiesRoute } from '@daveyplate/supabase-swr-entities/server'
import { createClient } from '@/utils/supabase/api'

export default async (req, res) => {
    const supabase = createClient(req, res)

    const response = await entitiesRoute({
        supabase,
        ...req
    })

    res.status(response.status).json(response.body)
}