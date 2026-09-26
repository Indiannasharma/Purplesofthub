"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Header refresh — revalidates server-rendered dashboard data via
 * router.refresh() (no full page reload, no new subscriptions).
 *
 * Styled with the shared `.cc-btn` / `.cc-btn-ghost` primitives instead of the
 * TailAdmin shadcn Button so it inherits Command Center tokens directly.
 */
export function RefreshButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <button
      type="button"
      aria-label="Refresh dashboard"
      disabled={pending}
      className="cc-btn cc-btn-ghost disabled:opacity-60"
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw className={cn("h-4 w-4", pending && "animate-spin")} aria-hidden="true" />
      <span className={compact ? "hidden sm:inline" : undefined}>
        {pending ? "Refreshing" : "Refresh"}
      </span>
    </button>
  );
}
