"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileMenu } from "@/components/user/profile-menu";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 gap-3 rounded-full px-2"
          aria-label="Open user menu"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src="/images/logo/purplesoft-logo-main.png" alt="" />
            <AvatarFallback>PS</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline-flex">PurpleSoftHub</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/images/logo/purplesoft-logo-main.png" alt="" />
              <AvatarFallback>PS</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">PurpleSoftHub</p>
              <p className="truncate text-xs text-muted-foreground">
                platform@purplesofthub.com
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ProfileMenu />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/sign-in">
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Sign Out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
