/**
 * Exporta linhas para CSV e dispara o download no browser. Usado pelo botão
 * "Exportar CSV" do `DataTable` — recebe só os dados já formatados como
 * string (quem chama decide como formatar moeda/data), então esse utilitário
 * não precisa saber nada sobre o domínio.
 */
export function exportRowsToCsv(
  filename: string,
  headers: string[],
  rows: string[][],
): void {
  const escapeCell = (cell: string) => {
    if (/[",\n;]/.test(cell)) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  // BOM (﻿) para o Excel abrir acentuação em UTF-8 corretamente.
  const csvContent = "﻿" + lines.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
