"use client";

import { useEffect } from "react";
import { initErrorLogger } from "@/lib/logger";

export function ErrorLoggerInit() {
  useEffect(() => {
    initErrorLogger();
  }, []);
  return null;
}
