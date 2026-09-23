"use client";

import Link from "next/link";
import {
  ChevronDown,
  FilePlus2,
  FileText,
  FolderPlus,
  Globe2,
  PenSquare,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { RefreshButton } from "./RefreshButton";

const CREATE_ACTIONS = [
  { label: "New project", href: "/admin/projects/new", icon: FolderPlus },
  { label: "New invoice", href: "/admin/invoices/new", icon: FileText },
  { label: "New service", href: "/admin/services/new", icon: Wrench },
  { label: "New portfolio project", href: "/admin/portfolio/new", icon: Globe2 },
  { label: "New blog post", href: "/admin/blog/create", icon: PenSquare },
];

export function DashboardCommandActions() {
  return (
    <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
      <RefreshButton compact />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="h-8 bg-card text-xs">
            <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
            Create
            <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Create in PurpleSoftHub
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {CREATE_ACTIONS.map((action) => (
            <DropdownMenuItem key={action.href} asChild>
              <Link href={action.href} className="gap-2.5">
                <action.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {action.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
