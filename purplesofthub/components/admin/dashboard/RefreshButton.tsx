"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Subtle header refresh — revalidates server-rendered dashboard data via
 * router.refresh() (no full page reload, no new subscriptions).
 */
export function RefreshButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Refresh dashboard"
      disabled={pending}
      className="text-muted-foreground hover:text-foreground"
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw className={cn("h-4 w-4", pending && "animate-spin")} aria-hidden="true" />
      <span className={cn(compact && "hidden sm:inline")}>{pending ? "Refreshing" : "Refresh"}</span>
    </Button>
  );
}
