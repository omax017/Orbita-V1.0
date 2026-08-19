export type PeriodPreset = "today" | "7d" | "30d" | "custom";

export interface PeriodSelection {
  preset: PeriodPreset;
  from: Date;
  to: Date;
  /** Label pronto para exibir (ex.: "Últimos 7 dias", "18/07 – 18/08"). */
  label: string;
  /** Mesma janela de tempo, um período imediatamente anterior — usado para variação %. */
  previousFrom: Date;
  previousTo: Date;
}

export interface AccountOption {
  id: string;
  label: string;
  provider?: "MERCADO_LIVRE" | "SHOPEE";
}

export const ALL_ACCOUNTS_ID = "all";
