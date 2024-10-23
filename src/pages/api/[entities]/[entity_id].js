import { entityRoute } from '@daveyplate/supabase-swr-entities/server'
import Cors from "cors"
const cors = Cors()

import { createClient } from '@/utils/supabase/api'

import { runMiddleware } from '@/utils/utils'

export default async (req, res) => {
    await runMiddleware(req, res, cors)

    const supabase = createClient(req, res)

    const response = await entityRoute({
        supabase,
        ...req
    })

    res.status(response.status).json(response.body)
}