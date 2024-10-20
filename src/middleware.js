import { NextResponse } from 'next/server'
import { rateLimit } from '@daveyplate/next-rate-limit'

export function middleware(request) {
    const nextResponse = NextResponse.next()

    const rateLimitResponse = rateLimit({ request, nextResponse })
    if (rateLimitResponse) return rateLimitResponse

    return nextResponse
}

// Apply middleware to all API routes
export const config = {
    matcher: '/api/:path*'
}