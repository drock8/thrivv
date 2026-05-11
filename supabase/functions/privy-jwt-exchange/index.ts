import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const PRIVY_APP_ID = Deno.env.get("PRIVY_APP_ID")!;
const PRIVY_APP_SECRET = Deno.env.get("PRIVY_APP_SECRET")!;
const SUPABASE_JWT_SECRET = Deno.env.get("SUPABASE_JWT_SECRET")!;

const PRIVY_JWKS_URL = "https://auth.privy.io/.well-known/jwks.json";

let cachedJWKS: jose.JSONWebKeySet | null = null;
let jwksFetchedAt = 0;
const JWKS_CACHE_MS = 10 * 60 * 1000;

async function getPrivyJWKS(): Promise<jose.JSONWebKeySet> {
  if (cachedJWKS && Date.now() - jwksFetchedAt < JWKS_CACHE_MS) {
    return cachedJWKS;
  }
  const res = await fetch(PRIVY_JWKS_URL);
  cachedJWKS = await res.json();
  jwksFetchedAt = Date.now();
  return cachedJWKS!;
}

async function verifyPrivyToken(token: string): Promise<jose.JWTPayload> {
  const jwks = await getPrivyJWKS();
  const keyStore = jose.createLocalJWKSet(jwks);
  const { payload } = await jose.jwtVerify(token, keyStore, {
    issuer: "privy.io",
    audience: PRIVY_APP_ID,
  });
  return payload;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  const privyToken = authHeader?.replace("Bearer ", "");

  if (!privyToken) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const claims = await verifyPrivyToken(privyToken);
    const privyUserId = claims.sub!;

    const secret = new TextEncoder().encode(SUPABASE_JWT_SECRET);
    const supabaseToken = await new jose.SignJWT({
      sub: privyUserId,
      role: "authenticated",
      aud: "authenticated",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    return new Response(JSON.stringify({ token: supabaseToken }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("JWT exchange failed:", err);
    return new Response(
      JSON.stringify({ error: "Invalid or expired Privy token" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
