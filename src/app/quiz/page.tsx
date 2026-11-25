import { Suspense } from "react";
import { connection } from "next/server";
import { SiteHeader } from "@/components/SiteHeader";
import { QuizClient } from "@/components/QuizClient";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

function QuizFallback() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader isQuiz />
      <section className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-6">
        <Card className="flex h-64 flex-col items-center justify-center rounded-3xl p-6 text-center">
          <Badge variant="secondary" className="h-auto px-3 py-1 uppercase tracking-[0.25em]">
            Aphros
          </Badge>
          <p className="mt-2 font-heading text-2xl text-foreground">Cargando tu test…</p>
          <div className="mt-4 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
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
