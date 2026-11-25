import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

type SkinAnalysis = {
  skinType?: string;
  summary?: string;
};

type RecommendedProduct = {
  name: string;
};

function EnviosFallback() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-forest">
        Envíos
      </h1>
      <p className="mt-2 text-sm text-mist">Cargando…</p>
    </div>
  );
}

async function EnviosContent() {
  await connection();
  const submissions = await prisma.quizSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-forest">
        Envíos
      </h1>
      <p className="mt-2 text-sm text-mist">
        Historial de personas que completaron el quiz de piel.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-sand bg-cream">
        {submissions.length === 0 ? (
          <p className="p-5 text-sm text-mist">Aún no hay envíos.</p>
        ) : (
          <ul className="divide-y divide-sand">
            {submissions.map((item) => {
              let analysis: SkinAnalysis = {};
              let products: RecommendedProduct[] = [];
              try {
                analysis = JSON.parse(item.skinAnalysis) as SkinAnalysis;
              } catch {
                analysis = {};
              }
              try {
                products = JSON.parse(item.recommendedProducts) as RecommendedProduct[];
              } catch {
                products = [];
              }

              return (
                <li key={item.id} className="px-5 py-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium text-forest">{item.name}</p>
                      <p className="text-sm text-mist">{item.email}</p>
                      <p className="mt-2 text-sm text-forest">
                        Tipo de piel: {analysis.skinType || "—"}
                      </p>
                      {analysis.summary ? (
                        <p className="mt-1 max-w-2xl text-sm text-mist">
                          {analysis.summary}
                        </p>
                      ) : null}
                      {products.length > 0 ? (
                        <p className="mt-2 text-xs text-mist">
                          Recomendados: {products.map((p) => p.name).join(" · ")}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-left md:text-right">
                      <p className="text-xs text-mist">
                        {new Date(item.createdAt).toLocaleString("es-GT")}
                      </p>
                      <p className="mt-1 text-xs text-mist">
                        Email: {item.emailSent ? "enviado" : "no enviado"}
                      </p>
                      <Link
                        href={`/resultado/${item.id}`}
                        className="mt-2 inline-block text-xs text-sage hover:text-sage-dark"
                      >
                        Ver resultado →
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminSubmissionsPage() {
  return (
    <Suspense fallback={<EnviosFallback />}>
      <EnviosContent />
    </Suspense>
  );
}
