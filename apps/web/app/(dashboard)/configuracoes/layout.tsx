import type { ReactNode } from "react";
import { SettingsNav } from "@/features/settings/components/settings-nav";

export default function ConfiguracoesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configurações</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Conta, cobrança, integrações e preferências do workspace</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <SettingsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
