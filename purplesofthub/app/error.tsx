"use client";

import { useEffect } from "react";
import { StatusSurface } from "@/components/auth/status-surface";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return <StatusSurface title="Something went wrong" description="We hit an unexpected error. Please try refreshing — if the issue persists, contact us on WhatsApp." code="Unexpected error" reset={reset} details={process.env.NODE_ENV === "development" ? error.message + (error.digest ? `\nDigest: ${error.digest}` : "") : undefined} />;
}
