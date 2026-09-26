"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

export type AdminShellProfile = {
  userId: string;
  email: string;
  fullName: string;
  role: "admin" | "client";
};

function initialsOf(value: string) {
  const source = value.trim() || "Admin";

  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Profile menu driven by the real authenticated profile (no hardcoded names).
 * Sign-out reuses the existing Supabase client sign-out flow.
 *
 * Presentation: Command Center (`--cc-*` tokens). The dropdown is portalled
 * into <body>, so it relies on the body-level token declaration in
 * app/styles/command-center.css rather than on `.cc-root` ancestry.
 */
export function AdminUserMenu({ profile }: { profile: AdminShellProfile }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  const displayName = profile.fullName.trim() || profile.email.split("@")[0] || "Administrator";

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    // Existing flow: clear the Supabase session client-side, then navigate to
    // sign-in (the previous admin shell used the same supabase.auth.signOut).
    await createClient().auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-[var(--cc-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)]"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--cc-accent-soft)] text-[11px] font-semibold text-[var(--cc-accent)]"
          >
            {initialsOf(displayName)}
          </span>
          <span className="hidden max-w-[140px] truncate text-xs font-semibold text-[var(--cc-text)] sm:inline-flex">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 border-[var(--cc-border)] bg-[var(--cc-surface)] text-[var(--cc-text)]"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cc-accent-soft)] text-xs font-semibold text-[var(--cc-accent)]"
            >
              {initialsOf(displayName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-[var(--cc-text-muted)]">{profile.email}</p>
            </div>
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--cc-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--cc-text-muted)]">
            <UserRound className="h-3 w-3" aria-hidden="true" />
            {profile.role === "admin" ? "Administrator" : "Client"}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--cc-border)]" />

        <DropdownMenuItem
          asChild
          className="focus:bg-[var(--cc-subtle)] focus:text-[var(--cc-text)]"
        >
          <Link href="/admin/settings">
            <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
            Admin settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cc-border)]" />

        <DropdownMenuItem
          onSelect={handleSignOut}
          disabled={signingOut}
          className="text-[var(--cc-error)] focus:bg-[var(--cc-subtle)] focus:text-[var(--cc-error)]"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          {signingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
