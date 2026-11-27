import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  RotateCcwIcon,
  Share2Icon,
  ShoppingBagIcon,
  SparklesIcon,
} from "lucide-react";
import { AphrosShellMark } from "@/components/AphrosShellMark";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toPublicImageUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";

type Analysis = {
  skinType: string;
  summary: string;
  tips?: string[];
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
    <main className="relative flex min-h-screen flex-1 flex-col">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-4 py-10">
        <Card className="flex h-72 w-full flex-col items-center justify-center rounded-[2rem] border-border/80 bg-card/95 p-8 text-center shadow-xs ring-0">
          <AphrosShellMark
            className="aphros-shell-breathe h-10 w-14"
          />
          <span className="mt-3 text-[10px] font-medium tracking-[0.26em] text-aphros-rose-deep uppercase">
            APHROS
          </span>
          <p className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-normal text-aphros-espresso">
            Cargando tu diagnóstico…
          </p>
          <div className="mt-5 h-1.5 w-36 overflow-hidden rounded-full bg-aphros-blush-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-aphros-wine" />
          </div>
        </Card>
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

  const rawSkinType = analysis.skinType || "mixta";
  const displaySkinType = rawSkinType.toLowerCase().replace(/^piel\s+/, "").trim();

  const whatsappShareText = encodeURIComponent(
    `¡Hola! Hice el test de piel Aphros y mi diagnóstico es piel ${displaySkinType}. Te comparto mi rutina personalizada:`,
  );

  return (
    <main className="relative flex min-h-screen flex-1 flex-col pb-16">
      <SiteHeader />

      {/* Auras de fondo continuas que se desvanecen suavemente sin cortes duros */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="soft-pulse absolute -right-24 top-16 h-[420px] w-[420px] rounded-full bg-radial from-aphros-rose/25 via-aphros-rose/10 to-transparent blur-3xl" />
        <div className="soft-pulse-reverse absolute -left-28 -bottom-16 h-[460px] w-[460px] rounded-full bg-radial from-aphros-blush-200/95 via-aphros-blush-200/40 to-transparent blur-3xl" />
      </div>

      <section className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* TARJETA HERO EDITORIAL: TIPO DE PIEL COMO PROTAGONISTA ABSOLUTO */}
        <div className="fade-up aphros-editorial-dark relative overflow-hidden rounded-[2.25rem] p-7 text-aphros-blush-100 shadow-xl sm:p-10">
          <div className="relative z-10 flex flex-col gap-6 text-center">
            {/* Cabecera con isotipo */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-[0.24em] text-aphros-blush-200/80 uppercase">
                Diagnóstico facial
              </span>
              <AphrosShellMark
                variant="light"
                className="h-7 w-10"
              />
            </div>

            {/* Saludo personal */}
            <div>
              <p className="text-xs font-light tracking-[0.16em] text-aphros-blush-200/85 uppercase">
                Para {submission.name}
              </p>
            </div>

            {/* TIPO DE PIEL DESTACADO COMO PROTAGONISTA */}
            <div className="flex flex-col items-center py-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-aphros-blush-200/30 bg-aphros-blush-100/10 px-4 py-1 text-[11px] font-medium tracking-[0.2em] text-aphros-blush-100 uppercase backdrop-blur-xs">
                <SparklesIcon className="size-3 text-aphros-blush-200" />
                <span>Tu tipo de piel detectado</span>
              </span>

              <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-normal leading-tight text-aphros-blush-50 capitalize sm:text-6xl">
                Piel <span className="italic text-aphros-blush-200">{displaySkinType}</span>
              </h1>

              <div className="mt-4 h-px w-14 bg-aphros-blush-200/40" />

              <p className="mt-4 max-w-md text-xs font-light leading-relaxed text-aphros-blush-100/90 sm:text-sm">
                {analysis.summary}
              </p>
            </div>

            {/* Confirmación del correo */}
            <div className="border-t border-aphros-blush-200/15 pt-4 text-xs">
              {submission.emailSent ? (
                <p className="flex items-center justify-center gap-2 font-normal text-aphros-blush-200">
                  <CheckCircle2Icon className="size-3.5 shrink-0 text-aphros-blush-100" />
                  <span>Enviamos una copia de tu rutina a {submission.email}.</span>
                </p>
              ) : (
                <p className="font-light text-aphros-blush-200/80">
                  Tu diagnóstico está guardado. Conserva este enlace para consultarlo cuando desees.
                </p>
              )}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="aphros-watermark pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 font-[family-name:var(--font-display)] text-7xl text-aphros-blush-100/[0.04] sm:text-8xl"
          >
            APHROS
          </div>
        </div>

        {/* PRODUCTOS RECOMENDADOS */}
        <div className="mt-10">
          <Reveal>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-medium tracking-[0.22em] text-aphros-rose-deep uppercase">
                  Fórmulas naturales ideales
                </span>
                <h2 className="mt-0.5 font-[family-name:var(--font-display)] text-2xl font-normal text-aphros-espresso sm:text-3xl">
                  Tu rutina recomendada
                </h2>
                <p className="text-xs font-light text-mist">
                  {products.length}{" "}
                  {products.length === 1
                    ? "producto seleccionado"
                    : "productos seleccionados"}{" "}
                  para piel {displaySkinType}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-aphros-blush-200/75 text-aphros-wine">
                <ShoppingBagIcon className="size-4.5" />
              </div>
            </div>
          </Reveal>

          <div className="mt-5 flex flex-col gap-4">
            {products.map((product, idx) => (
              <Reveal key={product.id} delay={idx * 80}>
                <Card className="aphros-card-luxury group overflow-hidden rounded-3xl border-border/80 bg-card/95 shadow-2xs ring-0 [--card-spacing:--spacing(4)] sm:[--card-spacing:--spacing(5)]">
                  <CardContent>
                    <div className="flex gap-4">
                      {/* Imagen */}
                      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-aphros-blush-50 sm:size-28">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            unoptimized={
                              product.imageUrl.includes(".svg") ||
                              product.imageUrl.includes("/api/media")
                            }
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                            sizes="(max-width: 640px) 96px, 112px"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-aphros-rose-deep">
                            <AphrosShellMark className="h-6 w-9" />
                            <span className="text-[9px] tracking-[0.2em] uppercase">
                              Aphros
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Detalles */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <Badge
                              variant="secondary"
                              className="h-auto rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-aphros-wine uppercase"
                            >
                              Recomendado
                            </Badge>
                            <span className="text-sm font-semibold text-aphros-espresso">
                              {product.currency} {product.price.toFixed(2)}
                            </span>
                          </div>
                          <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-medium leading-tight text-aphros-espresso sm:text-xl">
                            {product.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs font-light leading-relaxed text-mist">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ACCIONES FINALES */}
        <Reveal delay={120} className="mt-8 flex flex-col gap-3">
          <Button
            asChild
            size="lg"
            className="aphros-btn-luxury h-12 w-full rounded-full text-xs font-medium tracking-wide shadow-sm sm:text-sm"
          >
            <a
              href={`https://wa.me/50254222180?text=${whatsappShareText}`}
              target="_blank"
              rel="noreferrer"
            >
              <Share2Icon data-icon="inline-start" className="size-4" />
              <span>Consultar o enviar a WhatsApp (+502 5422-2180)</span>
            </a>
          </Button>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              asChild
              variant="secondary"
              className="h-11 rounded-full text-xs font-medium text-aphros-espresso transition-transform active:scale-[0.98]"
            >
              <a href="/quiz">
                <RotateCcwIcon data-icon="inline-start" className="size-3.5" />
                <span>Repetir test</span>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-border/90 bg-card/85 text-xs font-medium text-aphros-espresso hover:bg-aphros-blush-50"
            >
              <Link href="/">
                <span>Volver al inicio</span>
                <ArrowRightIcon data-icon="inline-end" className="size-3.5" />
              </Link>
            </Button>
          </div>
        </Reveal>
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
