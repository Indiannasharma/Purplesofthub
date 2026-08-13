"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { flattenNavigationItems, getVisibleNavigation } from "@/lib/navigation";
import { previewPlatformRole } from "@/lib/roles";

type CommandSearchProps = {
  children?: React.ReactNode;
};

export function CommandSearch({ children }: CommandSearchProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const items = React.useMemo(
    () => flattenNavigationItems(getVisibleNavigation(previewPlatformRole)),
    []
  );

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const trigger = children ? (
    <div
      role="presentation"
      onClick={() => setOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(true);
        }
      }}
    >
      {children}
    </div>
  ) : (
    <>
      <Button
        type="button"
        variant="outline"
        className="hidden h-10 gap-2 sm:inline-flex"
        aria-label="Search the platform"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 sm:hidden"
        aria-label="Search the platform"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>
    </>
  );

  return (
    <>
      {trigger}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search the platform</DialogTitle>
        <DialogDescription className="sr-only">
          Jump to a platform module or placeholder workspace
        </DialogDescription>
        <CommandInput placeholder="Search the Platform Shell..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Modules">
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.href}`}
                onSelect={() => {
                  router.push(item.href);
                  setOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
