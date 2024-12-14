import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { signJWT, validateJWT } from "jsr:@cross/jwt"

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept-profile, content-profile, prefer",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
};

async function reqHandler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (accessToken) {
    const data = await validateJWT(
      accessToken,
      Deno.env.get("SUPA_JWT_SECRET"),
    );
    data.is_server = true;
    accessToken = await signJWT(data, Deno.env.get("SUPA_JWT_SECRET"));
  }

  const url = new URL(req.url);
  const reqPath = url.pathname.replace("/rest-proxy", "") + url.search;

  const result = await fetch(Deno.env.get("SUPA_URL") + reqPath, {
    method: req.method,
    headers: {
      ...req.headers,
      Authorization: `Bearer ${accessToken}`,
      ApiKey: Deno.env.get("SUPA_ANON_KEY"),
      "prefer": "return=representation",
    },
    body: req.body,
  });

  return new Response(result.body, {
    status: result.status,
    headers: {
      ...result.headers,
      ...corsHeaders,
    },
  });
}

Deno.serve(reqHandler);
