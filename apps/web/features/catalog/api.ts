import { apiFetch } from "@/lib/api-client";
import type { MockSku } from "./types";

/** Resposta real de `GET/POST/PATCH /catalog/skus` (backend desde a Etapa
 * 16.1) — espelha o model `Sku` do Prisma. Sem `imageColor` (isso é só um
 * placeholder visual do frontend, o backend não guarda imagem ainda). */
interface ApiSku {
  id: string;
  code: string;
  name: string;
  costAmount: string | number;
  packagingCostAmount: string | number;
  stockLocal: number;
  stockFull: number;
  lowStockThreshold: number;
  active: boolean;
}

const IMAGE_COLORS = ["bg-chart-1/20", "bg-chart-2/20", "bg-chart-3/20", "bg-chart-4/20", "bg-chart-5/20"];

/** Cor do "thumbnail" placeholder — determinística a partir do `id`, pra não
 * mudar de cor a cada refetch (mesmo truque de seed usado em todo o resto
 * do produto, só que aqui é só estético, não afeta nenhum número). */
function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return IMAGE_COLORS[Math.abs(hash) % IMAGE_COLORS.length]!;
}

function toMockSku(sku: ApiSku): MockSku {
  return {
    id: sku.id,
    code: sku.code,
    name: sku.name,
    costAmount: Number(sku.costAmount),
    packagingCostAmount: Number(sku.packagingCostAmount),
    stockLocal: sku.stockLocal,
    stockFull: sku.stockFull,
    lowStockThreshold: sku.lowStockThreshold,
    imageColor: colorFor(sku.id),
    active: sku.active,
  };
}

export async function fetchSkus(workspaceId: string): Promise<MockSku[]> {
  const skus = await apiFetch<ApiSku[]>("/catalog/skus", { workspaceId });
  return skus.map(toMockSku);
}

export interface CreateSkuInput {
  code: string;
  name: string;
  costAmount: number;
  packagingCostAmount: number;
  stockLocal: number;
  stockFull: number;
}

export async function createSku(workspaceId: string, input: CreateSkuInput): Promise<MockSku> {
  const sku = await apiFetch<ApiSku>("/catalog/skus", {
    method: "POST",
    workspaceId,
    body: JSON.stringify(input),
  });
  return toMockSku(sku);
}

export async function deleteSku(workspaceId: string, id: string): Promise<void> {
  await apiFetch<void>(`/catalog/skus/${id}`, { method: "DELETE", workspaceId });
}
