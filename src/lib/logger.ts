type Priority = "low" | "medium" | "high" | "critical";
type Source = "frontend" | "backend";

interface LogErrorOpts {
  message?: string;
  stack?: string;
  section?: string;
  source?: Source;
  priority?: Priority;
  userId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

const SECTION_MAP: Record<string, string> = {
  "/feed": "feed",
  "/create": "create",
  "/rankings": "rankings",
  "/profile": "profile",
  "/login": "auth",
  "/signup": "auth",
  "/setup": "auth",
  "/groups": "groups",
  "/help": "legal",
  "/terms": "legal",
  "/privacy": "legal",
};

export function detectSection(pathname: string): string {
  for (const [prefix, section] of Object.entries(SECTION_MAP)) {
    if (pathname.startsWith(prefix)) return section;
  }
  if (pathname === "/") return "landing";
  return "api";
}

export function logError(title: string, opts: LogErrorOpts = {}): void {
  const url = typeof window !== "undefined" ? window.location.href : opts.url;
  const section = opts.section ?? (url ? detectSection(new URL(url).pathname) : undefined);

  void fetch("/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: String(title).slice(0, 200),
      message: opts.message ? String(opts.message).slice(0, 2000) : undefined,
      stack: opts.stack ? String(opts.stack).slice(0, 5000) : undefined,
      section,
      source: opts.source ?? "frontend",
      priority: opts.priority,
      user_id: opts.userId,
      url,
      metadata: opts.metadata,
    }),
  }).catch(() => {});
}

export async function logServerError(title: string, opts: LogErrorOpts = {}): Promise<void> {
  const section = opts.section ?? (opts.url ? detectSection(new URL(opts.url).pathname) : "api");

  const priorityMap: Record<string, Priority> = {
    backend: "high",
    auth: "high",
    create: "medium",
    feed: "low",
    landing: "low",
  };
  const priority = opts.priority ?? priorityMap[section] ?? "medium";

  const { supabase } = await import("./supabase");
  await supabase.from("aura_error_logs").insert({
    title: String(title).slice(0, 200),
    message: opts.message ? String(opts.message).slice(0, 2000) : null,
    stack: opts.stack ? String(opts.stack).slice(0, 5000) : null,
    section: section ?? null,
    source: opts.source ?? "backend",
    priority,
    user_id: opts.userId ?? null,
    url: opts.url ?? null,
    metadata: opts.metadata ?? {},
  });
}

export function initErrorLogger(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (e) => {
    logError(e.message || "Uncaught error", {
      stack: e.error?.stack,
      source: "frontend",
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const msg =
      e.reason instanceof Error ? e.reason.message : String(e.reason ?? "Unhandled promise rejection");
    logError(msg, {
      stack: e.reason instanceof Error ? e.reason.stack : undefined,
      source: "frontend",
    });
  });
}
