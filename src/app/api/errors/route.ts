import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

type Priority = "low" | "medium" | "high" | "critical";
type Source = "frontend" | "backend";

const SECTIONS = ["feed", "create", "rankings", "profile", "auth", "api", "landing", "legal", "groups"] as const;
type Section = (typeof SECTIONS)[number];

function resolvePriority(section: Section | undefined, source: Source, explicit?: string): Priority {
  if (explicit === "critical" || explicit === "high" || explicit === "medium" || explicit === "low") {
    return explicit;
  }
  if (source === "backend" || section === "auth") return "high";
  if (section === "create") return "medium";
  if (section === "feed" || section === "landing") return "low";
  return "medium";
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok, retryAfter } = rateLimit(`errors:${ip}`, 30, 60_000);

  if (!ok) {
    return NextResponse.json({ ok: true }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const title = String(body.title ?? "Unknown error").slice(0, 200);
  const message = body.message ? String(body.message).slice(0, 2000) : null;
  const stack = body.stack ? String(body.stack).slice(0, 5000) : null;
  const rawSection = body.section as string | undefined;
  const section: Section | undefined = SECTIONS.includes(rawSection as Section) ? (rawSection as Section) : undefined;
  const source: Source = body.source === "backend" ? "backend" : "frontend";
  const url = body.url ? String(body.url).slice(0, 500) : null;
  const userId = body.user_id ? String(body.user_id).slice(0, 36) : null;
  const priority = resolvePriority(section, source, body.priority as string | undefined);
  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

  await supabase.from("aura_error_logs").insert({
    title,
    message,
    stack,
    section: section ?? null,
    source,
    url,
    user_id: userId,
    priority,
    metadata,
  });

  return NextResponse.json({ ok: true });
}
