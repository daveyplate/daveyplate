import { NextResponse } from 'next/server'
import { rateLimit } from '@daveyplate/next-rate-limit'

export function middleware(request) {
    const response = NextResponse.next()

    if (process.env.NODE_ENV == 'production') {
        const rateLimitResponse = rateLimit({ request, response })
        if (rateLimitResponse) return rateLimitResponse
    }

    return response
}

// Apply middleware to all API routes
export const config = {
    matcher: '/api/:path*'
}