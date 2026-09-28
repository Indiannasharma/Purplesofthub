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
          className="flex max-w-[168px] items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-[var(--cc-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)] sm:max-w-[190px]"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--cc-accent-soft)] text-[11px] font-semibold text-[var(--cc-accent)]"
          >
            {initialsOf(displayName)}
          </span>
          <span className="hidden min-w-0 truncate text-xs font-semibold text-[var(--cc-text)] sm:inline-block">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(300px,calc(100vw-24px))] rounded-xl border-[var(--cc-border)] bg-[var(--cc-surface)] p-1.5 text-[var(--cc-text)] shadow-xl"
      >
        <DropdownMenuLabel className="px-2.5 py-2 font-normal">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cc-accent-soft)] text-xs font-semibold text-[var(--cc-accent)]"
            >
              {initialsOf(displayName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-5 text-[var(--cc-text)]">
                {displayName}
              </p>
              <p className="truncate text-xs leading-5 text-[var(--cc-text-muted)]">{profile.email}</p>
              <p className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[var(--cc-subtle)] px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.12em] text-[var(--cc-text-muted)]">
                <UserRound className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{profile.role === "admin" ? "Administrator" : "Client"}</span>
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[var(--cc-border)]" />

        <DropdownMenuItem
          asChild
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[var(--cc-text-secondary)] focus:bg-[var(--cc-subtle)] focus:text-[var(--cc-text)]"
        >
          <Link href="/admin/settings">
            <Settings className="h-4 w-4 shrink-0 text-[var(--cc-text-muted)]" aria-hidden="true" />
            <span className="min-w-0 truncate">Admin settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--cc-border)]" />

        <DropdownMenuItem
          onSelect={handleSignOut}
          disabled={signingOut}
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[var(--cc-error)] focus:bg-[var(--cc-subtle)] focus:text-[var(--cc-error)]"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{signingOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
