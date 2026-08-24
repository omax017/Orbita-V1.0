import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  Compass,
  Gauge,
  Puzzle,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { MOCK_PLANS } from "@/features/settings/mock-data";

/**
 * Landing page pública (Etapa 22) — antes disso "/" só redirecionava direto
 * pro dashboard/login, sem nenhuma página de apresentação pro produto.
 * Server Component simples (sem "use client"): nada aqui precisa de estado
 * no cliente, então renderiza mais rápido e sem JS extra.
 *
 * Inspirado no estilo do concorrente "Hunter Spy" (a pedido do usuário —
 * ver Etapa "Pontuação de Oportunidade"), mas com identidade, copy e
 * argumentos próprios da Órbita, sem números/depoimentos inventados: o
 * produto ainda está em BETA aberto, então a página não finge prova social
 * que não existe (nada de "+2.000 sellers já usam" ou depoimentos falsos).
 */
export function LandingContent() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <BenefitsSection />
      <HowItWorksSection />
      <ScoreCallout />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/icone-orbita.svg" alt="" width={28} height={28} unoptimized priority className="h-7 w-7 rounded-md" />
          <span className="font-display text-lg font-semibold text-foreground">Órbita</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <a href="#beneficios" className="hover:text-foreground">Benefícios</a>
          <a href="#como-funciona" className="hover:text-foreground">Como funciona</a>
          <a href="#planos" className="hover:text-foreground">Planos</a>
          <a href="#faq" className="hover:text-foreground">Dúvidas</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link href="/register">
              Criar conta grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-brand-gradient opacity-[0.12]" />
      <div className="container flex flex-col items-center gap-8 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          BETA aberto — teste grátis por tempo limitado
        </span>

        <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
          Você sabe quanto{" "}
          <span className="bg-brand-gradient bg-clip-text text-transparent">lucra de verdade</span>{" "}
          em cada venda?
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          A Órbita sincroniza seus pedidos do Mercado Livre e Shopee e calcula o lucro líquido
          real de cada venda — depois de taxa, frete, imposto e Ads. Chega de planilha e de achismo.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/register">
              Começar teste grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Sem cartão de crédito · cancele quando quiser</p>

        <HeroPreview />
      </div>
    </section>
  );
}

/** Prévia estilizada do painel — deliberadamente sem números "reais"
 * carimbados como se fossem estatística (nada de "+R$50mil vendidos"): é só
 * uma ilustração de como o dashboard se parece, não uma alegação. */
