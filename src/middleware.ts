import { nextCors } from '@daveyplate/next-cors-middleware'
import { rateLimit } from '@daveyplate/next-rate-limit'
import { NextRequest } from 'next/server'

const allowedOrigins = ['http://localhost:3000']

export function middleware(request: NextRequest) {
    // CORS
    const response = nextCors({ request, allowedOrigins })

    // Rate Limiting
    return rateLimit({ request, response, upstash: { enabled: false, analytics: true } })
}

// Apply middleware to all API routes
export const config = {
    matcher: '/api/:path*'
}