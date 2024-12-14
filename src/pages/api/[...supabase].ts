import { NextRequest } from "next/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { jwtVerify, SignJWT } from "jose"

import { createClient } from "@/utils/supabase/edge"

export const config = { runtime: "edge" }

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, content-length, accept-profile, content-profile, prefer",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, CONNECT, TRACE",
    "Access-Control-Max-Age": "7200"
}

export default async (req: NextRequest) => {
    const supabase = createClient(req)
    const dynamicPathname = "supabase"

    return fetchSupabaseAPI({
        supabaseClient: supabase,
        method: req.method,
        pathname: req.nextUrl.pathname.replace("/api", ""),
        query: req.nextUrl.search.split(`&${dynamicPathname}`)[0].split(`?${dynamicPathname}`)[0],
        headers: Object.fromEntries(req.headers.entries()),
        body: req.body
    })
}

interface FetchSupabaseOptions {
    supabaseClient?: SupabaseClient | null,
    supabaseUrl?: string | null,
    apiKey?: string | null,
    jwtSecret?: string | null,
    method: string,
    pathname: string,
    query?: string | null,
    headers: Record<string, any>,
    body?: BodyInit | null,
    enableCors?: boolean
}

/**
 * Fetches the Supabase API with the given options.
 * 
 * @param {FetchSupabaseOptions} options - The options for fetching the Supabase API.
 * @param {SupabaseClient | null} [options.supabaseClient] - Optional SupabaseClient for fallback Access Token.
 * @param {string | null} [options.supabaseUrl] - Your project's Supabase URL.
 * @param {string | null} [options.apiKey] - Supabase Anon API key.
 * @param {string | null} [options.jwtSecret] - Supabase JWT secret for re-signing tokens.
 * @param {string} options.method - HTTP Method.
 * @param {string} options.pathname - The Supabase API pathname for the request.
 * @param {string | null} [options.query] - The query string for the request.
 * @param {Record<string, any>} options.headers - The headers for the request.
 * @param {BodyInit | null} [options.body] - The body for the request.
 * @param {boolean} [options.enableCors] - Whether to enable CORS headers.
 */
const fetchSupabaseAPI = async ({
    supabaseClient,
    supabaseUrl,
    apiKey,
    jwtSecret,
    method,
    pathname,
    query,
    headers,
    body,
    enableCors
}: FetchSupabaseOptions) => {
    // Handle CORS Preflight Requests
    if (enableCors && method == "OPTIONS") {
        return new Response(null, { headers: corsHeaders })
    }

    // Load the Supabase Environment Variables
    supabaseUrl = supabaseUrl
        || process.env.NEXT_PUBLIC_SUPABASE_URL
        || process.env.SUPABASE_URL
        || process.env.SUPA_URL
    if (!supabaseUrl) throw new Error("supabaseUrl is required")

    apiKey = apiKey
        || headers["apikey"]
        || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        || process.env.SUPABASE_ANON_KEY
        || process.env.SUPA_ANON_KEY
    if (!apiKey) throw new Error("apiKey is required")

    jwtSecret = jwtSecret
        || process.env.SUPABASE_JWT_SECRET
        || process.env.SUPA_JWT_SECRET
    if (!jwtSecret) throw new Error("jwtSecret is required")

    // Get the Access Token from the Authorization Header or the Session
    const sessionResult = await supabaseClient?.auth.getSession()
    const accessToken = headers.authorization?.replace("Bearer ", "") || sessionResult?.data?.session?.access_token
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
    const proxyUrl = supabaseUrl + pathname + query

    // Inherit the appropriate headers
    const inheritHeaders = ["content-length", "content-type", "prefer", "x-upsert", "accept-profile", "content-profile"]
    const forwardHeaders = Object.fromEntries(
        Object.entries(headers)
            .filter(([key]) => inheritHeaders.includes(key))
    )

    // Fetch the Supabase API
    const response = await fetch(proxyUrl, {
        method,
        headers: {
            ...forwardHeaders,
            "apikey": apiKey,
            "authorization": `Bearer ${newToken}`,
        },
        body
    })

    // Apply the CORS Headers
    if (enableCors) {
        Object.entries(corsHeaders).forEach(([key, value]: [string, string]) => {
            response.headers.set(key, value)
        })
    }

    return response
}