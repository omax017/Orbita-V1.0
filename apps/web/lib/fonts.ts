import { Inter, Space_Grotesk } from "next/font/google";

/** Corpo de texto, tabelas, formulários — alta legibilidade em telas densas de dado. */
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

/** Títulos e números grandes de KPI — geométrica, dá o ar "moderno/tech" da
 * identidade "Órbita" (ver docs/identidade-visual.md § 4). Aplicada
 * globalmente a h1/h2/h3 via `globals.css`, e disponível como `font-display`
 * pra elementos que não são heading (ex.: valor grande de um KpiCard). */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
