import { Suspense } from "react";
import { connection } from "next/server";
import { SiteHeader } from "@/components/SiteHeader";
import { QuizClient } from "@/components/QuizClient";
import { prisma } from "@/lib/prisma";

function QuizFallback() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 md:px-10">
        <p className="mb-2 text-xs tracking-[0.28em] uppercase text-sage">
          Test de piel Aphros
        </p>
        <h1 className="mb-8 font-[family-name:var(--font-display)] text-4xl text-forest">
          Cuéntanos cómo está tu piel
        </h1>
        <p className="text-sm text-mist">Cargando preguntas…</p>
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
      <SiteHeader />
      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 md:px-10">
        <p className="mb-2 text-xs tracking-[0.28em] uppercase text-sage">
          Test de piel Aphros
        </p>
        <h1 className="mb-8 font-[family-name:var(--font-display)] text-4xl text-forest">
          Cuéntanos cómo está tu piel
        </h1>
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
