export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  /** Quando true, valor menor = melhor (ex.: posição de ranking) e o eixo é invertido visualmente. */
  invert?: boolean;
  tone?: "success" | "destructive" | "muted";
  className?: string;
}

/**
 * Sparkline de 2px — segue `marks-and-anatomy.md` do guia de dataviz: linha
 * fina no tom neutro (`--muted-foreground`), só o ponto final carrega a cor
 * de destaque (verde melhora / vermelho piora), pra não competir com o
 * número ao lado. Sem eixo, sem grid — é só a forma da tendência.
 */
export function Sparkline({
  values,
  width = 96,
  height = 28,
  invert = false,
  tone = "muted",
  className,
}: SparklineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 3;

  const toY = (v: number) => {
    const normalized = (v - min) / range; // 0..1
    const y = padding + normalized * (height - padding * 2);
    return invert ? y : height - y;
  };

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - padding * 2) + padding;
    return [x, toY(v)] as const;
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = points[points.length - 1]!;

  const endColor =
    tone === "success" ? "hsl(var(--success))" : tone === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-hidden="true"
    >
      <path d={path} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      <circle cx={lastX} cy={lastY} r={2.5} fill={endColor} />
    </svg>
  );
}
