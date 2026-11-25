"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/preguntas", label: "Preguntas" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/envios", label: "Envíos" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="border-b border-sand bg-cream/90 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="px-5 py-6">
        <p className="text-[11px] tracking-[0.28em] uppercase text-sage">Aphros</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-forest">
          Dashboard
        </h1>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 text-sm whitespace-nowrap ${
                active
                  ? "bg-sage text-cream"
                  : "text-mist hover:bg-ivory hover:text-forest"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={logout}
          className="rounded-xl px-3 py-2 text-left text-sm text-mist hover:bg-ivory hover:text-forest"
        >
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}
