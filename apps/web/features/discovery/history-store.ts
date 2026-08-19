import { SEED_DISCOVERY_HISTORY } from "./mock-data";
import type { DiscoveryHistoryEntry } from "./types";

/**
 * "Persistência" client-side via sessionStorage — o suficiente pra "reabrir"
 * funcionar navegando entre `/descobrir/*` sem precisar de backend (etapa é
 * só mock). Cada tela lê/escreve por aqui em vez de guardar histórico local,
 * senão Histórico não veria nada e "reabrir" não teria pra onde voltar.
 */
const STORAGE_KEY = "hubwin_discovery_history";
const MAX_ENTRIES = 30;

function reviveDates(entry: DiscoveryHistoryEntry): DiscoveryHistoryEntry {
  return { ...entry, createdAt: new Date(entry.createdAt) };
}

export function loadDiscoveryHistory(): DiscoveryHistoryEntry[] {
  if (typeof window === "undefined") return SEED_DISCOVERY_HISTORY;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DISCOVERY_HISTORY));
      return SEED_DISCOVERY_HISTORY;
    }
    const parsed = JSON.parse(raw) as DiscoveryHistoryEntry[];
    return parsed.map(reviveDates);
  } catch {
    return SEED_DISCOVERY_HISTORY;
  }
}

export function saveDiscoveryEntry(entry: DiscoveryHistoryEntry): DiscoveryHistoryEntry[] {
  const current = loadDiscoveryHistory().filter((e) => e.id !== entry.id);
  const next = [entry, ...current].slice(0, MAX_ENTRIES);
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function findDiscoveryEntry(id: string): DiscoveryHistoryEntry | undefined {
  return loadDiscoveryHistory().find((e) => e.id === id);
}