function HeroPreview() {
  const bars = [38, 62, 45, 78, 55, 90, 70];
  return (
    <div className="mt-6 w-full max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-primary/10 sm:p-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Dashboard — visão geral</span>
        <span className="w-10" />
      </div>
      <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
        {[
          { label: "Faturamento", icon: Wallet },
          { label: "Lucro líquido", icon: Gauge },
          { label: "Margem média", icon: BarChart3 },
          { label: "Pedidos", icon: Boxes },
        ].map(({ label, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border p-3 text-left">
            <Icon className="mb-2 h-4 w-4 text-primary" />
            <div className="h-2.5 w-12 rounded bg-muted" />
            <p className="mt-2 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex h-28 items-end gap-2 rounded-lg border border-border p-3">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/70 to-accent" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

const BENEFITS = [
  {
    icon: Wallet,
    title: "Lucro líquido de verdade",
    description: "Taxa do marketplace, frete, imposto e Ads descontados automaticamente — o número que sobra é o que sobra de verdade, não uma estimativa.",
  },
  {
    icon: Boxes,
    title: "Custo por produto, não por chute",
    description: "Cadastre o custo de cada SKU uma vez e a Órbita calcula a margem de cada venda sozinha, pedido por pedido.",
  },
  {
    icon: Compass,
    title: "Descubra o próximo produto vencedor",
    description: "Garimpador de nicho com Pontuação de Oportunidade — um algoritmo próprio e transparente, não uma caixa-preta.",
  },
  {
    icon: AlertTriangle,
    title: "Alertas antes do prejuízo virar rotina",
    description: "A Órbita avisa quando um anúncio está vendendo no vermelho ou quando faltou custo cadastrado — antes de virar um problema maior.",
  },
  {
    icon: BarChart3,
    title: "Financeiro completo, sem planilha",
    description: "DRE, análise ABC de produtos e movimentações financeiras — tudo puxado direto dos seus pedidos sincronizados.",
  },
  {
    icon: Puzzle,
    title: "Extensão de navegador",
    description: "Cadastre custo de produto e dispare uma análise de concorrente direto da página do anúncio, sem trocar de aba.",
  },
];

function BenefitsSection() {
  return (
    <section id="beneficios" className="border-t border-border bg-muted/30 py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Tudo que você precisa pra vender com lucro de verdade
          </h2>
          <p className="mt-3 text-muted-foreground">
            Um painel só, com os números certos — nada de planilha, nada de achismo.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { title: "Conecte sua conta", description: "Mercado Livre em minutos (Shopee a caminho) — autorização oficial, sem precisar de senha do marketplace." },
  { title: "A Órbita sincroniza tudo", description: "Pedidos, anúncios e taxas entram automaticamente. Você só cadastra o custo de cada produto uma vez." },
  { title: "Decida com números reais", description: "Veja o lucro líquido de cada venda, cada produto e cada mês — e ajuste preço, anúncio ou fornecedor com dados, não com feeling." },
];

function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">Como funciona</h2>
          <p className="mt-3 text-muted-foreground">Três passos, sem planilha nenhuma.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <span className="font-display text-5xl font-semibold text-primary/20">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScoreCallout() {
  return (
    <section className="border-y border-border bg-muted/30 py-16">
      <div className="container grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Compass className="h-3.5 w-3.5" />
            Garimpador de Produtos
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Pontuação de Oportunidade: descubra se vale a pena antes de comprar
          </h2>
          <p className="mt-3 text-muted-foreground">
            Um algoritmo próprio que combina demanda, tamanho de mercado, concorrência, tendência
            e margem estimada numa nota de 0 a 100 — com a fórmula aberta, não uma "IA" que ninguém
            sabe explicar o porquê da nota.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
                <circle cx="48" cy="48" r="40" strokeWidth="10" className="fill-none stroke-border" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - 0.77)}
                  className="fill-none stroke-success"
                />
              </svg>
              <span className="absolute font-display text-2xl font-semibold text-foreground">77</span>
            </div>
            <div className="flex-1 space-y-2">
              {["Demanda", "Concorrência", "Margem estimada"].map((label, i) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-success" style={{ width: `${[92, 60, 95][i]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="planos" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">Planos simples, sem pegadinha</h2>
          <p className="mt-3 text-muted-foreground">
            Todo plano começa com teste grátis por tempo limitado (BETA), sem cartão de crédito.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {MOCK_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={
                plan.highlighted
                  ? "relative flex flex-col rounded-2xl border-2 border-primary bg-card p-6 shadow-lg shadow-primary/10"
                  : "flex flex-col rounded-2xl border border-border bg-card p-6"
              }
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Mais popular
                </span>
              ) : null}
              <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-3">
                <span className="font-display text-3xl font-semibold text-foreground">{formatCurrency(plan.monthlyPrice)}</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ou {formatCurrency(plan.annualPrice)}/ano
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-6" variant={plan.highlighted ? "default" : "outline"} asChild>
                <Link href="/register">Começar teste grátis</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    question: "Preciso colocar cartão de crédito pra testar?",
    answer: "Não. O teste do BETA é gratuito por tempo limitado, sem cartão de crédito.",
  },
  {
    question: "A Órbita precisa da minha senha do Mercado Livre?",
    answer: "Não. A conexão é feita pela autorização oficial do Mercado Livre (OAuth) — você loga direto no site deles, a Órbita nunca vê nem guarda sua senha.",
  },
  {
    question: "Como a Órbita calcula o lucro líquido?",
    answer: "A partir do pedido sincronizado, subtraindo taxa do marketplace, frete pago pelo vendedor, imposto, custo do produto/embalagem (que você cadastra) e, se você ativar, o custo de anúncios.",
  },
  {
    question: "Funciona com Shopee?",
    answer: "O Mercado Livre já está com integração completa. Shopee está no roadmap.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim, sem multa nem fidelidade.",
  },
];

function FaqSection() {
  return (
    <section id="faq" className="border-t border-border bg-muted/30 py-20">
      <div className="container max-w-2xl">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground">Dúvidas frequentes</h2>
        <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group p-5 open:bg-accent/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                {item.question}
                <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-brand-gradient p-10 text-center text-white sm:p-16">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Pare de adivinhar seu lucro
          </h2>
          <p className="max-w-lg text-white/85">
            Crie sua conta grátis agora e veja o lucro líquido real da sua loja em poucos minutos.
          </p>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <Link href="/register">
              Começar teste grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/brand/icone-orbita.svg" alt="" width={20} height={20} unoptimized className="h-5 w-5 rounded-md" />
          <span className="font-display font-medium text-foreground">Órbita</span>
        </div>
        <p>© {new Date().getFullYear()} Órbita. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-foreground">Entrar</Link>
          <Link href="/register" className="hover:text-foreground">Criar conta</Link>
        </div>
      </div>
    </footer>
  );
}
