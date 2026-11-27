import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductsWheelExplorer } from "@/components/ProductsWheelExplorer";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Catálogo de Productos | Aphros Cosmética Natural",
  description:
    "Descubre nuestra línea botánica de cosmética artesanal elaborada en Guatemala. Fórmulas puras, limpias y adaptadas a cada tipo de piel.",
};

async function ProductosFeed() {
  await connection();

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  return <ProductsWheelExplorer products={products} />;
}

function ProductosSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
      {/* Esqueleto de la rueda solo en desktop */}
      <div className="hidden lg:block h-[540px] w-full animate-pulse rounded-3xl bg-aphros-blush-100/30" />
      <div className="hidden lg:block mx-auto h-36 max-w-2xl animate-pulse rounded-3xl bg-aphros-blush-100/20" />

      {/* Esqueleto en responsive */}
      <div className="lg:hidden mx-auto h-11 max-w-md w-full animate-pulse rounded-full bg-aphros-blush-100/40" />
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-72 w-full animate-pulse rounded-3xl bg-aphros-blush-100/30"
          />
        ))}
      </div>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-aphros-blush-50 text-aphros-espresso selection:bg-aphros-wine selection:text-aphros-blush-50">
      <SiteHeader />

      {/* Auras de fondo suaves con la paleta Aphros */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="soft-pulse absolute -right-24 top-20 h-[500px] w-[500px] rounded-full bg-radial from-aphros-rose/20 via-aphros-rose/5 to-transparent blur-3xl" />
        <div className="soft-pulse-reverse absolute -left-32 top-1/2 h-[550px] w-[550px] rounded-full bg-radial from-aphros-blush-200/80 via-aphros-blush-200/30 to-transparent blur-3xl" />
      </div>

      <main className="flex-1 pb-16">
        {/* Explorador con WheelCarousel interactivo a pantalla completa */}
        <Suspense fallback={<ProductosSkeleton />}>
          <ProductosFeed />
        </Suspense>
      </main>

      {/* Pie de página sutil */}
      <footer className="mt-20 border-t border-aphros-espresso/10 bg-aphros-blush-100/60 py-10 text-center">
        <div className="mx-auto max-w-5xl px-4">
          <p className="font-[family-name:var(--font-display)] text-lg text-aphros-wine">
            Aphros · Cosmética Natural
          </p>
          <p className="mt-1 text-xs text-aphros-cocoa/70">
            Hecho a mano en Guatemala con amor e ingredientes botánicos puros.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-xs text-aphros-wine">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            <Link href="/quiz" className="hover:underline">
              Test de Piel
            </Link>
            <a
              href="https://wa.me/50254222180"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              WhatsApp (+502 5422-2180)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
