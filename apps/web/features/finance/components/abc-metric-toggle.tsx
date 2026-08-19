import type { AbcMetric } from "../types";

const OPTIONS: { value: AbcMetric; label: string }[] = [
  { value: "revenue", label: "Receita" },
  { value: "quantity", label: "Quantidade" },
  { value: "profit", label: "Lucro" },
];

export function AbcMetricToggle({
  value,
  onChange,
}: {
  value: AbcMetric;
  onChange: (metric: AbcMetric) => void;
}) {
  return (
    <div className="inline-flex w-fit rounded-lg bg-muted p-1 text-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
