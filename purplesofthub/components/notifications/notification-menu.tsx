"use client";

import { Bell, CheckCheck } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  { id: 1, title: "Assignment due tomorrow", meta: "Academy" },
  { id: 2, title: "Campaign completed", meta: "Music" },
  { id: 3, title: "Invoice paid", meta: "Billing" },
  { id: 4, title: "New student enrolled", meta: "Academy" },
  { id: 5, title: "Support ticket updated", meta: "Support" },
];

export function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative h-10 w-10"
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px]">
            {notifications.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          <CheckCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="flex flex-col items-start gap-1 py-3"
          >
            <span className="text-sm font-medium">{notification.title}</span>
            <span className="text-xs text-muted-foreground">{notification.meta}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
