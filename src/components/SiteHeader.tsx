import Link from "next/link";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  isQuiz?: boolean;
};

export function SiteHeader({ isQuiz = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-sand/60 bg-ivory/85 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="group flex flex-col">
          <span className="text-[10px] tracking-[0.26em] uppercase text-blush-dark font-medium">
            Cosmética natural
          </span>
          <span className="font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight text-forest transition group-hover:text-sage-dark">
            Aphros
          </span>
        </Link>

        <nav className="flex items-center gap-2.5 sm:gap-4">
          {!isQuiz ? (
            <Button asChild size="sm" className="h-9 rounded-full px-4 shadow-2xs font-semibold">
              <Link href="/quiz">
                <SparklesIcon data-icon="inline-start" />
                <span>Hacer test</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm text-mist hover:text-forest">
              <Link href="/">
                Inicio
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
