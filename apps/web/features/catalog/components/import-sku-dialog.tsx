"use client";

import { useState, type ChangeEvent } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * "Importar" — aceita um CSV mas não faz parsing de verdade nesta etapa
 * (mock): só confirma o nome do arquivo escolhido. A leitura/validação real
 * de planilha é lógica de página futura.
 */
export function ImportSkuDialog() {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imported, setImported] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
    setImported(false);
  }

  function handleImport() {
    setImported(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFileName(null);
          setImported(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Importar SKUs</DialogTitle>
          <DialogDescription>Envie uma planilha CSV com seus produtos e custos.</DialogDescription>
        </DialogHeader>

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center hover:bg-accent">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {fileName ?? "Clique para escolher um arquivo .csv"}
          </span>
          <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>

        {imported ? (
          <p className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Arquivo recebido — processamento real entra numa próxima etapa.
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
          <Button type="button" disabled={!fileName} onClick={handleImport}>
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
