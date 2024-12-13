import { NextApiRequest, NextApiResponse } from 'next'
import { createProxyMiddleware } from 'http-proxy-middleware'
import jwt, { JwtPayload } from 'jsonwebtoken'

import { createClient } from '@/utils/supabase/api'

export const config = {
    api: {
        externalResolver: true,
        bodyParser: false
    }
}

const apiProxy = createProxyMiddleware({
    target: process.env.NEXT_PUBLIC_SUPABASE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api': '' }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createClient(req, res)
    const { data: { session } } = await supabase.auth.getSession()

    const accessToken = req.headers.authorization?.replace('Bearer ', '') || session?.access_token

    // Append is_server = true to JWT for RLS
    const decodedJwt = accessToken ? {
        ...jwt.verify(accessToken, process.env.SUPABASE_JWT_SECRET!) as JwtPayload,
        is_server: true
    } : { is_server: true }

    const newToken = jwt.sign(decodedJwt, process.env.SUPABASE_JWT_SECRET!)
    req.headers.authorization = `Bearer ${newToken}`

    if (!req.headers.apikey) {
        req.headers.apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }

    return new Promise((resolve, reject) => {
        apiProxy(req, res, (result) => {
            if (result instanceof Error) return reject(result)

            return resolve(result)
        })
    })
}