import { entitiesRoute } from '@daveyplate/supabase-swr-entities/server'
import { createClient } from '@/utils/supabase/api'
import { NextApiRequest, NextApiResponse } from 'next'
import { HTTP_METHOD } from 'next/dist/server/web/http'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const supabase = createClient(req, res)

    const { status, body } = await entitiesRoute({
        supabase,
        headers: req.headers,
        method: req.method as HTTP_METHOD,
        query: req.query,
        body: req.body
    })

    res.status(status).json(body)
}