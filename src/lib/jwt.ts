import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.JWT_SECRET ?? "";
const TTL = 60 * 60 * 24 * 7; // 7 days in seconds

if (SECRET.length < 32) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
}

export interface JwtPayload {
  sub: string;
  username: string | null;
  role: "user" | "admin";
  iat: number;
  exp: number;
}

function b64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const full: JwtPayload = { ...payload, iat: now, exp: now + TTL };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(full));
  const sig = createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest();
  return `${header}.${body}.${b64url(sig)}`;
}

export function verifyToken(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("invalid token");
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest();
  const actual = Buffer.from(sig, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error("invalid signature");
  }
  const payload: JwtPayload = JSON.parse(
    Buffer.from(body, "base64url").toString()
  );
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("token expired");
  }
  return payload;
}
