import { createClient } from "@/utils/supabase/edge"
import { NextRequest } from "next/server"
import { jwtVerify, SignJWT } from "jose"

export const config = {
    runtime: "edge",
    api: {
        bodyParser: false
    }
}

export default async (req: NextRequest): Promise<Response> => {
    // Get the Access Token from the Authorization header or the Session
    const supabase = createClient(req)
    const { data: { session } } = await supabase.auth.getSession()

    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)
    const accessToken = req.headers.get('authorization')?.replace('Bearer ', '') || session?.access_token

    // Append is_server = true to the JWT for RLS
    const decodedJwt = accessToken ? {
        ...(await jwtVerify(accessToken, secret)).payload,
        is_server: true
    } : { is_server: true }

    // Re-sign the JWT
    const newToken = await new SignJWT(decodedJwt)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(secret)

    // Build the Supabase API URL and remove the dynamic path from the query string
    const proxyUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        + req.nextUrl.pathname.replace("/api", "")
        + req.nextUrl.search.split("&supabase")[0].split("?supabase")[0]

    // Proxy the request to Supabase with the appropriate headers
    return await fetch(proxyUrl, {
        method: req.method,
        headers: {
            "x-upsert": req.headers.get("x-upsert") || 'false',
            "content-length": req.headers.get('content-length') || '0',
            "content-type": req.headers.get('content-type') || 'application/json',
            apikey: req.headers.get('apikey') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            authorization: `Bearer ${newToken}`,
            prefer: 'return=representation',
        },
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : null,
    })
}


/*
import { NextApiRequest, NextApiResponse } from 'next'
import { createProxyMiddleware } from 'http-proxy-middleware'
import jwt, { JwtPayload } from 'jsonwebtoken'

import { createClient } from '@/utils/supabase/api'

export const config = {
    runtime: 'edge',
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
    */