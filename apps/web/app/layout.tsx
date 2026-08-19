import type { Metadata } from "next";
import "./globals.css";
import { inter, spaceGrotesk } from "@/lib/fonts";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Órbita",
  description:
    "Órbita — gestão de vendas e lucro real para sellers de marketplace.",
  icons: {
    icon: [
      { url: "/brand/favicons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/brand/favicons/icon-180.png",
    shortcut: "/brand/favicons/favicon.ico",
  },
};

// A classe .dark/.light é controlada em runtime pelo ThemeProvider
// (next-themes, ver lib/providers.tsx) — não fixamos "dark" aqui.
// suppressHydrationWarning é a recomendação oficial do next-themes: o
// script dele roda antes da hidratação e ajusta a classe no <html> antes do
// React comparar a árvore, o que naturalmente diverge do HTML gerado no
// servidor por uma renderização — sem isso o React acusaria (falsamente) um
// mismatch de hidratação.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
