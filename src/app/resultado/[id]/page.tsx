import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  LightbulbIcon,
  RotateCcwIcon,
  Share2Icon,
  ShoppingBagIcon,
  SparklesIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <Card className="flex h-64 flex-col items-center justify-center p-6 text-center">
          <Badge variant="secondary" className="uppercase tracking-[0.25em]">Aphros</Badge>
          <p className="mt-2 font-heading text-2xl text-forest">Cargando tu diagnóstico…</p>
          <div className="mt-4 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
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
        {/* Diagnostic Hero Card using shadcn Card */}
        <Card className="rounded-3xl border-border bg-linear-to-b from-card to-secondary/35 shadow-xs [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(7)]">
          <CardHeader className="gap-3">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="h-auto gap-1.5 px-3 py-1 uppercase tracking-wider font-semibold">
                <SparklesIcon data-icon="inline-start" />
                <span>Diagnóstico Facial</span>
              </Badge>
              <span className="text-[11px] text-muted-foreground font-medium">Aphros Lab</span>
            </div>

            <CardTitle className="font-[family-name:var(--font-display)] text-3xl font-medium text-forest sm:text-4xl leading-tight">
              Hola, {submission.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary-foreground/80">
                Tipo de piel detectado
              </p>
              <p className="mt-0.5 font-[family-name:var(--font-display)] text-2xl font-semibold capitalize text-secondary-foreground">
                Piel {analysis.skinType}
              </p>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {analysis.summary}
            </p>

            <div className="border-t border-border/70 pt-3 text-xs">
              {submission.emailSent ? (
                <p className="flex items-center gap-1.5 text-primary font-medium">
                  <CheckCircle2Icon className="size-3.5 shrink-0" />
                  <span>Enviamos una copia con tus recomendaciones a {submission.email}.</span>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Tu diagnóstico está guardado. Guarda este enlace para consultarlo cuando desees.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Products */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-forest sm:text-3xl">
                Productos Recomendados
              </h2>
              <p className="text-xs text-muted-foreground">
                {products.length} {products.length === 1 ? "producto seleccionado" : "productos seleccionados"} para ti
              </p>
            </div>
            <ShoppingBagIcon className="size-5 text-primary" />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden rounded-3xl border-border bg-card shadow-2xs [--card-spacing:--spacing(4)] sm:[--card-spacing:--spacing(5)]"
              >
                <CardContent>
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-background sm:size-28">
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
                        <div className="flex h-full items-center justify-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                          Aphros
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <Badge variant="secondary" className="h-auto px-2.5 py-0.5 text-[10px] uppercase font-semibold">
                            Recomendado
                          </Badge>
                          <span className="font-semibold text-sm text-foreground">
                            {product.currency} {product.price.toFixed(2)}
                          </span>
                        </div>
                        <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-medium leading-tight text-forest sm:text-xl">
                          {product.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Reason Callout */}
                  {product.reason ? (
                    <div className="mt-3.5 rounded-2xl border border-border bg-secondary/60 p-3 text-xs leading-relaxed text-secondary-foreground">
                      <span className="font-semibold">¿Por qué este producto? </span>
                      <span>{product.reason}</span>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips Section with shadcn Card */}
        {analysis.tips?.length ? (
          <Card className="mt-8 rounded-3xl border-border bg-secondary/30 [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LightbulbIcon className="size-4 text-secondary-foreground" />
                <CardTitle className="font-[family-name:var(--font-display)] text-xl font-medium text-forest">
                  Consejos de Cuidado Aphros
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                {analysis.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="font-semibold text-secondary-foreground">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {/* Mobile Action Buttons using shadcn Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="h-12 w-full rounded-2xl text-xs sm:text-sm font-semibold shadow-2xs active:scale-[0.98]"
          >
            <a href={`https://wa.me/?text=${whatsappShareText}`} target="_blank" rel="noreferrer">
              <Share2Icon data-icon="inline-start" />
              <span>Compartir mi rutina por WhatsApp</span>
            </a>
          </Button>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              asChild
              variant="secondary"
              className="h-11 rounded-xl text-xs font-medium active:scale-[0.98]"
            >
              <Link href="/quiz">
                <RotateCcwIcon data-icon="inline-start" />
                <span>Repetir test</span>
              </Link>
            </Button>

            <Button
              asChild
              className="h-11 rounded-xl text-xs font-semibold shadow-2xs active:scale-[0.98]"
            >
              <Link href="/">
                <span>Volver al inicio</span>
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
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
