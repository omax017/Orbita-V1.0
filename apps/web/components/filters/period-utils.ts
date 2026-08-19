import type { PeriodPreset, PeriodSelection } from "./types";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

/** Monta a seleção de período (janela atual + janela anterior equivalente, para variação %). */
export function buildPeriod(preset: PeriodPreset, customFrom?: Date, customTo?: Date): PeriodSelection {
  const today = new Date();

  if (preset === "today") {
    const from = startOfDay(today);
    const to = endOfDay(today);
    return {
      preset,
      from,
      to,
      label: "Hoje",
      previousFrom: startOfDay(addDays(today, -1)),
      previousTo: endOfDay(addDays(today, -1)),
    };
  }

  if (preset === "7d") {
    const from = startOfDay(addDays(today, -6));
    const to = endOfDay(today);
    return {
      preset,
      from,
      to,
      label: "Últimos 7 dias",
      previousFrom: startOfDay(addDays(today, -13)),
      previousTo: endOfDay(addDays(today, -7)),
    };
  }

  if (preset === "30d") {
    const from = startOfDay(addDays(today, -29));
    const to = endOfDay(today);
    return {
      preset,
      from,
      to,
      label: "Últimos 30 dias",
      previousFrom: startOfDay(addDays(today, -59)),
      previousTo: endOfDay(addDays(today, -30)),
    };
  }

  // custom
  const from = startOfDay(customFrom ?? addDays(today, -6));
  const to = endOfDay(customTo ?? today);
  const spanMs = to.getTime() - from.getTime();
  return {
    preset,
    from,
    to,
    label: `${DATE_FMT.format(from)} – ${DATE_FMT.format(to)}`,
    previousFrom: new Date(from.getTime() - spanMs - 1),
    previousTo: new Date(from.getTime() - 1),
  };
}
