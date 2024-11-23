import { rateLimit } from '@daveyplate/next-rate-limit'
import { nextCors } from '@daveyplate/next-cors-middleware'

const allowedOrigins = ['http://localhost:3000']

export function middleware(request) {
  // CORS
  const response = nextCors({ request, allowedOrigins })

  // Rate Limiting
  if (process.env.NODE_ENV === 'production') {
    const rateLimitResponse = rateLimit({ request, response })
    if (rateLimitResponse) return rateLimitResponse
  }

  return response
}

// Apply middleware to all API routes
export const config = {
  matcher: '/api/:path*'
}