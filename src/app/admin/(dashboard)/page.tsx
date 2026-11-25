import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AiUsageBar } from "@/components/AiUsageBar";
import { getAiUsageToday } from "@/lib/ai-usage";
import { prisma } from "@/lib/prisma";

function AdminHomeFallback() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-forest">
        Resumen
      </h1>
      <p className="mt-2 text-sm text-mist">Cargando…</p>
    </div>
  );
}

async function AdminHomeContent() {
  await connection();
  const [products, questions, submissions, aiUsage] = await Promise.all([
    prisma.product.count(),
    prisma.question.count(),
    prisma.quizSubmission.count(),
    getAiUsageToday(),
  ]);

  const recent = await prisma.quizSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-forest">
        Resumen
      </h1>
      <p className="mt-2 text-sm text-mist">
        Gestiona el quiz, el catálogo y revisa los envíos de Aphros.
      </p>

      <div className="mt-8">
        <AiUsageBar usage={aiUsage} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Productos", value: products, href: "/admin/productos" },
          { label: "Preguntas", value: questions, href: "/admin/preguntas" },
          { label: "Envíos", value: submissions, href: "/admin/envios" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-sand bg-cream p-5 transition hover:border-sage"
          >
            <p className="text-sm text-mist">{card.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl text-forest">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-[family-name:var(--font-display)] text-2xl text-forest">
        Últimos envíos
      </h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-sand bg-cream">
        {recent.length === 0 ? (
          <p className="p-5 text-sm text-mist">Aún no hay respuestas del quiz.</p>
        ) : (
          <ul className="divide-y divide-sand">
            {recent.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-forest">{item.name}</p>
                  <p className="text-xs text-mist">{item.email}</p>
                  {item.whatsapp ? (
                    <p className="text-xs text-mist">WA: {item.whatsapp}</p>
                  ) : null}
                </div>
                <p className="text-xs text-mist">
                  {new Date(item.createdAt).toLocaleString("es-GT")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <Suspense fallback={<AdminHomeFallback />}>
      <AdminHomeContent />
    </Suspense>
  );
}
