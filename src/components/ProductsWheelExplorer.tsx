"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  MessageCircleIcon,
  RotateCwIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  WheelCarousel,
  type WheelCarouselItem,
} from "@/components/ui/wheel-carousel";
import { toPublicImageUrl } from "@/lib/media-url";

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  category: string;
  skinTags: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  buyUrl: string;
}

interface ProductsWheelExplorerProps {
  products: ProductItem[];
}

export function ProductsWheelExplorer({ products }: ProductsWheelExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const wheelSectionRef = useRef<HTMLDivElement>(null);

  // Categorías únicas
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category.trim());
    }
    return ["Todos", ...Array.from(set)];
  }, [products]);

  // Productos filtrados según categoría y búsqueda
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "Todos" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.skinTags.toLowerCase().includes(q)
      );
    });
  }, [products, selectedCategory, searchQuery]);

  // Ítems formateados para WheelCarousel
  const wheelItems: WheelCarouselItem[] = useMemo(() => {
    return filteredProducts.map((p) => ({
      label: p.name,
      image: toPublicImageUrl(p.imageUrl) || "/products/serum-vitamina-c.svg",
      imageAlt: p.name,
    }));
  }, [filteredProducts]);

  // Producto activo actual
  const safeIndex =
    filteredProducts.length > 0
      ? ((activeIndex % filteredProducts.length) + filteredProducts.length) %
        filteredProducts.length
      : 0;
  const currentProduct = filteredProducts[safeIndex];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActiveIndex(0);
  };

  const handleNext = () => {
    if (filteredProducts.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % filteredProducts.length);
  };

  const handlePrev = () => {
    if (filteredProducts.length === 0) return;
    setActiveIndex(
      (prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length,
    );
  };

  const handleFocusProduct = (product: ProductItem) => {
    // Si el producto no está en la categoría actual, cambiar a "Todos"
    if (
      selectedCategory !== "Todos" &&
      product.category.toLowerCase() !== selectedCategory.toLowerCase()
    ) {
      setSelectedCategory("Todos");
    }

    // Buscar el índice del producto
    const listToSearch =
      selectedCategory === "Todos" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase()
        ? filteredProducts
        : products;
    const targetIdx = listToSearch.findIndex((p) => p.id === product.id);
    if (targetIdx !== -1) {
      setActiveIndex(targetIdx);
    }

    // Desplazar suavemente hacia la rueda interactiva
    wheelSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const getWhatsAppUrl = (product: ProductItem) => {
    const text = `¡Hola Aphros! Me interesa adquirir el producto "${product.name}" (${product.currency || "Q"}${product.price.toFixed(2)}). ¿Tienen disponibilidad y asesoría?`;
    return `https://wa.me/50254222180?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="w-full">
      {/* BUSCADOR SUPERIOR (Posicionado arriba en desktop y móvil) */}
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-2 sm:px-6 lg:px-8">
        <div className="flex w-full justify-center">
          <div className="relative w-full max-w-md">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-aphros-espresso/45" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Buscar producto o ingrediente..."
              className="h-11 w-full rounded-full border border-aphros-espresso/15 bg-white/80 pr-10 pl-11 text-xs text-aphros-espresso placeholder:text-aphros-espresso/45 shadow-2xs focus:border-aphros-wine/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aphros-wine/20 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full text-aphros-espresso/50 hover:bg-aphros-wine/10 hover:text-aphros-wine transition-colors"
              >
                <XIcon className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: SOLO LA RULETA AL INICIO (A PANTALLA COMPLETA EN DESKTOP, OCULTA EN RESPONSIVE) */}
      <section
        ref={wheelSectionRef}
        className="relative hidden lg:flex min-h-[calc(100svh-9rem)] w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div className="relative flex h-[70svh] min-h-[460px] max-h-[640px] w-full max-w-7xl items-center justify-center bg-transparent">
          {wheelItems.length > 0 ? (
            <WheelCarousel
              items={wheelItems}
              activeIndex={safeIndex}
              onActiveChange={(_, index) => setActiveIndex(index)}
              mode="custom"
              background="transparent"
              panelColor="transparent"
              photoSide="left"
              photoWidth={35}
              photoAspect="1/1"
              photoRadius={0}
              contentWidth={1300}
              radius={320}
              spacing={14}
              visibleItems={7}
              apexInset={8}
              textColor="rgba(82, 35, 45, 0.42)"
              selectedColor="#52232d"
              markerColor="#52232d"
              markerSize={10}
              markerGap={14}
              className="h-full w-full bg-transparent border-0 shadow-none"
              photoClassName="bg-transparent border-0 shadow-none p-0"
              imageClassName="object-contain p-2 drop-shadow-md"
              itemClassName="text-[clamp(0.95rem,1.5vw,1.3rem)] font-medium tracking-[-0.01em]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-aphros-espresso/60">
              No hay productos que coincidan con la búsqueda
            </div>
          )}
        </div>

        {/* Indicador inferior sutil para bajar a la descripción */}
        <div className="mt-2 flex flex-col items-center gap-2 text-center pb-6">
          <span className="text-[11px] font-light tracking-[0.16em] text-aphros-cocoa/60 uppercase">
            Gira con el mouse o desliza para navegar
          </span>
          <a
            href="#detalles-producto"
            className="group flex flex-col items-center gap-1 text-[11px] font-medium tracking-[0.2em] text-aphros-wine/75 uppercase transition-colors hover:text-aphros-wine"
          >
            <span>Ver descripción y precio</span>
            <ChevronDownIcon className="size-4 animate-bounce text-aphros-wine" />
          </a>
        </div>
      </section>

      {/* SECCIÓN 2: FILTROS Y DETALLES */}
      <section
        id="detalles-producto"
        className="mx-auto w-full max-w-5xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10"
      >

        {/* Controles de categoría y flechas */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-aphros-espresso/10 pb-5">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
            {categories.map((cat) => {
              const active = cat === selectedCategory;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium tracking-[0.12em] uppercase transition-all duration-300 ${
                    active
                      ? "bg-aphros-wine text-aphros-blush-50 shadow-xs"
                      : "border border-aphros-espresso/15 bg-transparent text-aphros-espresso/70 hover:border-aphros-wine/40 hover:text-aphros-wine"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-xs font-mono text-aphros-espresso/60">
              {filteredProducts.length > 0 ? safeIndex + 1 : 0} /{" "}
              {filteredProducts.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                aria-label="Producto anterior"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-aphros-espresso/20 bg-transparent text-aphros-wine transition-all hover:bg-aphros-wine hover:text-aphros-blush-50 active:scale-95"
              >
                <ArrowLeftIcon className="size-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Producto siguiente"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-aphros-espresso/20 bg-transparent text-aphros-wine transition-all hover:bg-aphros-wine hover:text-aphros-blush-50 active:scale-95"
              >
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Ficha con la descripción y precio (solo en desktop para acompañar a la ruleta) */}
        <div className="hidden lg:block mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            {currentProduct ? (
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="flex flex-col items-center text-center space-y-6"
              >
                {/* Categoría y Precio Protagonista */}
                <div className="flex items-center justify-center gap-3">
                  <span className="rounded-full bg-aphros-wine/10 px-4 py-1 text-[11px] font-semibold tracking-[0.18em] text-aphros-wine uppercase">
                    {currentProduct.category}
                  </span>
                  <span className="text-aphros-espresso/30">·</span>
                  <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-aphros-wine sm:text-4xl">
                    {currentProduct.currency || "Q"}
                    {currentProduct.price.toFixed(2)}
                  </span>
                </div>

                {/* Nombre del Producto */}
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal leading-tight text-aphros-espresso sm:text-4xl lg:text-5xl">
                  {currentProduct.name}
                </h2>

                {/* Línea divisoria sutil */}
                <div className="h-px w-16 bg-aphros-wine/20" />

                {/* Descripción completa */}
                <p className="max-w-2xl text-sm font-light leading-relaxed text-aphros-cocoa/90 sm:text-base">
                  {currentProduct.description}
                </p>

                {/* Tags recomendados / Ideal para */}
                {currentProduct.skinTags && (
                  <div className="flex flex-col items-center space-y-2 pt-1">
                    <p className="text-[11px] font-medium tracking-[0.18em] text-aphros-cocoa/70 uppercase">
                      Ideal para
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentProduct.skinTags.split(",").map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-full bg-aphros-blush-200/40 px-3.5 py-1 text-xs font-medium text-aphros-wine"
                        >
                          <CheckIcon className="size-3 text-aphros-rose-deep" />
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botones de acción centrados */}
                <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-center w-full max-w-md">
                  <a
                    href={getWhatsAppUrl(currentProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aphros-btn-luxury inline-flex h-12 flex-1 items-center justify-center gap-2.5 rounded-full bg-aphros-wine px-7 text-xs font-medium tracking-[0.14em] text-aphros-blush-50 uppercase shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <MessageCircleIcon className="size-4" />
                    <span>Pedir por WhatsApp</span>
                  </a>

                  <Link
                    href="/quiz"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-aphros-wine/30 bg-transparent px-6 text-xs font-medium tracking-[0.12em] text-aphros-wine uppercase transition-colors hover:bg-aphros-wine/5"
                  >
                    <SparklesIcon className="size-3.5 text-aphros-rose-deep" />
                    <span>Hacer test</span>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-aphros-espresso/60">
                Selecciona un producto
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* SECCIÓN 2: CATÁLOGO EN CUADRÍCULA COMPLETA */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-medium tracking-[0.24em] text-aphros-rose-deep uppercase">
              Catálogo completo
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-normal text-aphros-wine sm:text-3xl">
              Colección Artesanal Aphros
            </h3>
          </div>
          <p className="max-w-md text-xs font-light text-aphros-espresso/70 sm:text-sm">
            <span className="hidden lg:inline">
              Haz clic en cualquier producto para enfocarlo en la rueda giratoria
              o{" "}
            </span>
            Solicita cualquier producto directamente por WhatsApp con asesoría
            personalizada.
          </p>
        </div>

        {/* Rejilla de productos filtrados */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-aphros-espresso/20 bg-white/40 py-16 px-4 text-center">
            <p className="font-[family-name:var(--font-display)] text-xl text-aphros-wine">
              No se encontraron productos
            </p>
            <p className="mt-1 text-xs text-aphros-espresso/70">
              No encontramos coincidencias para &ldquo;{searchQuery}&rdquo;{" "}
              {selectedCategory !== "Todos" && `en la categoría ${selectedCategory}`}.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Todos");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-aphros-wine px-5 py-2 text-xs font-medium text-aphros-blush-50 uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const isCurrent = currentProduct?.id === product.id;
              const imgSrc =
                toPublicImageUrl(product.imageUrl) ||
                "/products/serum-vitamina-c.svg";

              return (
                <div
                  key={product.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border bg-white/80 p-5 transition-all duration-300 hover:shadow-lg ${
                    isCurrent
                      ? "border-aphros-wine ring-2 ring-aphros-wine/30"
                      : "border-aphros-espresso/10 hover:border-aphros-wine/30"
                  }`}
                >
                  {/* Imagen del producto */}
                  <div className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-aphros-blush-100/60 p-4">
                    <Image
                      src={imgSrc}
                      alt={product.name}
                      width={200}
                      height={200}
                      unoptimized
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-aphros-blush-50/90 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.1em] text-aphros-wine uppercase backdrop-blur-xs">
                      {product.category}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="font-[family-name:var(--font-display)] text-lg font-normal leading-snug text-aphros-wine">
                        {product.name}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs font-light text-aphros-espresso/70">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-aphros-espresso/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-aphros-wine">
                          {product.currency || "Q"}
                          {product.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botón ruleta: SOLO visible en desktop (oculto en responsive) */}
                        <button
                          onClick={() => handleFocusProduct(product)}
                          className="hidden lg:inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-aphros-wine/30 bg-aphros-blush-50 px-3 text-[11px] font-medium tracking-[0.1em] text-aphros-wine uppercase transition-colors hover:bg-aphros-wine hover:text-aphros-blush-50"
                        >
                          <RotateCwIcon className="size-3" />
                          <span>Ver en rueda</span>
                        </button>

                        {/* Botón WhatsApp: ancho completo con texto en responsive, circular en desktop */}
                        <a
                          href={getWhatsAppUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Comprar ${product.name} por WhatsApp`}
                          className="inline-flex h-9 flex-1 lg:flex-none lg:size-9 items-center justify-center gap-1.5 rounded-full bg-aphros-wine px-3 text-[11px] font-medium text-aphros-blush-50 uppercase shadow-xs transition-transform hover:scale-105 active:scale-95"
                        >
                          <MessageCircleIcon className="size-3.5" />
                          <span className="lg:hidden">Pedir por WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
