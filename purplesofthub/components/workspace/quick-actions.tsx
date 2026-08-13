"use client";

import { FileText, Plus, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const actions = [
  { label: "New document", icon: FileText },
  { label: "Upload file", icon: Upload },
  { label: "Ask AI", icon: Sparkles },
];

export function QuickActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="gap-2" aria-label="Open quick actions">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Quick actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem key={action.label}>
            <action.icon className="mr-2 h-4 w-4" aria-hidden="true" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
