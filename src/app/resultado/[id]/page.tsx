import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { SiteHeader } from "@/components/SiteHeader";
import { toPublicImageUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";

type Analysis = {
  skinType: string;
  summary: string;
  tips: string[];
  reasons?: Record<string, string>;
};

type RecommendedProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
  buyUrl: string;
  reason?: string | null;
};

function ResultadoFallback() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <section className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 md:px-10">
        <p className="text-sm text-mist">Cargando tu resultado…</p>
      </section>
    </main>
  );
}

async function ResultadoContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const submission = await prisma.quizSubmission.findUnique({ where: { id } });
  if (!submission) notFound();

  const analysis = JSON.parse(submission.skinAnalysis) as Analysis;
  const storedProducts = JSON.parse(
    submission.recommendedProducts,
  ) as RecommendedProduct[];

  // Enrich with current catalog images (covers older submissions)
  const fresh = await prisma.product.findMany({
    where: { id: { in: storedProducts.map((p) => p.id) } },
    select: { id: true, imageUrl: true },
  });
  const imageById = Object.fromEntries(
    fresh.map((product) => [product.id, product.imageUrl]),
  );
  const products = storedProducts.map((product) => {
    const raw = product.imageUrl || imageById[product.id] || null;
    return {
      ...product,
      imageUrl: toPublicImageUrl(raw),
    };
  });

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <section className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 md:px-10">
        <p className="text-xs tracking-[0.28em] uppercase text-sage">Tu resultado</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-forest md:text-5xl">
          Hola {submission.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist">
          {analysis.summary}
        </p>

        <div className="mt-6 inline-flex rounded-full border border-sand bg-cream px-4 py-2 text-sm text-forest">
          Tipo de piel estimado:{" "}
          <span className="ml-1 font-semibold capitalize">{analysis.skinType}</span>
        </div>

        {submission.emailSent ? (
          <p className="mt-4 text-sm text-sage-dark">
            También enviamos este resultado a {submission.email}.
          </p>
        ) : (
          <p className="mt-4 text-sm text-clay">
            Guardamos tu resultado. El correo se enviará cuando Brevo esté configurado.
          </p>
        )}

        <h2 className="mt-12 font-[family-name:var(--font-display)] text-3xl text-forest">
          Productos recomendados
        </h2>
        <div className="mt-6 grid gap-5">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-3xl border border-sand bg-cream/90 p-5 md:p-7"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-sand bg-ivory sm:mx-0">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized={
                        product.imageUrl.includes(".svg") ||
                        product.imageUrl.includes("/api/media")
                      }
                      className="object-cover"
                      sizes="144px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs tracking-[0.2em] uppercase text-sage">
                      Aphros
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl">
                      <h3 className="font-[family-name:var(--font-display)] text-2xl text-forest">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-mist">
                        {product.description}
                      </p>
                      {product.reason ? (
                        <p className="mt-3 text-sm italic text-clay">{product.reason}</p>
                      ) : null}
                    </div>
                    <div className="shrink-0 md:text-right">
                      <p className="text-lg font-semibold text-forest">
                        {product.currency}
                        {product.price.toFixed(2)}
                      </p>
                      <a
                        href={product.buyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-cream hover:bg-sage-dark"
                      >
                        Comprar en Pacifiko
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {analysis.tips?.length ? (
          <div className="mt-12 rounded-3xl border border-sand bg-ivory/70 p-6 md:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-forest">
              Tips Aphros
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-mist">
              {analysis.tips.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/quiz"
            className="rounded-full border border-sand bg-cream px-5 py-2.5 text-sm text-forest"
          >
            Repetir test
          </Link>
          <Link
            href="/"
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function ResultadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ResultadoFallback />}>
      <ResultadoContent params={params} />
    </Suspense>
  );
}
