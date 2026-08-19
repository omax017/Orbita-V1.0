import { History } from "lucide-react";

export interface RecentSearchItem {
  id: string;
  label: string;
  createdAt: Date;
}

const RELATIVE = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

export function RecentSearchesList({
  items,
  onSelect,
}: {
  items: RecentSearchItem[];
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <History className="h-3.5 w-3.5" />
        Buscas recentes
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:bg-accent"
          >
            {item.label}
            <span className="ml-1.5 text-muted-foreground">{RELATIVE.format(item.createdAt)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
