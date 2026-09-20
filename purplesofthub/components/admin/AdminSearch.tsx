"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
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
      <Button
        type="button"
        variant="outline"
        onClick={() => setSearchOpen(true)}
        aria-label="Search admin sections"
        className="hidden h-9 w-[210px] justify-start gap-2 bg-card px-3 text-sm font-normal text-muted-foreground xl:inline-flex"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Search sections…</span>
        <kbd className="ml-auto shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-widest text-muted-foreground">
          Ctrl K
        </kbd>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setSearchOpen(true)}
        aria-label="Search admin sections"
        className="h-9 w-9 bg-card xl:hidden"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </Button>
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
    >
      <item.icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.title}</span>
      <span className="ml-auto truncate text-[11px] text-muted-foreground">{item.href}</span>
    </CommandItem>
  );

  return (
    <CommandDialog open={isSearchOpen} onOpenChange={setSearchOpen}>
      <CommandInput placeholder="Jump to an admin section or action…" />
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

      <div className="flex items-center gap-2 border-t px-3 py-2 text-[11px] text-muted-foreground">
        <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
        Open
        <span className="mx-1 text-border">·</span>
        <kbd className="rounded border border-border bg-muted px-1 py-0.5">Esc</kbd>
        Close
      </div>
    </CommandDialog>
  );
}
