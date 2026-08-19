import type { AccountOption } from "./types";

/**
 * Contas de marketplace mockadas — compartilhadas entre módulos (Dashboard,
 * Pedidos, e futuramente Anúncios/Publicidade) porque o seletor de conta é
 * o mesmo em todos. Conecta com `MarketplaceAccount` real na etapa de
 * integrações.
 */
export const MOCK_ACCOUNTS: AccountOption[] = [
  { id: "acc_ml", label: "Loja da Maria · Mercado Livre", provider: "MERCADO_LIVRE" },
  { id: "acc_shopee", label: "Loja da Maria · Shopee", provider: "SHOPEE" },
];
