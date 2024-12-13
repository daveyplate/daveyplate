import { nextCors } from '@daveyplate/next-cors-middleware'
import { rateLimit } from '@daveyplate/next-rate-limit'
import { NextRequest } from 'next/server'

const allowedOrigins = ['http://localhost:3000']

export async function middleware(request: NextRequest) {
    // CORS
    const response = nextCors({ request, allowedOrigins })

    // Rate Limiting
    const rateLimitResponse = rateLimit({ request, response, ipLimit: 10, sessionLimit: 90000 })
    if (rateLimitResponse) return rateLimitResponse

    return response
}

// Apply middleware to all API routes
export const config = {
    matcher: '/api/:path*'
}