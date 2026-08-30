"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import en from "@/lib/i18n/en";
import es from "@/lib/i18n/es";

export type Locale = "en" | "es";

const STORAGE_KEY = "ar-lang";
const SUPPORTED: Locale[] = ["en", "es"];
const TRANSLATIONS: Record<Locale, typeof en> = { en, es };

function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(acc, flatten(v as Record<string, unknown>, key));
    } else {
      acc[key] = String(v);
    }
    return acc;
  }, {});
}

interface I18nState {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (lang: Locale) => void;
}

const I18nContext = createContext<I18nState>({
  locale: "en",
  t: (key) => key,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [flat, setFlat] = useState<Record<string, string>>(
    () => flatten(en as unknown as Record<string, unknown>)
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const browser = (navigator.language || "en").slice(0, 2).toLowerCase() as Locale;
    const detected = (stored && SUPPORTED.includes(stored))
      ? stored
      : (SUPPORTED.includes(browser) ? browser : "en");

    if (detected !== "en") {
      setFlat(flatten(TRANSLATIONS[detected] as unknown as Record<string, unknown>));
      setLocaleState(detected);
    }
  }, []);

  const setLocale = useCallback((lang: Locale) => {
    setFlat(flatten(TRANSLATIONS[lang] as unknown as Record<string, unknown>));
    setLocaleState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let str = flat[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [flat]
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
