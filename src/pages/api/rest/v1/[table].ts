import { createClient } from '@/utils/supabase/api'
import { NextApiRequest, NextApiResponse } from 'next'
var jwt = require('jsonwebtoken')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createClient(req, res)
    const { table, ...query } = req.query

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

    // Construct the new query string
    const queryString = new URLSearchParams(query as Record<string, string>).toString()
    const url = `${supabaseUrl}/rest/v1/${table}${queryString ? `?${queryString}` : ''}`

    try {
        // Get the user's session
        const { data: { session } } = await supabase.auth.getSession()

        // Prepare headers
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        // If session exists, add the Authorization header
        if (session) {
            const decoded = jwt.verify(session.access_token, process.env.SUPABASE_JWT_SECRET)
            decoded.service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY
            const newToken = jwt.sign(decoded, process.env.SUPABASE_JWT_SECRET)

            headers['Authorization'] = `Bearer ${newToken}`
        }

        headers['ApiKey'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        const response = await fetch(url, {
            method: req.method,
            headers: headers,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        })

        const data = await response.json()

        res.status(response.status).json(data)
    } catch (error) {
        console.error('Error fetching from Supabase:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}