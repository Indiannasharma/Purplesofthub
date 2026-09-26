"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  adminNavigationSections,
  adminQuickActions,
  type AdminNavItem,
} from "@/lib/admin-navigation";
import { useAdminShell } from "@/components/admin/admin-shell-context";

/** Visible entry point rendered in the topbar. */
export function AdminSearchTrigger() {
  const { setSearchOpen } = useAdminShell();

  return (
    <>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Search admin sections"
        className="hidden h-8 items-center gap-2 rounded-lg border border-[var(--cc-border)] bg-[var(--cc-subtle)] px-2.5 text-xs text-[var(--cc-text-muted)] transition-colors hover:border-[var(--cc-border-strong)] hover:text-[var(--cc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)] xl:inline-flex"
      >
        <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">Search or jump to…</span>
        <kbd className="ml-2 inline-flex shrink-0 items-center gap-0.5 rounded border border-[var(--cc-border)] bg-[var(--cc-surface)] px-1 py-0.5 text-[10px] font-medium">
          Ctrl
          <span aria-hidden="true">K</span>
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Search admin sections"
        className="cc-icon-btn cc-icon-btn-sm xl:hidden"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </>
  );
}

/**
 * Navigation/action palette for existing admin routes only.
 * Entity (database) search is intentionally out of scope for this phase.
 */
export function AdminSearchDialog() {
  const router = useRouter();
  const { isSearchOpen, setSearchOpen } = useAdminShell();

  const go = React.useCallback(
    (href: string) => {
      setSearchOpen(false);
      router.push(href);
    },
    [router, setSearchOpen]
  );

  const renderItem = (item: AdminNavItem) => (
    <CommandItem
      key={item.id}
      value={`${item.title} ${item.href}`}
      onSelect={() => go(item.href)}
      className="text-[var(--cc-text-secondary)] aria-selected:bg-[var(--cc-subtle)] aria-selected:text-[var(--cc-text)]"
    >
      <item.icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.title}</span>
      <span className="ml-auto truncate text-[11px] text-[var(--cc-text-muted)]">{item.href}</span>
    </CommandItem>
  );

  return (
    <CommandDialog
      open={isSearchOpen}
      onOpenChange={setSearchOpen}
      contentClassName="border-[var(--cc-border)] bg-[var(--cc-surface)] text-[var(--cc-text)]"
    >
      <CommandInput
        placeholder="Jump to an admin section or action…"
        className="text-[var(--cc-text)] placeholder:text-[var(--cc-text-muted)]"
      />
      <CommandList>
        <CommandEmpty>No matching section.</CommandEmpty>

        {adminNavigationSections.map((section) => (
          <CommandGroup key={section.id} heading={section.title}>
            {section.items.map(renderItem)}
          </CommandGroup>
        ))}

        <CommandGroup heading="Create">
          {adminQuickActions.map(renderItem)}
        </CommandGroup>
      </CommandList>

      <div className="flex items-center gap-2 border-t border-[var(--cc-border)] px-3 py-2 text-[11px] text-[var(--cc-text-muted)]">
        <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
        Open
        <span className="mx-1 text-[var(--cc-border-strong)]">·</span>
        <kbd className="rounded border border-[var(--cc-border)] bg-[var(--cc-subtle)] px-1 py-0.5">
          Esc
        </kbd>
        Close
      </div>
    </CommandDialog>
  );
}
