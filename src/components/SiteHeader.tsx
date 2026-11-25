import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <Link href="/" className="group">
        <span className="block text-[11px] tracking-[0.28em] uppercase text-sage">
          Cosmética artesanal
        </span>
        <span className="font-[family-name:var(--font-display)] text-2xl text-forest transition group-hover:text-sage-dark">
          Aphros
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm text-mist">
        <Link href="/quiz" className="hover:text-forest transition">
          Test de piel
        </Link>
        <a
          href="https://www.pacifiko.com/marketplace/aphros"
          target="_blank"
          rel="noreferrer"
          className="hover:text-forest transition"
        >
          Tienda
        </a>
      </nav>
    </header>
  );
}
