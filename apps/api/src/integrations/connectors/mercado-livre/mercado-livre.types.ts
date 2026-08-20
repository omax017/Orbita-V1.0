/**
 * Formatos BRUTOS da API do Mercado Livre — só os campos que a Órbita usa
 * (a resposta real tem muito mais coisa). Ficam separados dos tipos
 * normalizados (`marketplace-connector.types.ts`) de propósito: nada fora
 * deste connector deve conhecer este formato.
 */

export interface MlTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token?: string;
}

export interface MlUserResponse {
  id: number;
  nickname: string;
  email?: string;
  site_id: string;
}

export interface MlOrderItem {
  item: { id: string; title: string; variation_id?: number | null };
  quantity: number;
  unit_price: number;
  full_unit_price?: number;
  /** Comissão do ML sobre este item — é daqui que vem o "Billing/Fees" por pedido
   * (o ML não expõe uma API de billing separada por pedido; a taxa já vem
   * embutida no próprio item do pedido). */
  sale_fee?: number;
}

export interface MlOrderPayment {
  status: string;
  status_detail?: string;
  transaction_amount: number;
  date_approved?: string | null;
}

export interface MlOrderShippingRef {
  id: number | null;
}

export interface MlOrder {
  id: number;
  status: string; // confirmed | payment_required | payment_in_process | partially_paid | paid | cancelled | invalid
  status_detail?: { code: string | null } | null;
  date_created: string;
  date_closed: string | null;
  last_updated: string;
  currency_id: string;
  total_amount: number;
  paid_amount?: number;
  coupon?: { amount: number } | null;
  buyer: { nickname: string | null } | null;
  order_items: MlOrderItem[];
  payments?: MlOrderPayment[];
  shipping?: MlOrderShippingRef | null;
  taxes?: { amount: number }[] | null;
  cancel_detail?: { date: string | null } | null;
}

export interface MlOrdersSearchResponse {
  results: MlOrder[];
  paging: { total: number; offset: number; limit: number };
}

/** Status de envio — vem de um recurso separado (`GET /shipments/{id}`), não do pedido. */
export interface MlShipment {
  id: number;
  status: string; // pending | handling | ready_to_ship | shipped | delivered | not_delivered | cancelled
  substatus?: string | null;
  date_created: string;
  date_shipped?: string | null;
  date_delivered?: string | null;
  cost?: number;
}

export interface MlItemVariation {
  id: number;
  attribute_combinations?: { name: string; value_name: string }[];
}

export interface MlItem {
  id: string;
  title: string;
  status: string; // active | paused | closed | under_review | ...
  permalink: string;
  thumbnail: string | null;
  currency_id: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  category_id: string | null;
  seller_id?: number;
  health?: number | null; // "quality score" do anúncio (0–1)
  variations?: MlItemVariation[];
}

/** Resposta de `GET /users/{id}` quando o alvo é um VENDEDOR (não a conta
 * autenticada) — traz reputação pública, usada pela Análise de Anúncio pra
 * mostrar dados reais do vendedor de um anúncio de terceiro. */
export interface MlSellerResponse {
  id: number;
  nickname: string;
  registration_date?: string;
  seller_reputation?: {
    level_id: string | null; // "5_green" | "4_light_green" | "3_yellow" | "2_orange" | "1_red" | null
    power_seller_status: string | null;
    transactions?: { total?: number };
  };
}

export interface MlItemsSearchResponse {
  results: string[]; // IDs — precisa de um segundo fetch (multiget) pros detalhes
  paging: { total: number; offset: number; limit: number };
}
