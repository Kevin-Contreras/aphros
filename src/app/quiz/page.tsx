import { Suspense } from "react";
import { connection } from "next/server";
import { AphrosShellMark } from "@/components/AphrosShellMark";
import { QuizClient } from "@/components/QuizClient";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

function QuizFallback() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader isQuiz />
      <section className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6">
        <Card className="flex h-72 flex-col items-center justify-center rounded-[2rem] border-border/80 bg-card/95 p-8 text-center shadow-xs ring-0">
          <AphrosShellMark
            className="aphros-shell-breathe h-9 w-13 text-aphros-wine"
            strokeWidth={2.2}
          />
          <span className="mt-3 text-[10px] font-medium tracking-[0.26em] text-aphros-rose-deep uppercase">
            APHROS
          </span>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-normal text-aphros-espresso">
            Preparando tu test…
          </p>
          <div className="mt-5 h-1.5 w-36 overflow-hidden rounded-full bg-aphros-blush-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-aphros-wine" />
          </div>
        </Card>
      </section>
    </main>
  );
}

async function QuizContent() {
  await connection();
  const questions = await prisma.question.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: { options: { orderBy: { order: "asc" } } },
  });

  return (
    <main className="relative flex min-h-screen flex-1 flex-col">
      <SiteHeader isQuiz />
      {/* Auras orgánicas integradas que se desvanecen suavemente sin cortes duros */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="soft-pulse absolute -right-24 top-16 h-96 w-96 rounded-full bg-radial from-aphros-rose/25 via-aphros-rose/10 to-transparent blur-2xl" />
        <div className="soft-pulse-reverse absolute -left-24 -bottom-16 h-[420px] w-[420px] rounded-full bg-radial from-aphros-blush-200/95 via-aphros-blush-200/40 to-transparent blur-2xl" />
      </div>
      <section className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full">
          <QuizClient questions={questions} />
        </div>
      </section>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizFallback />}>
      <QuizContent />
    </Suspense>
  );
}
