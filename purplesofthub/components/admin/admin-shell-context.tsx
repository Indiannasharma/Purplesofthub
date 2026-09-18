"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export type AdminShellViewport = "mobile" | "tablet" | "desktop";

type AdminShellContextValue = {
  viewport: AdminShellViewport;
  isMobile: boolean;
  isDesktopSidebarVisible: boolean;
  isCollapsed: boolean;
  isMobileNavOpen: boolean;
  isSearchOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

const AdminShellContext = React.createContext<AdminShellContextValue | null>(null);

function getViewport(width: number): AdminShellViewport {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * Shell state for the Admin area only.
 *
 * Deliberately in-memory: the previous admin shell had no persistence
 * mechanism, so no new storage layer (localStorage or database) is introduced.
 */
export function AdminShellProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [viewport, setViewport] = React.useState<AdminShellViewport>("desktop");
  const [collapsedOverride, setCollapsedOverride] = React.useState<boolean | null>(null);
  const [isMobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [isSearchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const syncViewport = () => setViewport(getViewport(window.innerWidth));

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  // Close the mobile drawer whenever the route changes. Render-time
  // adjustment (react.dev) instead of an effect so no cascading render.
  const [lastPathname, setLastPathname] = React.useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (isMobileNavOpen) setMobileNavOpen(false);
  }

  // Ctrl/Cmd + K opens admin search from anywhere in the admin area.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isCollapsed = viewport === "mobile" ? false : collapsedOverride ?? false;

  const value = React.useMemo<AdminShellContextValue>(
    () => ({
      viewport,
      isMobile: viewport === "mobile",
      isDesktopSidebarVisible: viewport !== "mobile",
      isCollapsed,
      isMobileNavOpen,
      isSearchOpen,
      setMobileNavOpen,
      setSearchOpen,
      toggleCollapsed: () => setCollapsedOverride((current) => !current),
      setCollapsed: (collapsed: boolean) => setCollapsedOverride(collapsed),
    }),
    [isCollapsed, isMobileNavOpen, isSearchOpen, viewport]
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const context = React.useContext(AdminShellContext);

  if (!context) {
    throw new Error("useAdminShell must be used within an AdminShellProvider");
  }

  return context;
}