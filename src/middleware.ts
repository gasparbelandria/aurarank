import { NextRequest, NextResponse } from "next/server";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const isDev = process.env.NODE_ENV !== "production";

const SECURITY_HEADERS: [string, string][] = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["X-XSS-Protection", "1; mode=block"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
  ...(isDev ? [] : [["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"] as [string, string]]),
  [
    "Content-Security-Policy",
    [
      "default-src 'self'",
      // 'unsafe-eval' required by React/Turbopack in dev for source maps and call stack reconstruction
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://accounts.google.com https://www.youtube.com https://s.ytimg.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://oauth2.googleapis.com https://www.googleapis.com https://*.supabase.co",
      "frame-src https://www.youtube.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(!isDev ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  ],
];

function applySecurityHeaders(res: NextResponse) {
  for (const [key, value] of SECURITY_HEADERS) {
    res.headers.set(key, value);
  }
}

function base64urlToBytes(str: string): Uint8Array<ArrayBuffer> {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getJwtClaims(
  token: string
): Promise<{ valid: boolean; username?: string | null }> {
  const secret = process.env.JWT_SECRET ?? "";
  if (!secret || secret.length < 32) return { valid: false };

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };
    const [header, payload, sig] = parts;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlToBytes(sig),
      encoder.encode(`${header}.${payload}`)
    );

    if (!valid) return { valid: false };

    const claims = JSON.parse(decoder.decode(base64urlToBytes(payload)));
    if (claims.exp < Math.floor(Date.now() / 1000)) return { valid: false };

    return { valid: true, username: claims.username ?? null };
  } catch {
    return { valid: false };
  }
}

function clearAuthCookie(res: NextResponse) {
  res.cookies.set("ar_token", "", { maxAge: 0, path: "/" });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("ar_token")?.value;

  // Logged-in users don't need the auth pages
  if (pathname === "/login") {
    if (token) {
      const { valid } = await getJwtClaims(token);
      if (valid) {
        const res = NextResponse.redirect(new URL("/feed", req.url));
        applySecurityHeaders(res);
        return res;
      }
    }
    const res = NextResponse.next();
    applySecurityHeaders(res);
    return res;
  }

  // All other matched routes require a valid JWT
  if (!token) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    applySecurityHeaders(res);
    return res;
  }

  const { valid } = await getJwtClaims(token);

  if (!valid) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    clearAuthCookie(res);
    applySecurityHeaders(res);
    return res;
  }

  // Prevent bfcache so the browser never shows a stale protected page
  // after logout when the user hits the back button
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  applySecurityHeaders(res);
  return res;
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/create/:path*",
    "/profile/:path*",
    "/rankings/:path*",
    "/rankings",
    "/my-posts/:path*",
    "/my-posts",
    "/account/:path*",
    "/account",
    "/setup/:path*",
    "/setup",
    "/groups/:path*",
    "/groups",
    "/help/:path*",
    "/help",
    "/login",
  ],
};
