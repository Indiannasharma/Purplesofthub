import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * One content boundary for every upgraded Admin module.
 * The shell owns viewport scrolling; AdminPage owns readable line length,
 * horizontal gutters, vertical rhythm, and Nova-safe bottom space.
 */
export function AdminPage({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "admin-page mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-5 pb-24 sm:px-6 sm:py-7 sm:pb-24 lg:px-8 lg:py-8",
        className
      )}
    >
      {children}
    </div>
  );
}
