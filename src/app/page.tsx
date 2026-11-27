import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { AphrosHeroCarouselPlaceholder } from "@/components/AphrosHeroCarousel";
import { HeroProductsCarousel } from "@/components/HeroProductsCarousel";
import { AphrosShellMark, AphrosWordmark } from "@/components/AphrosShellMark";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";

const STEPS = [
  { num: "01", title: "Responde", desc: "Cuéntanos cómo sientes tu piel." },
  { num: "02", title: "Analizamos", desc: "Elegimos fórmulas naturales puras." },
  { num: "03", title: "Tu rutina", desc: "Recíbela al instante y en tu correo." },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <SiteHeader />

      {/* HERO MINIMALISTA DE LUJO — 50% Texto / 50% Carrusel Liquid Glass */}
      <section className="relative flex w-full flex-1 items-center lg:min-h-[calc(100svh-5rem)]">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="soft-pulse absolute -right-24 top-8 h-[380px] w-[380px] rounded-full bg-aphros-rose/20 blur-[100px]" />
          <div className="soft-pulse-reverse absolute -left-24 bottom-8 h-[320px] w-[320px] rounded-full bg-aphros-blush-200/90 blur-[90px]" />
        </div>

        <div className="grid w-full grid-cols-1 items-center lg:grid-cols-2">
          {/* Mitad Izquierda: Titular limpio + CTA */}
          <div className="flex flex-col items-start px-5 py-10 sm:px-10 sm:py-16 lg:py-12 lg:pr-10 lg:pl-[max(2.5rem,calc((100vw-72rem)/2+1.5rem))]">
            <div className="fade-up flex items-center gap-3">
              <span className="h-px w-8 bg-aphros-wine/50" />
              <span className="text-[11px] font-medium tracking-[0.26em] text-aphros-rose-deep uppercase">
                eres arte y queremos cuidarte
              </span>
            </div>

            <h1 className="fade-up-delay mt-5 font-[family-name:var(--font-display)] text-[2.65rem] font-normal leading-[1.06] tracking-[-0.015em] text-aphros-espresso sm:text-6xl lg:text-[4rem] xl:text-[4.25rem]">
              Consentirte también es una forma de{" "}
              <span className="italic text-aphros-wine">amarte.</span>
            </h1>

            <p className="fade-up-delay-2 mt-5 max-w-md text-sm font-light leading-relaxed text-aphros-cocoa/85 sm:text-base">
              Descubre en 2 minutos tu rutina artesanal y natural pensada para
              tu piel.
            </p>

            <div className="fade-up-delay-3 mt-8 flex w-full flex-col gap-5 sm:w-auto">
              <Link
                href="/quiz"
                className="aphros-btn-luxury group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-aphros-wine px-9 text-xs font-medium tracking-[0.14em] text-aphros-blush-50 uppercase shadow-md sm:h-14"
              >
                <span>Comenzar test gratis</span>
                <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <p className="text-[11px] font-light tracking-[0.16em] text-mist uppercase">
                2 min · 100% natural · Personalizado
              </p>
            </div>
          </div>

          {/* Mitad Derecha: Liquid Glass Carousel ocupando 50% de la pantalla sin fondo/marco */}
          <div className="fade-up-delay-2 w-full">
            <Suspense fallback={<AphrosHeroCarouselPlaceholder />}>
              <HeroProductsCarousel />
            </Suspense>
          </div>
        </div>
      </section>

      {/* BANDA COMPACTA DE 3 PASOS */}
      <section className="border-t border-aphros-espresso/12 bg-aphros-blush-50/75">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-aphros-espresso/10 px-5 sm:px-10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {STEPS.map((step, idx) => (
            <Reveal
              key={step.num}
              delay={idx * 90}
              className="flex items-baseline gap-4 py-7 md:px-8 md:py-9 md:first:pl-0 md:last:pr-0"
            >
              <span className="font-[family-name:var(--font-display)] text-2xl text-aphros-rose">
                {step.num}
              </span>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-normal text-aphros-espresso">
                  {step.title}
                </h2>
                <p className="mt-0.5 text-xs font-light text-mist">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FOOTER MÍNIMO */}
      <footer className="border-t border-aphros-espresso/10 bg-aphros-blush-50/40 px-5 py-7 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AphrosShellMark className="h-6 w-9" />
            <AphrosWordmark className="h-4.5 w-auto" />
          </div>
          <p className="text-[11px] font-light text-mist">
            eres arte y queremos cuidarte
          </p>
        </div>
      </footer>
    </main>
  );
}
