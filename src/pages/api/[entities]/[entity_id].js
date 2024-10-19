import { entityRoute } from '@daveyplate/supabase-swr-entities'
import Cors from "cors"
const cors = Cors()

import { createClient } from '@/utils/supabase/api'
import { createClient as createAdminClient } from '@/utils/supabase/service-role'
import entitySchemas from '@/utils/entity-schemas'

import { runMiddleware } from '@/utils/utils'

export default async (req, res) => {
    await runMiddleware(req, res, cors)

    const supabase = createClient(req, res)
    const supabaseAdmin = createAdminClient()

    const response = await entityRoute({
        supabase,
        supabaseAdmin,
        entitySchemas,
        ...req
    })

    res.status(response.status).json(response.body)
}