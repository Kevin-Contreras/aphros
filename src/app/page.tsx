import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="relative flex flex-1 flex-col justify-center px-6 pb-16 pt-8 md:px-10 md:pb-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="soft-pulse absolute -right-16 top-10 h-72 w-72 rounded-full bg-sage/15 blur-3xl" />
          <div className="absolute -left-10 bottom-10 h-64 w-64 rounded-full bg-clay/10 blur-3xl" />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 opacity-40"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236b8f71' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="fade-up mb-4 text-xs tracking-[0.35em] uppercase text-sage">
            Guatemala · Cosmética artesanal
          </p>
          <h1 className="fade-up font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-forest md:text-7xl">
            Aphros
          </h1>
          <p className="fade-up-delay mx-auto mt-5 max-w-xl text-base leading-relaxed text-mist md:text-lg">
            Descubre qué necesita tu piel y recibe una rutina con productos
            naturales Aphros, pensados para cuidarte con calma.
          </p>

          <div className="fade-up-delay mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/quiz"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-sage px-8 py-3.5 text-sm font-semibold tracking-wide text-cream transition hover:bg-sage-dark"
            >
              Empezar test de piel
            </Link>
            <a
              href="https://www.pacifiko.com/marketplace/aphros"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-sand bg-cream/70 px-8 py-3.5 text-sm font-medium text-forest transition hover:border-sage"
            >
              Ver productos
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-sand/80 bg-cream/50 px-6 py-14 md:px-10">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
          {[
            {
              title: "Responde",
              text: "Unas pocas preguntas sobre tu tipo de piel, sensibilidad y rutina actual.",
            },
            {
              title: "Analizamos",
              text: "Nuestra IA interpreta tus respuestas junto al catálogo Aphros.",
            },
            {
              title: "Recibes",
              text: "Recomendaciones claras en pantalla y por correo, listas para comprar.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-forest">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mist">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
