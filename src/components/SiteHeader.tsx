import Link from "next/link";
import { AphrosShellMark, AphrosWordmark } from "@/components/AphrosShellMark";

type SiteHeaderProps = {
  isQuiz?: boolean;
};

export function SiteHeader({ isQuiz = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-aphros-espresso/10 bg-aphros-blush-50/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus-visible:outline-none sm:gap-3"
          aria-label="Aphros Inicio"
        >
          <AphrosShellMark
            priority
            className="h-7 w-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 sm:h-8"
          />
          <AphrosWordmark
            priority
            className="h-5 w-auto transition-opacity duration-300 group-hover:opacity-85 sm:h-6"
          />
        </Link>

        <nav className="flex items-center gap-5 sm:gap-6">
          <Link
            href="/productos"
            className="text-xs font-medium tracking-[0.16em] text-aphros-espresso/80 uppercase transition-colors duration-200 hover:text-aphros-wine"
          >
            Productos
          </Link>
          {isQuiz ? (
            <Link
              href="/"
              className="text-xs font-normal tracking-[0.16em] text-aphros-cocoa/80 uppercase transition-colors duration-300 hover:text-aphros-wine"
            >
              Inicio
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
