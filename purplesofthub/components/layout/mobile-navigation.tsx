"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePlatformShell } from "@/components/layout/platform-shell-context";

type MobileNavigationProps = {
  children: React.ReactNode;
};

export function MobileNavigation({ children }: MobileNavigationProps) {
  const { isMobileNavOpen, setMobileNavOpen } = usePlatformShell();

  return (
    <Sheet open={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-[320px] p-0">
        <SheetTitle className="sr-only">Platform navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate PurpleSoftHub platform modules
        </SheetDescription>
        {children}
      </SheetContent>
    </Sheet>
  );
}
