"use client";

import * as React from "react";
import { DialogContent } from "@/components/ui/dialog";
import { SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ccFontVariables } from "@/components/command-center/fonts";

/** Existing Radix behavior, with explicit token scope on the portalled content. */
export const WorkspaceDialogContent = React.forwardRef<React.ElementRef<typeof DialogContent>, React.ComponentPropsWithoutRef<typeof DialogContent>>(({ className, ...props }, ref) => (
  <DialogContent ref={ref} className={cn(ccFontVariables, "workspace-overlay ws-dialog", className)} {...props} />
));
WorkspaceDialogContent.displayName = "WorkspaceDialogContent";

export const WorkspaceSheetContent = React.forwardRef<React.ElementRef<typeof SheetContent>, React.ComponentPropsWithoutRef<typeof SheetContent>>(({ className, ...props }, ref) => (
  <SheetContent ref={ref} className={cn(ccFontVariables, "workspace-overlay ws-sheet", className)} {...props} />
));
WorkspaceSheetContent.displayName = "WorkspaceSheetContent";
