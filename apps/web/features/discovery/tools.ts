/**
 * "Ferramentas Bônus" do Descobrir — calculadora de lucro e gerador de EAN.
 * Cálculo puro, sem chamada de API: o usuário está simulando um produto que
 * ainda nem tem (antes de importar/fabricar), então não há pedido real pra
 * consultar — é sempre "e se eu vender a R$X, comprando por R$Y...".
 */

export interface ProfitCalculatorInput {
  sellPrice: number;
  productCost: number;
  packagingCost: number;
  shippingCost: number;
  feePercent: number; // comissão do marketplace, 0-100
  taxPercent: number; // Simples/imposto, 0-100
  adsPercent: number; // % do preço reinvestido em anúncios, 0-100
}

export interface ProfitCalculatorResult {
  feeAmount: number;
  taxAmount: number;
  adsAmount: number;
  totalCosts: number;
  netProfit: number;
  netMarginPercent: number;
}

export function computeProfitCalculator(input: ProfitCalculatorInput): ProfitCalculatorResult {
  const { sellPrice, productCost, packagingCost, shippingCost, feePercent, taxPercent, adsPercent } = input;

  const feeAmount = sellPrice * (feePercent / 100);
  const taxAmount = sellPrice * (taxPercent / 100);
  const adsAmount = sellPrice * (adsPercent / 100);
  const totalCosts = productCost + packagingCost + shippingCost + feeAmount + taxAmount + adsAmount;
  const netProfit = sellPrice - totalCosts;
  const netMarginPercent = sellPrice > 0 ? (netProfit / sellPrice) * 100 : 0;

  return { feeAmount, taxAmount, adsAmount, totalCosts, netProfit, netMarginPercent };
}

/**
 * Resolve o preço algebricamente pra bater uma margem-alvo: como
 * comissão/imposto/ads são todos % do PREÇO (não do custo), preço não é só
 * "custo ÷ (1 - margem)" — precisa isolar o preço numa equação com todos os
 * percentuais do lado dele. Devolve `null` quando a soma dos percentuais +
 * margem-alvo passa de 100% (não existe preço finito que resolva).
 */
export function suggestPriceForTargetMargin(
  input: Omit<ProfitCalculatorInput, "sellPrice">,
  targetMarginPercent: number,
): number | null {
  const { productCost, packagingCost, shippingCost, feePercent, taxPercent, adsPercent } = input;
  const fixedCosts = productCost + packagingCost + shippingCost;
  const percentSum = (feePercent + taxPercent + adsPercent + targetMarginPercent) / 100;

  if (percentSum >= 1) return null;
  return fixedCosts / (1 - percentSum);
}

/** Dígito verificador padrão GS1 (mod 10, pesos 1/3 alternados da direita pra esquerda). */
function ean13CheckDigit(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const digit = Number(digits12[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Gera um EAN-13 com dígito verificador válido — útil pra cadastrar produto
 * novo sem GTIN próprio ainda. Usa o prefixo 789 (faixa GS1 Brasil) só pra
 * parecer plausível; NÃO é um código de barras registrado de verdade (isso
 * exige associação à GS1 Brasil, é pago e fora do escopo desta ferramenta).
 */
export function generateEan13(): string {
  const prefix = "789";
  let middle = "";
  for (let i = 0; i < 9; i += 1) {
    middle += Math.floor(Math.random() * 10).toString();
  }
  const digits12 = prefix + middle;
  return digits12 + ean13CheckDigit(digits12).toString();
}
