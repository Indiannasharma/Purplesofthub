"use client";

import * as React from "react";
import { ccFontVariables } from "@/components/command-center/fonts";
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
        className="admin-search-expanded hidden h-8 items-center gap-2 rounded-lg border border-[var(--cc-border)] bg-[var(--cc-subtle)] px-2.5 text-xs text-[var(--cc-text-muted)] transition-colors hover:border-[var(--cc-border-strong)] hover:text-[var(--cc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)] xl:inline-flex"
      >
        <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">Search or jump to...</span>
        <kbd className="ml-2 inline-flex shrink-0 items-center gap-0.5 rounded border border-[var(--cc-border)] bg-[var(--cc-surface)] px-1 py-0.5 text-[10px] font-medium">
          Ctrl
          <span aria-hidden="true">K</span>
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Search admin sections"
        className="admin-search-compact cc-icon-btn cc-icon-btn-sm xl:hidden"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </>
  );
}

/**
 * Navigation/action palette for existing admin routes only.
 * Entity search is intentionally out of scope for this phase.
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
      className="gap-3 rounded-xl text-[var(--cc-text-secondary)] aria-selected:bg-[var(--cc-subtle)] aria-selected:text-[var(--cc-text)]"
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--cc-subtle)] text-[var(--cc-text-muted)]"
      >
        <item.icon className="h-4 w-4" />
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate text-[13px] font-semibold leading-4 text-[var(--cc-text)]">
          {item.title}
        </span>
        <span className="truncate text-[11px] leading-4 text-[var(--cc-text-muted)]">
          {item.href}
        </span>
      </span>
    </CommandItem>
  );

  return (
    <CommandDialog
      open={isSearchOpen}
      onOpenChange={setSearchOpen}
      onCloseAutoFocus={event => { event.preventDefault(); const triggers = document.querySelectorAll<HTMLButtonElement>('[aria-label="Search admin sections"]'); [...triggers].find(trigger => trigger.getClientRects().length > 0)?.focus(); }}
      contentClassName={ccFontVariables + " workspace-overlay admin-command-dialog max-w-[min(760px,calc(100vw-32px))] rounded-2xl border-[var(--cc-border)] bg-[var(--cc-surface)] text-[var(--cc-text)] [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-[var(--cc-text-muted)] [&_[cmdk-input-wrapper]]:h-16 [&_[cmdk-input-wrapper]]:gap-3 [&_[cmdk-input-wrapper]]:border-[var(--cc-border)] [&_[cmdk-input-wrapper]]:px-4 [&_[cmdk-input-wrapper]_svg]:mr-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input-wrapper]_svg]:text-[var(--cc-text-muted)] [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2"}
    >
      <CommandInput
        placeholder="Jump to an admin section or action..."
        className="h-12 text-[15px] text-[var(--cc-text)] placeholder:text-[var(--cc-text-muted)]"
      />
      <CommandList className="max-h-[420px] p-2">
        <CommandEmpty className="py-10 text-center text-sm text-[var(--cc-text-muted)]">
          No matching section.
        </CommandEmpty>

        {adminNavigationSections.map((section) => (
          <CommandGroup key={section.id} heading={section.title} className="p-0 pb-1">
            {section.items.map(renderItem)}
          </CommandGroup>
        ))}

        <CommandGroup heading="Create" className="p-0 pb-1">
          {adminQuickActions.map(renderItem)}
        </CommandGroup>
      </CommandList>

      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--cc-border)] px-4 py-2.5 text-[11px] text-[var(--cc-text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
          Open
        </span>
        <span className="h-1 w-1 rounded-full bg-[var(--cc-border-strong)]" aria-hidden="true" />
        <span className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-[var(--cc-border)] bg-[var(--cc-subtle)] px-1.5 py-0.5">
            Esc
          </kbd>
          Close
        </span>
      </div>
    </CommandDialog>
  );
}
