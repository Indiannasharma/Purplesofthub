import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Reuse shadcn/Slot behavior and CC spacing, even under the legacy global reset. */
export const WorkspaceButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      data-workspace-variant={variant}
      data-workspace-size={size}
      className={cn("cc-btn ws-button", className)}
      {...props}
    />
  )
);
WorkspaceButton.displayName = "WorkspaceButton";
