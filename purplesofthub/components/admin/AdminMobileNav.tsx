"use client";

import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAdminShell } from "@/components/admin/admin-shell-context";

/**
 * Mobile admin navigation.
 *
 * Radix Dialog (shadcn Sheet) provides the focus trap, Escape handling and
 * overlay-click dismissal. Route changes close the drawer through
 * `AdminShellProvider`.
 */
export function AdminMobileNav({ children }: { children: React.ReactNode }) {
  const { isMobileNavOpen, setMobileNavOpen } = useAdminShell();

  return (
    <Sheet open={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="left"
        className="w-[288px] max-w-[85vw] border-r border-[var(--cc-border)] bg-[var(--cc-surface)] p-0 text-[var(--cc-text)]"
      >
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate the PurpleSoftHub admin sections
        </SheetDescription>
        {children}
      </SheetContent>
    </Sheet>
  );
}