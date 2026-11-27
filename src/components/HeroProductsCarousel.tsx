import { connection } from "next/server";
import { AphrosHeroCarousel } from "@/components/AphrosHeroCarousel";
import type { LiquidGlassCarouselItem } from "@/components/ui/liquid-glass-carousel";
import { toPublicImageUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";

const MAX_ITEMS = 10;

/** Carrusel del hero alimentado con las imágenes de productos guardadas en la base de datos. */
export async function HeroProductsCarousel() {
  await connection();

  const products = await prisma.product.findMany({
    where: { active: true, imageUrl: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { name: true, imageUrl: true },
    take: MAX_ITEMS,
  });

  const items: LiquidGlassCarouselItem[] = products.flatMap((product) => {
    const src = toPublicImageUrl(product.imageUrl);
    return src ? [{ title: product.name, src }] : [];
  });

  return <AphrosHeroCarousel items={items} />;
}
