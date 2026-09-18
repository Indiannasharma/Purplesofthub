"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

const BRAND_LOGO = "/images/logo/purplesoft-logo-main.png";

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
        <Button
          type="button"
          variant="ghost"
          className="h-10 gap-2 rounded-full px-1.5 sm:px-2"
          aria-label="Open account menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={BRAND_LOGO} alt="" />
            <AvatarFallback>{initialsOf(displayName)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate text-sm font-medium lg:inline-flex">
            {displayName}
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground lg:block" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={BRAND_LOGO} alt="" />
              <AvatarFallback>{initialsOf(displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <UserRound className="h-3 w-3" aria-hidden="true" />
            {profile.role === "admin" ? "Administrator" : "Client"}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/admin/settings">
            <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
            Admin settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={handleSignOut} disabled={signingOut}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}