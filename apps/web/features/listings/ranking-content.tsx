"use client";

import { useMemo } from "react";
import { Sparkline } from "@/components/ui/sparkline";
import { StatRow } from "@/components/ui/stat-row";
import { formatNumber } from "@/lib/format";
import { MOCK_LISTINGS } from "./mock-data";
import { buildRankingData } from "./ranking-mock";
import { CompetitiveBadge } from "./components/competitive-badge";

export function RankingContent() {
  const rankings = useMemo(() => buildRankingData(MOCK_LISTINGS), []);
  const byListingId = useMemo(() => new Map(MOCK_LISTINGS.map((l) => [l.id, l])), []);

  const winningCount = MOCK_LISTINGS.filter((l) => l.competitivePosition === "WINNING").length;
  const losingCount = MOCK_LISTINGS.filter((l) => l.competitivePosition === "LOSING").length;
  const improvingCount = rankings.filter((r) => r.trend === "up").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Rankeamento</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Posição média nas buscas e competitividade nos últimos 14 dias
        </p>
      </div>

      <StatRow
        items={[
          { label: "Anúncios ativos", value: formatNumber(rankings.length) },
          { label: "Ganhando buy box", value: formatNumber(winningCount), tone: "success" },
          { label: "Perdendo buy box", value: formatNumber(losingCount), tone: "destructive" },
          { label: "Melhorando posição", value: formatNumber(improvingCount) },
        ]}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Anúncio</th>
              <th className="px-4 py-2.5 text-left font-medium">Posição atual</th>
              <th className="px-4 py-2.5 text-left font-medium">Melhor posição (14d)</th>
              <th className="px-4 py-2.5 text-left font-medium">Tendência</th>
              <th className="px-4 py-2.5 text-left font-medium">Buy box</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rankings.map((ranking) => {
              const listing = byListingId.get(ranking.listingId);
              if (!listing) return null;
              return (
                <tr key={ranking.listingId} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-8 w-8 shrink-0 rounded-md ${listing.thumbnailColor}`} />
                      <span className="max-w-xs truncate text-foreground">{listing.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-foreground">#{ranking.currentPosition}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">#{ranking.bestPosition}</td>
                  <td className="px-4 py-2.5">
                    <Sparkline
                      values={ranking.history.map((p) => p.position)}
                      invert
                      tone={ranking.trend === "up" ? "success" : ranking.trend === "down" ? "destructive" : "muted"}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <CompetitiveBadge position={listing.competitivePosition} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
