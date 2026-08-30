"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { ToastProvider } from "@/hooks/useToast";
import { CurrentUserProvider } from "@/hooks/useCurrentUser";
import { I18nProvider } from "@/hooks/useI18n";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <LazyMotion features={domAnimation} strict>
        <ToastProvider>
          <CurrentUserProvider>{children}</CurrentUserProvider>
        </ToastProvider>
      </LazyMotion>
    </I18nProvider>
  );
}
