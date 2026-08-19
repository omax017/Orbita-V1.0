import { Module } from "@nestjs/common";

/**
 * Planos, assinatura e limites de uso (Plan, Subscription, UsageCounter).
 * Responsável por feature gates ("seu plano permite X contas conectadas"),
 * ciclo de cobrança e integração futura com um provedor de pagamento
 * (ex.: Stripe) via `externalCustomerId`/`externalSubscriptionId`.
 */
@Module({})
export class BillingModule {}
