import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  HeartIcon,
  LeafIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col pb-24 sm:pb-12">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative flex flex-col justify-center px-4 pt-6 pb-10 sm:px-8 sm:py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="soft-pulse absolute -right-12 top-4 h-64 w-64 rounded-full bg-secondary/80 blur-3xl" />
          <div className="absolute -left-12 bottom-4 h-60 w-60 rounded-full bg-secondary/60 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-xl text-center">
          {/* Badge using shadcn variant="secondary" */}
          <div className="fade-up flex justify-center">
            <Badge variant="secondary" className="h-auto gap-1.5 px-3.5 py-1.5 text-xs tracking-wider uppercase shadow-2xs font-semibold">
              <LeafIcon data-icon="inline-start" />
              <span>Guatemala · Cosmética botánica</span>
            </Badge>
          </div>

          {/* Title */}
          <h1 className="fade-up mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.08] text-forest sm:text-6xl sm:leading-[1.05]">
            Descubre qué necesita tu piel
          </h1>

          {/* Description */}
          <p className="fade-up-delay mx-auto mt-3.5 max-w-md text-sm leading-relaxed text-mist sm:text-base">
            En menos de 2 minutos, evaluamos tu piel y diseñamos una rutina
            artesanal personalizada con productos naturales Aphros.
          </p>

          {/* CTA using shadcn Button */}
          <div className="fade-up-delay mt-6 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-13 w-full rounded-2xl text-base font-semibold tracking-wide shadow-sm active:scale-[0.98] sm:w-auto sm:px-8"
            >
              <Link href="/quiz">
                <span>Empezar test gratis</span>
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {/* Mobile Trust Badges using shadcn */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="h-auto gap-1.5 bg-background/60 px-3 py-1 text-xs text-mist">
              <ClockIcon className="size-3 text-secondary-foreground" />
              <span>Solo 2 minutos</span>
            </Badge>
            <Badge variant="secondary" className="h-auto gap-1.5 px-3 py-1 text-xs">
              <SparklesIcon className="size-3 text-secondary-foreground" />
              <span>Diagnóstico personalizado</span>
            </Badge>
            <Badge variant="outline" className="h-auto gap-1.5 bg-background/60 px-3 py-1 text-xs text-mist">
              <ShieldCheckIcon className="size-3 text-secondary-foreground" />
              <span>100% Natural</span>
            </Badge>
          </div>
        </div>
      </section>

      {/* Steps Journey with shadcn Cards */}
      <section className="border-t border-border/70 bg-cream/50 px-4 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <Badge variant="secondary" className="h-auto px-3 py-1 font-semibold uppercase tracking-[0.2em]">
              Paso a paso
            </Badge>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl">
              ¿Cómo funciona el test?
            </h2>
          </div>

          <div className="mt-6 flex flex-col gap-3.5">
            {[
              {
                step: "1",
                title: "Responde sobre tu piel",
                desc: "Preguntas rápidas sobre tu nivel de oleosidad, sensibilidad, exposición al sol y objetivos.",
              },
              {
                step: "2",
                title: "Análisis personalizado",
                desc: "Analizamos tus respuestas y las cruzamos con las formulaciones botánicas de Aphros.",
              },
              {
                step: "3",
                title: "Recibe tu rutina exacta",
                desc: "Obtienes recomendaciones con enlace directo de compra y consejos de aplicación en tu correo y pantalla.",
              },
            ].map((item) => (
              <Card
                key={item.step}
                className="flex flex-row items-start gap-3.5 border-border/80 bg-background/90 p-4 shadow-2xs"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary font-heading text-sm font-semibold text-secondary-foreground">
                  {item.step}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-base font-semibold text-forest">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-mist">
                    {item.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Aphros Section with shadcn Card */}
      <section className="px-4 py-10 sm:px-8">
        <Card className="mx-auto max-w-xl rounded-3xl border-border bg-linear-to-b from-card to-secondary/30 text-center shadow-xs [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(7)]">
          <CardHeader className="justify-items-center gap-2">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <HeartIcon className="size-6" />
            </div>
            <CardTitle className="mt-1 font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl">
              Cuidado consciente para tu piel
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed text-mist sm:text-sm">
              Aphros elabora productos libres de sulfatos y parabenos, respetando
              tu barrera cutánea con ingredientes botánicos de origen consciente.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-2.5 text-left text-xs">
              <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 p-2.5">
                <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
                <span>Sin químicos agresivos</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 p-2.5">
                <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
                <span>Ingredientes puros</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 p-2.5">
                <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
                <span>Artesanal de Guatemala</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 p-2.5">
                <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
                <span>Rutinas minimalistas</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                asChild
                className="h-12 w-full rounded-2xl text-sm font-semibold shadow-2xs active:scale-[0.98]"
              >
                <Link href="/quiz">
                  <span>Hacer mi test personalizado</span>
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sticky Mobile Bottom Bar using shadcn Button */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 p-3.5 backdrop-blur-md sm:hidden">
        <Button
          asChild
          size="lg"
          className="h-12 w-full rounded-xl font-semibold text-sm shadow-md active:scale-[0.98]"
        >
          <Link href="/quiz">
            <SparklesIcon data-icon="inline-start" />
            <span>Comenzar test de piel gratis</span>
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
