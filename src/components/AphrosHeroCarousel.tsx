"use client";

import {
  LiquidGlassCarousel,
  type LiquidGlassCarouselItem,
} from "@/components/ui/liquid-glass-carousel";

const CAROUSEL_HEIGHT =
  "h-[460px] min-h-[460px] w-full sm:h-[540px] sm:min-h-[540px] lg:h-[calc(100svh-5rem)] lg:min-h-[560px]";

const EDGE_FADE =
  "linear-gradient(to right, transparent 0%, black 10%, black 96%, transparent 100%)";

export function AphrosHeroCarousel({
  items,
}: {
  items: LiquidGlassCarouselItem[];
}) {
  if (items.length === 0) {
    return <AphrosHeroCarouselPlaceholder />;
  }

  return (
    <div
      className="relative h-full w-full"
      style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
    >
      <LiquidGlassCarousel
        items={items}
        background="transparent"
        panelHeight={340}
        gap={30}
        showLabels={false}
        className={CAROUSEL_HEIGHT}
      />
    </div>
  );
}

/** Espacio reservado mientras cargan los productos (evita saltos de layout). */
export function AphrosHeroCarouselPlaceholder() {
  return <div aria-hidden="true" className={CAROUSEL_HEIGHT} />;
}
