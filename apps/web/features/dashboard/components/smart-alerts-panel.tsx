"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SmartAlert } from "../mock-data";

const SEVERITY_STYLES: Record<SmartAlert["severity"], { icon: typeof AlertTriangle; classes: string; iconClasses: string }> = {
  warning: {
    icon: AlertTriangle,
    classes: "border-warning/30 bg-warning/10",
    iconClasses: "text-warning",
  },
  critical: {
    icon: ShieldAlert,
    classes: "border-destructive/30 bg-destructive/10",
    iconClasses: "text-destructive",
  },
};

export interface SmartAlertsPanelProps {
  alerts: SmartAlert[];
}

/** Painel de alertas inteligentes — cada item é dispensável (estado local, some da lista ao clicar no X). */
export function SmartAlertsPanel({ alerts }: SmartAlertsPanelProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Alertas inteligentes</h2>
      <div className="mt-3 space-y-2">
        {visibleAlerts.map((alert) => {
          const style = SEVERITY_STYLES[alert.severity];
          const Icon = style.icon;
          return (
            <div
              key={alert.id}
              className={cn("flex items-start gap-3 rounded-lg border p-3", style.classes)}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconClasses)} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{alert.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground"
                aria-label="Dispensar alerta"
                onClick={() => setDismissedIds((prev) => new Set(prev).add(alert.id))}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
