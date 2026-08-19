import { Lock, MessageSquareText, Plug, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "./components/section-card";

const EXAMPLE_PROMPTS = [
  "Qual foi meu lucro líquido essa semana?",
  "Quais produtos estão com ACoS acima do break-even?",
  "Compare a receita deste mês com o mês passado",
];

/** Sem integração real ainda — a tela existe pra explicar o conceito e
 * mostrar o estado "bloqueado por plano" (o plano Business, ver aba
 * Planos, é o que libera). Nenhuma chamada de API acontece aqui. */
export function IaContent() {
  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Assistente de IA via MCP" description="Converse com a sua operação em linguagem natural, direto no Claude ou ChatGPT.">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            O Órbita expõe um servidor <strong className="text-foreground">MCP</strong> (Model Context Protocol) com os dados
            da sua loja — vendas, custos, Ads, estoque. Depois de conectado, você pode fazer perguntas direto no Claude ou no
            ChatGPT e receber respostas com base nos números reais do seu workspace, sem precisar abrir o painel.
          </p>

          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MessageSquareText className="h-3.5 w-3.5" />
              Exemplos do que você poderá perguntar
            </p>
            <ul className="space-y-1.5 text-sm text-foreground">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <li key={prompt} className="rounded-md bg-background px-3 py-2 text-muted-foreground">
                  “{prompt}”
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-medium text-foreground">Disponível no plano Business</p>
                <p className="text-sm text-muted-foreground">Em breve — faça upgrade para ser avisado no lançamento.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full shrink-0 gap-1.5 border-warning/40 sm:w-auto" disabled>
              <Sparkles className="h-3.5 w-3.5" />
              Em breve
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Como vai funcionar" description="Conexão em 2 passos, sem nenhuma chave de API pra copiar manualmente.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">1</span>
            <div>
              <p className="text-sm font-medium text-foreground">Conectar no app de IA</p>
              <p className="text-xs text-muted-foreground">Adicione o servidor MCP da Órbita nas configurações do Claude ou ChatGPT.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">2</span>
            <div>
              <p className="text-sm font-medium text-foreground">Autorizar o acesso</p>
              <p className="text-xs text-muted-foreground">Login OAuth com sua conta Órbita — os dados nunca saem do seu workspace.</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Plug className="h-3.5 w-3.5" />
          Mesma base de permissões dos membros do workspace (ver aba Membros).
        </div>
      </SectionCard>
    </div>
  );
}
