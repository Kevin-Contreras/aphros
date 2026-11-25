import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  LightbulbIcon,
  RotateCcwIcon,
  Share2Icon,
  ShoppingBagIcon,
  SparklesIcon,
} from "lucide-react";
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
      <section className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-sand bg-cream/70 p-6 text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-sage">Aphros</p>
          <p className="mt-2 font-heading text-2xl text-forest">Cargando tu diagnóstico…</p>
          <div className="mt-4 h-1.5 w-32 overflow-hidden rounded-full bg-sand">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-sage" />
          </div>
        </div>
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

  // Enrich with current catalog images
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

  const whatsappShareText = encodeURIComponent(
    `¡Hola! Hice el test de piel Aphros y mi diagnóstico es piel ${analysis.skinType}. Te comparto mi rutina personalizada:`,
  );

  return (
    <main className="flex flex-1 flex-col pb-16">
      <SiteHeader />

      <section className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {/* Diagnostic Hero Card */}
        <div className="rounded-3xl border border-blush-border bg-linear-to-b from-cream/95 to-blush/30 p-5 shadow-xs sm:p-7">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blush-border bg-blush px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blush-dark">
              <SparklesIcon className="size-3" />
              Diagnóstico Facial
            </span>
            <span className="text-[11px] text-mist font-medium">Aphros Lab</span>
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-medium text-forest sm:text-4xl leading-tight">
            Hola, {submission.name}
          </h1>

          <div className="mt-4 rounded-2xl border border-blush-border bg-blush/35 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-mist">
              Tipo de piel detectado
            </p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-2xl font-semibold capitalize text-forest">
              Piel {analysis.skinType}
            </p>
          </div>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-mist">
            {analysis.summary}
          </p>

          <div className="mt-4 border-t border-sand/60 pt-3 text-xs">
            {submission.emailSent ? (
              <p className="flex items-center gap-1.5 text-sage-dark">
                <CheckCircle2Icon className="size-3.5 shrink-0" />
                <span>Enviamos una copia con tus recomendaciones a {submission.email}.</span>
              </p>
            ) : (
              <p className="text-mist">
                Tu diagnóstico está guardado. Guarda este enlace para consultarlo cuando desees.
              </p>
            )}
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-forest sm:text-3xl">
                Tu Rutina Recomendada
              </h2>
              <p className="text-xs text-mist">
                {products.length} {products.length === 1 ? "producto seleccionado" : "productos seleccionados"} para ti
              </p>
            </div>
            <ShoppingBagIcon className="size-5 text-sage" />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {products.map((product, idx) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-sand bg-cream/95 p-4 shadow-2xs sm:p-5"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-sand/70 bg-ivory sm:size-28">
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
                        sizes="(max-width: 640px) 96px, 112px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] tracking-[0.2em] uppercase text-sage">
                        Aphros
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="rounded-md border border-blush-border bg-blush px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blush-dark">
                          Paso {idx + 1}
                        </span>
                        <span className="font-semibold text-sm text-forest">
                          {product.currency} {product.price.toFixed(2)}
                        </span>
                      </div>
                      <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-medium leading-tight text-forest sm:text-xl">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mist">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Reason Callout */}
                {product.reason ? (
                  <div className="mt-3.5 rounded-2xl border border-blush-border bg-blush/50 p-3 text-xs leading-relaxed text-blush-foreground">
                    <span className="font-semibold text-blush-dark">¿Por qué este producto? </span>
                    <span>{product.reason}</span>
                  </div>
                ) : null}

                {/* Mobile Direct Buy Button */}
                <div className="mt-3.5">
                  <a
                    href={product.buyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-sage text-xs font-semibold text-cream shadow-2xs transition hover:bg-sage-dark active:scale-[0.98]"
                  >
                    <span>Comprar en Pacifiko</span>
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        {analysis.tips?.length ? (
          <div className="mt-8 rounded-3xl border border-blush-border bg-blush/25 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <LightbulbIcon className="size-4 text-blush-dark" />
              <h2 className="font-[family-name:var(--font-display)] text-xl font-medium text-forest">
                Consejos de Cuidado Aphros
              </h2>
            </div>
            <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-mist">
              {analysis.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="font-semibold text-blush-dark">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Mobile Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <a
            href={`https://wa.me/?text=${whatsappShareText}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blush-border bg-blush text-xs sm:text-sm font-semibold text-blush-foreground transition active:scale-[0.98] hover:bg-blush-hover"
          >
            <Share2Icon className="size-4 text-blush-dark" />
            <span>Compartir mi rutina por WhatsApp</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/quiz"
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-blush-border bg-blush/60 text-xs font-medium text-blush-foreground transition hover:bg-blush active:scale-[0.98]"
            >
              <RotateCcwIcon className="size-3.5 text-blush-dark" />
              <span>Repetir test</span>
            </Link>

            <Link
              href="/"
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-forest text-xs font-semibold text-cream shadow-2xs transition active:scale-[0.98]"
            >
              <span>Volver al inicio</span>
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
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
