import { createClient } from '@/utils/supabase/api'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { NextApiRequest, NextApiResponse } from 'next'
import jwt, { JwtPayload } from 'jsonwebtoken'

const apiProxy = createProxyMiddleware({
    target: process.env.NEXT_PUBLIC_SUPABASE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api': ''
    },
    on: {
        proxyReq: async (proxyReq) => {
            // console.log("remove forwarding headrs")
            // proxyReq.removeHeader('X-Forwarded-Host')
        }
    }
})

export const config = {
    api: {
        externalResolver: true,
        bodyParser: false
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createClient(req, res)
    const { data: { session } } = await supabase.auth.getSession()

    // If session exists, append is_server to the JWT and add the Authorization header
    if (session) {
        const decoded = jwt.verify(session.access_token, process.env.SUPABASE_JWT_SECRET!) as JwtPayload

        if (decoded) {
            decoded.is_server = true
            const newToken = jwt.sign(decoded, process.env.SUPABASE_JWT_SECRET!)
            delete req.headers['authorization']
            delete req.headers['Authorization']
            req.headers['authorization'] = `Bearer ${newToken}`
        }
    }

    return new Promise((resolve, reject) => {
        apiProxy(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
}