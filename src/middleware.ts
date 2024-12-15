import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { nextCors } from '@daveyplate/next-cors-middleware'
import { rateLimit } from '@daveyplate/next-rate-limit'
import { createClient } from './utils/supabase/server'
import { jwtVerify } from "jose"

const allowedOrigins = ['http://localhost:3000']

export async function middleware(request: NextRequest, event: NextFetchEvent) {
    // CORS
    const response = nextCors({ request, allowedOrigins })

    // TODO: @daveyplate/supabase-verify-jwt
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
    const jwt = session ? (await jwtVerify(session.access_token, secret)).payload : null
    if (session && !jwt) return NextResponse.json({ "message": "Invalid JWT" }, { status: 401 })

    // Rate Limiting
    const { pending, rateLimitedResponse } = await rateLimit({
        identifier: jwt?.sub,
        request,
        response,
        upstash: {
            enabled: true,
            sliding: true,
            analytics: true,
        }
    })

    if (pending) event.waitUntil(pending)
    if (rateLimitedResponse) return rateLimitedResponse

    return response
}

// Apply middleware to all API routes
export const config = {
    matcher: '/api/:path*'
}