"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export type PlatformViewport = "mobile" | "tablet" | "desktop";

type PlatformShellContextValue = {
  viewport: PlatformViewport;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isCollapsed: boolean;
  isMobileNavOpen: boolean;
  openSubmenuId: string | null;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleSubmenu: (id: string) => void;
  setOpenSubmenuId: (id: string | null) => void;
};

const PlatformShellContext = React.createContext<PlatformShellContextValue | null>(
  null
);

function getViewport(width: number): PlatformViewport {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function PlatformShellProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [viewport, setViewport] = React.useState<PlatformViewport>("desktop");
  const [hasMeasured, setHasMeasured] = React.useState(false);
  const [collapsedOverride, setCollapsedOverride] = React.useState<boolean | null>(
    null
  );
  const [isMobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [openSubmenuId, setOpenSubmenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const syncViewport = () => {
      setViewport(getViewport(window.innerWidth));
    };

    syncViewport();
    setHasMeasured(true);
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  React.useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const isCollapsed =
    viewport === "mobile"
      ? false
      : (collapsedOverride ?? (hasMeasured && viewport === "tablet"));

  const value = React.useMemo<PlatformShellContextValue>(
    () => ({
      viewport,
      isMobile: viewport === "mobile",
      isTablet: viewport === "tablet",
      isDesktop: viewport === "desktop",
      isCollapsed,
      isMobileNavOpen,
      openSubmenuId,
      toggleCollapsed: () => setCollapsedOverride((current) => !current),
      setCollapsed: (collapsed) => setCollapsedOverride(collapsed),
      setMobileNavOpen,
      toggleSubmenu: (id) =>
        setOpenSubmenuId((current) => (current === id ? null : id)),
      setOpenSubmenuId,
    }),
    [isCollapsed, isMobileNavOpen, openSubmenuId, viewport]
  );

  return (
    <PlatformShellContext.Provider value={value}>
      {children}
    </PlatformShellContext.Provider>
  );
}

export function usePlatformShell() {
  const context = React.useContext(PlatformShellContext);

  if (!context) {
    throw new Error("usePlatformShell must be used within a PlatformShellProvider");
  }

  return context;
}
