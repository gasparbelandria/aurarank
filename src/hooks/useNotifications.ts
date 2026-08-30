"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AppNotification } from "@/lib/types";

const POLL_INTERVAL = 30_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/notifications").catch(() => null);
    if (!res?.ok) return;
    const data: AppNotification[] = await res.json().catch(() => []);
    setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch_();
    intervalRef.current = setInterval(fetch_, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch_]);

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications", { method: "PATCH" }).catch(() => null);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, refresh: fetch_, markAllRead };
}
