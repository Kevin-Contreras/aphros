import { connection } from "next/server";
import { AphrosHeroCarousel, type HeroCarouselItem } from "@/components/AphrosHeroCarousel";
import { toPublicImageUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";

const MAX_ITEMS = 10;

/** Carrusel del hero alimentado con las imágenes de productos guardadas en la base de datos. */
export async function HeroProductsCarousel() {
  await connection();

  const products = await prisma.product.findMany({
    where: { active: true, imageUrl: { not: null } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      price: true,
      currency: true,
      category: true,
    },
    take: MAX_ITEMS,
  });

  const items: HeroCarouselItem[] = products.flatMap((product) => {
    const src = toPublicImageUrl(product.imageUrl);
    return src
      ? [
          {
            id: product.id,
            title: product.name,
            src,
            price: product.price,
            currency: product.currency,
            category: product.category,
          },
        ]
      : [];
  });

  return <AphrosHeroCarousel items={items} />;
}
