import { SupabaseClient } from "@supabase/supabase-js"
import { jwtVerify, SignJWT } from "jose"

import { headers } from "next/headers"
import { IncomingMessage } from "http"
import { NextApiRequest, NextApiResponse } from "next"

// export const config = { runtime: "edge" }

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, content-length, accept-profile, content-profile, prefer",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, CONNECT, TRACE",
    "Access-Control-Max-Age": "7200"
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    //=const supabase = createClient(req)

    // Required for Next Edge API Requests to be parsed out of the URL query
    const dynamicPathname = "supabase"

    const response = await supabaseApiProxy({
        // supabase,
        req,
        parseUrl: (url) => url
            .split(`&${dynamicPathname}`)[0]
            .split(`?${dynamicPathname}`)[0]
    })

    // Determine content type and send response accordingly
    const contentType = response.headers.get('content-type') || ""

    if (contentType.includes('application/json')) {
        const data = await response.json()
        res.json(data)
    } else if (contentType.startsWith('image/') || contentType.includes('application/octet-stream')) {
        const buffer = await response.arrayBuffer()
        res.send(Buffer.from(buffer))
    } else {
        const text = await response.text()
        res.send(text)
    }
}


/**
 * Parses the Supabase API pathname from provided URL
 */
function parseSupabaseUrl(url: string) {
    const regex = /(\/[^/]+\/v1)(\/[^?]*)(\?.*)?/
    const match = url.match(regex)

    if (match) {
        // Reconstruct the path including everything after '/v1'
        const pathSegment = match[1] + match[2]
        const queryString = match[3] || ''
        return pathSegment + queryString
    }

    throw new Error("Invalid URL")
}

/**
 * Fetches the Supabase API with the given options.
 * 
 * @param {SupabaseApiProxyOptions} options - The options for fetching the Supabase API.
 * @param {SupabaseClient | null} [options.supabaseClient] - Optional SupabaseClient for fallback Access Token.
 * @param {Request} options.request - Request or NextApiRequest object.
 * @param {(url: string) => string} [options.parseUrl] - Optional function to parse the URL.
 * @param {string | null} [options.supabaseUrl] - Your project's Supabase URL.
 * @param {string | null} [options.apiKey] - Supabase Anon API key.
 * @param {string | null} [options.jwtSecret] - Supabase JWT secret for re-signing tokens.
 * @param {boolean} [options.enableCors] - Whether to enable CORS headers.
 */

interface SupabaseApiProxyOptions {
    supabase?: SupabaseClient | null,
    req: Request | IncomingMessage,
    parseUrl?: (url: string) => string,
    supabaseUrl?: string | null,
    apiKey?: string | null,
    jwtSecret?: string | null,
    enableCors?: boolean
}

const supabaseApiProxy = async ({
    supabase,
    req,
    parseUrl,
    supabaseUrl,
    apiKey,
    jwtSecret,
    enableCors
}: SupabaseApiProxyOptions) => {
    // Load the Supabase Environment Variables
    supabaseUrl = supabaseUrl
        || process.env.NEXT_PUBLIC_SUPABASE_URL
        || process.env.SUPABASE_URL
        || process.env.SUPA_URL
    if (!supabaseUrl) throw new Error("supabaseUrl is required")

    let request = req as Request

    if (!(req instanceof Request)) {
        request = new Request(req.headers.host + req.url!, {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: (req as any).body ? JSON.stringify((req as any).body) : null
        })
    }

    // Handle CORS Preflight Requests
    if (enableCors && request.method == "OPTIONS") {
        return new Response(null, { headers: corsHeaders })
    }

    apiKey = apiKey
        || request.headers.get("apikey")
        || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        || process.env.SUPABASE_ANON_KEY
        || process.env.SUPA_ANON_KEY
    if (!apiKey) throw new Error("apiKey is required")

    jwtSecret = jwtSecret
        || process.env.SUPABASE_JWT_SECRET
        || process.env.SUPA_JWT_SECRET
    if (!jwtSecret) throw new Error("jwtSecret is required")

    // Get the Access Token from the Authorization Header or the Session
    const sessionResult = await supabase?.auth.getSession()
    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "") || sessionResult?.data?.session?.access_token
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)

    // Append is_server = true to the JWT for RLS
    const decodedJwt = accessToken ? {
        ...(await jwtVerify(accessToken, secret)).payload,
        is_server: true
    } : { is_server: true }

    // Re-sign the JWT
    const newToken = await new SignJWT(decodedJwt)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .sign(secret)

    // Build the Supabase API URL
    const pathname = parseSupabaseUrl(request.url)
    let url = supabaseUrl + pathname

    if (parseUrl) {
        url = parseUrl(url)
    }

    // Inherit the appropriate headers
    const inheritHeaders = ["content-length", "content-type", "prefer", "x-upsert", "accept-profile", "content-profile"]
    const forwardHeaders = Object.fromEntries(
        Object.entries(headers)
            .filter(([key]) => inheritHeaders.includes(key))
    )

    // Fetch the Supabase API
    const response = await fetch(url, {
        method: request.method,
        headers: {
            ...forwardHeaders,
            "apikey": apiKey,
            "authorization": `Bearer ${newToken}`,
        },
        body: request.body,
        duplex: "half"
    } as any)

    // Apply the CORS Headers
    if (enableCors) {
        Object.entries(corsHeaders).forEach(([key, value]: [string, string]) => {
            response.headers.set(key, value)
        })
    }

    return response
}