import { entitiesRoute } from '@daveyplate/supabase-swr-entities/server'
import Cors from "cors"
const cors = Cors()

import { createClient } from '@/utils/supabase/api'
import { createClient as createAdminClient } from '@/utils/supabase/service-role'

import { runMiddleware } from '@/utils/utils'

export default async (req, res) => {
    await runMiddleware(req, res, cors)

    const supabase = createClient(req, res)
    const supabaseAdmin = createAdminClient()

    const response = await entitiesRoute({
        supabase,
        supabaseAdmin,
        ...req
    })

    res.status(response.status).json(response.body)
}