import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import { serialize } from 'cookie'
import { v4 as uuidv4 } from 'uuid' // Ensure you have `uuid` installed

export const applyMiddleware = (middleware) => (request, response) =>
    new Promise((resolve, reject) => {
        middleware(request, response, (result) =>
            result instanceof Error ? reject(result) : resolve(result)
        )
    })

const getSessionId = (request, response) => {
    let sessionId = request.cookies['session_id']
    if (!sessionId) {
        sessionId = uuidv4()
        const cookie = serialize('session_id', sessionId, { httpOnly: true, sameSite: 'strict', path: '/' })
        response.setHeader('Set-Cookie', cookie)
    }
    return sessionId
}

const getIP = (request) =>
    request.ip ||
    request.headers['x-forwarded-for']?.split(',').shift() ||
    request.headers['x-real-ip'] ||
    request.connection.remoteAddress

export const getRateLimitMiddlewares = ({
    sessionLimit = 60, // 60 Requests per session
    ipLimit = 600, // 600 Requests per IP (10 users)
    windowMs = 30 * 1000, // Per 30 seconds
    delayMs = () => 500,
} = {}) => [
        // Session-based slowing down and rate limiting
        slowDown({ keyGenerator: getSessionId, windowMs, delayAfter: Math.round(sessionLimit / 2), delayMs }),
        rateLimit({ keyGenerator: getSessionId, windowMs, max: sessionLimit, delayMs: delayMs }),

        // IP-based slowing down and rate limiting (more lenient)
        slowDown({ keyGenerator: getIP, windowMs, delayAfter: Math.round(ipLimit / 2), delayMs }),
        rateLimit({ keyGenerator: getIP, windowMs, max: ipLimit }),
    ]

const middlewares = getRateLimitMiddlewares()

async function applyRateLimit(request, response, rateLimitMiddlewares = middlewares) {
    await Promise.all(
        rateLimitMiddlewares
            .map(applyMiddleware)
            .map(middleware => middleware(request, response))
    )
}

export default applyRateLimit
