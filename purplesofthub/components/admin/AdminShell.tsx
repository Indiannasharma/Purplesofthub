"use client";

import * as React from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { AdminSearchDialog } from "@/components/admin/AdminSearch";
import { AdminShellProvider } from "@/components/admin/admin-shell-context";
import type { AdminShellProfile } from "@/components/admin/AdminUserMenu";

type AdminShellProps = {
  children: React.ReactNode;
  profile: AdminShellProfile;
};

function AdminShellFrame({ children, profile }: AdminShellProps) {
  return (
    /**
     * The admin frame deliberately fills the viewport and owns its own scroll
     * container. This matches the previous admin shell exactly (which also used
     * a fixed, full-viewport frame) so every existing admin page keeps the
     * scroll behaviour it was built against — including the global
     * `.admin-main main { overflow: auto }` rule in app/globals.css.
     */
    <div className="admin-shell fixed inset-0 flex overflow-hidden bg-background text-foreground">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <AdminSidebar />

      <div className="admin-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar profile={profile} />

        <main
          id="admin-main"
          className="admin-content min-h-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
        >
          {children}
        </main>
      </div>

      {/* Palette is mounted once for the whole shell (mobile included). */}
      <AdminSearchDialog />
    </div>
  );
}

/**
 * Client-side composition layer for the Admin area.
 * Server-side authorization stays in app/admin/layout.tsx.
 */
export default function AdminShell({ children, profile }: AdminShellProps) {
  return (
    <AdminShellProvider>
      <AdminShellFrame profile={profile}>{children}</AdminShellFrame>
    </AdminShellProvider>
  );
}