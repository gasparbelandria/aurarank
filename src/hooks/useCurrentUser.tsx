"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export interface CurrentUser {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: "user" | "admin";
  totalUsers: number;
}

interface CurrentUserState {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const noop = async () => {};
const CurrentUserContext = createContext<CurrentUserState>({ user: null, loading: true, refresh: noop });

const PUBLIC_PATHS = ["/login", "/forgot-password"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    const data = await fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    setUser(data);
  }, []);

  useEffect(() => {
    if (isPublicPath(pathname)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchUser().finally(() => setLoading(false));
  }, [pathname, fetchUser]);

  return (
    <CurrentUserContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
