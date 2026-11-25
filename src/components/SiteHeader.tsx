import Link from "next/link";
import { SparklesIcon } from "lucide-react";

type SiteHeaderProps = {
  isQuiz?: boolean;
};

export function SiteHeader({ isQuiz = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-sand/60 bg-ivory/85 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="group flex flex-col">
          <span className="text-[10px] tracking-[0.26em] uppercase text-sage font-medium">
            Cosmética natural
          </span>
          <span className="font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight text-forest transition group-hover:text-sage-dark">
            Aphros
          </span>
        </Link>

        <nav className="flex items-center gap-2.5 sm:gap-4">
          {!isQuiz ? (
            <Link
              href="/quiz"
              className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3.5 py-1.5 text-xs font-semibold text-cream shadow-2xs transition hover:bg-sage-dark active:scale-[0.97]"
            >
              <SparklesIcon className="size-3" />
              <span>Hacer test</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="text-xs sm:text-sm text-mist hover:text-forest transition px-2.5 py-2"
            >
              Inicio
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
