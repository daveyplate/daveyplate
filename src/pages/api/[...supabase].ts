import { NextRequest, NextResponse } from "next/server"
import { jwtVerify, SignJWT } from "jose"
import { createClient } from "@/utils/supabase/server"

export const config = {
    runtime: "edge",
    api: {
        bodyParser: false
    }
}

export default async (req: NextRequest): Promise<Response> => {
    // Begin Request Scope for createClient's cookies()
    NextResponse.next()

    // Get the Access Token from the Authorization header or the Session
    const supabase = await createClient()
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