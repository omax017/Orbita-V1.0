import Image from "next/image";
import Link from "next/link";

/**
 * Layout das telas de autenticação (login/registro) — sem sidebar/header,
 * só um card centralizado. Grupo de rota separado de `(dashboard)` de
 * propósito: ninguém deslogado deveria ver o shell autenticado.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <Link href="/login" className="flex items-center gap-2">
        <Image src="/brand/icone-orbita.svg" alt="" width={28} height={28} unoptimized priority className="h-7 w-7 rounded-md" />
        <span className="font-display text-lg font-semibold text-foreground">Órbita</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
