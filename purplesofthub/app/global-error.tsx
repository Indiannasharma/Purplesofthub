"use client";

import { useEffect } from "react";
import { StatusSurface } from "@/components/auth/status-surface";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return <html lang="en"><body className="auth-global-error" style={{ margin: 0 }}><StatusSurface title="Something went wrong" description="We encountered an unexpected issue. Please refresh the page." code="Unexpected error" reset={reset} showTheme={false} /></body></html>;
}
