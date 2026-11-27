import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
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

        <nav>
          {!isQuiz ? (
            <Link
              href="/quiz"
              className="aphros-btn-luxury group inline-flex h-10 items-center gap-2 rounded-full bg-aphros-wine px-5 text-xs font-medium tracking-[0.12em] text-aphros-blush-50 uppercase shadow-xs sm:h-11 sm:px-6"
            >
              <span>Hacer test</span>
              <ArrowUpRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ) : (
            <Link
              href="/"
              className="text-xs font-normal tracking-[0.16em] text-aphros-cocoa/80 uppercase transition-colors duration-300 hover:text-aphros-wine"
            >
              Inicio
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
