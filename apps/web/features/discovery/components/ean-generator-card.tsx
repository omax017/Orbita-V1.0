"use client";

import { useEffect, useState } from "react";
import { Barcode, Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateEan13 } from "../tools";

/** "Gerador de código EAN instantâneo" — código com dígito verificador
 * válido, útil pra cadastrar produto novo sem GTIN próprio ainda. Deixa
 * claro que não é um código registrado de verdade (ver `tools.ts`).
 *
 * `code` começa `null` (não gerado no `useState` inicial) de propósito:
 * `generateEan13` usa `Math.random`, e rodar isso no render do servidor
 * geraria um código diferente do primeiro render do cliente — mismatch de
 * hidratação. Gerar só depois de montar (`useEffect`) evita isso. */
export function EanGeneratorCard() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(generateEan13());
  }, []);

  function handleGenerate() {
    setCode(generateEan13());
    setCopied(false);
  }

  function handleCopy() {
    if (!code) return;
    setCopied(true);
    navigator.clipboard?.writeText(code)?.catch(() => {});
    setTimeout(() => setCopied(false), 2000);
  }

  const groups = code ? [code.slice(0, 3), code.slice(3, 8), code.slice(8, 12), code.slice(12)] : null;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Barcode className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Gerador de código EAN</h2>
          <p className="text-xs text-muted-foreground">EAN-13 com dígito verificador válido, pra produto sem GTIN próprio</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg bg-muted/50 py-6">
        <span className="font-mono text-2xl font-semibold tracking-widest text-foreground">
          {groups ? groups.join(" ") : " "}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleGenerate}>
            <RefreshCw className="h-3.5 w-3.5" />
            Gerar outro
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCopy} disabled={!code}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Código gerado localmente, não registrado na GS1 — use pra cadastro interno, não pra revenda que exija GTIN oficial.
      </p>
    </div>
  );
}
