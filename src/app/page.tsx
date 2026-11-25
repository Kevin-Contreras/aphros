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

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col pb-24 sm:pb-12">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative flex flex-col justify-center px-4 pt-6 pb-10 sm:px-8 sm:py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="soft-pulse absolute -right-12 top-4 h-64 w-64 rounded-full bg-sage/15 blur-3xl" />
          <div className="absolute -left-12 bottom-4 h-60 w-60 rounded-full bg-clay/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-xl text-center">
          {/* Badge */}
          <div className="fade-up mx-auto inline-flex items-center gap-1.5 rounded-full border border-sand bg-cream/80 px-3.5 py-1 text-[11px] font-medium tracking-wider text-sage uppercase shadow-2xs">
            <LeafIcon className="size-3 text-sage" />
            <span>Guatemala · Cosmética botánica</span>
          </div>

          {/* Title */}
          <h1 className="fade-up mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.08] text-forest sm:text-6xl sm:leading-[1.05]">
            Descubre qué necesita tu piel
          </h1>

          {/* Description */}
          <p className="fade-up-delay mx-auto mt-3.5 max-w-md text-sm leading-relaxed text-mist sm:text-base">
            En menos de 2 minutos, nuestra IA evalúa tu piel y diseña una rutina
            artesanal personalizada con productos naturales Aphros.
          </p>

          {/* CTAs */}
          <div className="fade-up-delay mt-6 flex justify-center">
            <Link
              href="/quiz"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-sage px-6 text-base font-semibold tracking-wide text-cream shadow-sm transition hover:bg-sage-dark active:scale-[0.98] sm:w-auto sm:px-8"
            >
              <span>Empezar test gratis</span>
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>

          {/* Mobile Trust Signals */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-mist">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5 text-sage" />
              Solo 2 minutos
            </span>
            <span className="inline-flex items-center gap-1">
              <SparklesIcon className="size-3.5 text-sage" />
              Diagnóstico con IA
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheckIcon className="size-3.5 text-sage" />
              100% Natural
            </span>
          </div>
        </div>
      </section>

      {/* Steps Journey */}
      <section className="border-t border-sand/70 bg-cream/50 px-4 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-sage">
              Paso a paso
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl">
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
                title: "Diagnóstico inteligente",
                desc: "Nuestra IA analiza tus respuestas y las cruza con las formulaciones botánicas de Aphros.",
              },
              {
                step: "3",
                title: "Recibe tu rutina exacta",
                desc: "Obtienes recomendaciones con enlace directo de compra y consejos de aplicación en tu correo y pantalla.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-3.5 rounded-2xl border border-sand/80 bg-background/90 p-4 shadow-2xs"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sage/15 font-heading text-sm font-semibold text-sage-dark">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Aphros Section */}
      <section className="px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-sand bg-linear-to-b from-cream/90 to-ivory p-6 text-center shadow-xs sm:p-8">
          <HeartIcon className="mx-auto size-7 text-sage" />
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl">
            Cuidado consciente para tu piel
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-mist sm:text-sm">
            Aphros elabora productos libres de sulfatos y parabenos, respetando
            tu barrera cutánea con ingredientes botánicos de origen consciente.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2.5 text-left text-xs">
            <div className="flex items-center gap-1.5 rounded-xl border border-sand/60 bg-background/60 p-2.5">
              <CheckCircle2Icon className="size-4 shrink-0 text-sage" />
              <span>Sin químicos agresivos</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-sand/60 bg-background/60 p-2.5">
              <CheckCircle2Icon className="size-4 shrink-0 text-sage" />
              <span>Ingredientes puros</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-sand/60 bg-background/60 p-2.5">
              <CheckCircle2Icon className="size-4 shrink-0 text-sage" />
              <span>Artesanal de Guatemala</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-sand/60 bg-background/60 p-2.5">
              <CheckCircle2Icon className="size-4 shrink-0 text-sage" />
              <span>Rutinas minimalistas</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/quiz"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sage px-6 text-sm font-semibold text-cream shadow-2xs transition hover:bg-sage-dark active:scale-[0.98]"
            >
              <span>Hacer mi test personalizado</span>
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand/80 bg-ivory/95 p-3.5 backdrop-blur-md sm:hidden">
        <Link
          href="/quiz"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sage font-semibold text-sm text-cream shadow-md active:scale-[0.98]"
        >
          <SparklesIcon className="size-4" />
          <span>Comenzar test de piel gratis</span>
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </main>
  );
}
