import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { AphrosShellMark } from "@/components/AphrosShellMark";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";

const STEPS = [
  { num: "01", title: "Responde", desc: "Cuéntanos cómo sientes tu piel." },
  { num: "02", title: "Analizamos", desc: "Elegimos fórmulas botánicas puras." },
  { num: "03", title: "Tu rutina", desc: "Recíbela al instante y en tu correo." },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col overflow-x-clip pb-20 sm:pb-0">
      <SiteHeader />

      {/* HERO MINIMALISTA DE LUJO */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-10 sm:px-10 sm:py-16 lg:min-h-[calc(100svh-5rem)]">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="soft-pulse absolute -right-24 top-8 h-[380px] w-[380px] rounded-full bg-aphros-rose/20 blur-[100px]" />
          <div className="soft-pulse-reverse absolute -left-24 bottom-8 h-[320px] w-[320px] rounded-full bg-aphros-blush-200/90 blur-[90px]" />
        </div>

        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Izquierda: Titular limpio + CTA */}
          <div className="flex flex-col items-start lg:col-span-7">
            <div className="fade-up flex items-center gap-3">
              <span className="h-px w-8 bg-aphros-wine/50" />
              <span className="text-[11px] font-medium tracking-[0.26em] text-aphros-rose-deep uppercase">
                eres arte y queremos cuidarte
              </span>
            </div>

            <h1 className="fade-up-delay mt-5 font-[family-name:var(--font-display)] text-[2.65rem] font-normal leading-[1.06] tracking-[-0.015em] text-aphros-espresso sm:text-6xl lg:text-[4.25rem]">
              Consentirte también es una forma de{" "}
              <span className="italic text-aphros-wine">amarte.</span>
            </h1>

            <p className="fade-up-delay-2 mt-5 max-w-md text-sm font-light leading-relaxed text-aphros-cocoa/85 sm:text-base">
              Descubre en 2 minutos tu rutina artesanal y botánica pensada para
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
                2 min · 100% botánico · Personalizado
              </p>
            </div>
          </div>

          {/* Derecha: Arco editorial borgoña */}
          <div className="fade-up-delay-2 mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
            <div className="aphros-editorial-dark relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-t-[10rem] rounded-b-[2rem] p-8 text-center text-aphros-blush-100 shadow-2xl sm:min-h-[450px] sm:p-10">
              <div className="relative z-10 flex justify-center pt-4">
                <AphrosShellMark
                  className="aphros-shell-breathe h-11 w-16 text-aphros-blush-200"
                  strokeWidth={1.9}
                />
              </div>

              <div className="relative z-10 my-auto py-6">
                <p className="font-[family-name:var(--font-display)] text-2xl font-normal leading-snug text-aphros-blush-50 sm:text-3xl">
                  Eres digna de cada segundo que dediques a{" "}
                  <span className="italic text-aphros-blush-200">cuidarte</span>
                </p>
                <div className="mx-auto mt-5 h-px w-10 bg-aphros-blush-200/40" />
                <p className="mt-4 text-xs font-light tracking-wide text-aphros-blush-200/80">
                  Haz de tus días un regalo para ti
                </p>
              </div>

              <p className="relative z-10 text-[10px] tracking-[0.26em] text-aphros-blush-200/65 uppercase">
                Cosmética natural · Guatemala
              </p>

              <div
                aria-hidden="true"
                className="aphros-watermark pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 font-[family-name:var(--font-display)] text-7xl text-aphros-blush-100/[0.05]"
              >
                APHROS
              </div>
            </div>
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
            <AphrosShellMark
              className="h-5 w-8 text-aphros-espresso/80"
              strokeWidth={2.2}
            />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.24em] text-aphros-espresso">
              APHROS
            </span>
          </div>
          <p className="text-[11px] font-light text-mist">
            eres arte y queremos cuidarte
          </p>
        </div>
      </footer>

      {/* BARRA MÓVIL FIJA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-aphros-espresso/12 bg-aphros-blush-50/92 p-3.5 backdrop-blur-xl sm:hidden">
        <Link
          href="/quiz"
          className="aphros-btn-luxury flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-aphros-wine text-xs font-medium tracking-[0.14em] text-aphros-blush-50 uppercase shadow-md"
        >
          <SparklesIcon className="size-4" />
          <span>Comenzar test gratis</span>
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </main>
  );
}
