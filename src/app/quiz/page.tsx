import { Suspense } from "react";
import { connection } from "next/server";
import { SiteHeader } from "@/components/SiteHeader";
import { QuizClient } from "@/components/QuizClient";
import { prisma } from "@/lib/prisma";

function QuizFallback() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader isQuiz />
      <section className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-6">
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-sand bg-cream/70 p-6 text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-sage">Aphros</p>
          <p className="mt-2 font-heading text-2xl text-forest">Cargando tu test…</p>
          <div className="mt-4 h-1.5 w-32 overflow-hidden rounded-full bg-sand">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-sage" />
          </div>
        </div>
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
    <main className="flex flex-1 flex-col">
      <SiteHeader isQuiz />
      <section className="mx-auto w-full max-w-xl flex-1 px-4 py-5 sm:px-6 sm:py-8">
        <QuizClient questions={questions} />
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
