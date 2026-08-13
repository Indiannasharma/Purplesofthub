"use client";

import Link from "next/link";
import { HelpCircle, Palette, Settings, UserRound } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const profileLinks = [
  { href: "/platform/settings", label: "Profile", icon: UserRound },
  { href: "/platform/settings", label: "Account", icon: Settings },
  { href: "/platform/settings", label: "Appearance", icon: Palette },
  { href: "/platform/support", label: "Help", icon: HelpCircle },
];

export function ProfileMenu() {
  return (
    <>
      {profileLinks.map((item) => (
        <DropdownMenuItem key={item.label} asChild>
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        </DropdownMenuItem>
      ))}
    </>
  );
}
