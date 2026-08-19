"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Providers globais do app. `ThemeProvider` (next-themes) controla a classe
 * `.dark`/`.light` na <html> — os valores em si ficam em app/globals.css.
 * `defaultTheme="dark"` porque esse é o tema padrão do produto;
 * `enableSystem={false}` porque o requisito é um toggle claro/escuro
 * explícito no header, não seguir a preferência do SO.
 *
 * `TooltipProvider` fica aqui (não só dentro do shell autenticado) porque é
 * leve e assim qualquer página — incluindo login/registro — pode usar
 * `<Tooltip>` sem precisar lembrar de envolver localmente.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
