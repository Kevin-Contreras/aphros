"use client";

import {
  LiquidGlassCarousel,
  type LiquidGlassCarouselItem,
} from "@/components/ui/liquid-glass-carousel";

export type HeroCarouselItem = LiquidGlassCarouselItem & {
  id?: string;
  price?: number;
  currency?: string;
  category?: string;
};

const DESKTOP_CAROUSEL_HEIGHT =
  "h-[calc(100svh-5rem)] min-h-[560px] w-full";

const EDGE_FADE =
  "linear-gradient(to right, transparent 0%, black 10%, black 96%, transparent 100%)";

/**
 * Hero Carousel:
 * - Desktop (lg+): Liquid Glass WebGL 3D Carousel original intacto.
 * - Mobile / Responsive (<lg): Sin slider para una vista móvil limpia y enfocada en el contenido.
 */
export function AphrosHeroCarousel({
  items,
}: {
  items: HeroCarouselItem[];
}) {
  if (items.length === 0) {
    return <AphrosHeroCarouselPlaceholder />;
  }

  return (
    <div
      className="relative hidden h-full w-full overflow-hidden lg:block"
      style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
    >
      <LiquidGlassCarousel
        items={items}
        background="transparent"
        panelHeight={340}
        gap={30}
        showLabels={false}
        className={DESKTOP_CAROUSEL_HEIGHT}
      />
    </div>
  );
}

/** Espacio reservado mientras cargan los productos en desktop */
export function AphrosHeroCarouselPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="hidden w-full lg:block lg:h-[calc(100svh-5rem)] lg:min-h-[560px]"
    />
  );
}
