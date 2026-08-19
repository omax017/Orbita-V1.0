"use client";

import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NotificationBellProps {
  /** Contagem de não lidas. A busca real (Alert/Notification) entra quando o módulo de alertas ganhar lógica de negócio. */
  unreadCount?: number;
}

export function NotificationBell({ unreadCount = 0 }: NotificationBellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <BellOff className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhuma notificação por enquanto.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
