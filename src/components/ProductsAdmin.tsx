"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { toPublicImageUrl } from "@/lib/media-url";

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  skinTags: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  buyUrl: string;
  active: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  category: "",
  skinTags: "",
  price: "",
  currency: "Q",
  imageUrl: "",
  buyUrl: "",
  active: true,
};

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const response = await fetch("/api/admin/products");
    if (!response.ok) throw new Error("No se pudieron cargar productos");
    setProducts(await response.json());
  }

  useEffect(() => {
    startTransition(async () => {
      try {
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar");
      }
    });
  }, []);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      skinTags: product.skinTags,
      price: String(product.price),
      currency: product.currency,
      imageUrl: product.imageUrl || "",
      buyUrl: product.buyUrl,
      active: product.active,
    });
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo subir la imagen");
      }
      setForm((prev) => ({
        ...prev,
        // Persist the private blob URL (or local path); preview uses display helper
        imageUrl: data.url,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError("El precio debe ser un número positivo.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      skinTags: form.skinTags.trim(),
      price,
      currency: form.currency.trim() || "Q",
      imageUrl: form.imageUrl.trim() || null,
      buyUrl: form.buyUrl.trim(),
      active: form.active,
    };

    startTransition(async () => {
      try {
        const response = await fetch(
          editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
          {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.error?.formErrors?.[0] || data.error || "No se pudo guardar",
          );
        }
        resetForm();
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("No se pudo eliminar");
        if (editingId === id) resetForm();
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-forest">
          Productos
        </h1>
        <p className="mt-2 text-sm text-mist">
          Catálogo Aphros usado por la IA para recomendar.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-2xl border border-sand bg-cream p-5 md:grid-cols-2"
      >
        <h2 className="md:col-span-2 font-[family-name:var(--font-display)] text-2xl text-forest">
          {editingId ? "Editar producto" : "Nuevo producto"}
        </h2>

        {(
          [
            ["name", "Nombre", "text"],
            ["category", "Categoría", "text"],
            ["skinTags", "Tags de piel (coma)", "text"],
            ["price", "Precio", "number"],
            ["currency", "Moneda", "text"],
            ["buyUrl", "Link Pacifiko", "url"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="block text-sm">
            <span className="mb-1.5 block text-forest">{label}</span>
            <input
              type={type}
              value={form[key]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="w-full rounded-xl border border-sand bg-ivory/70 px-3 py-2 outline-none focus:border-sage"
              required
            />
          </label>
        ))}

        <div className="md:col-span-2 grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="h-40 overflow-hidden rounded-2xl border border-sand bg-ivory">
            {form.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toPublicImageUrl(form.imageUrl) || form.imageUrl}
                alt="Vista previa"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-3 text-center text-xs text-mist">
                Sin imagen
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1.5 block text-forest">Subir imagen</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                disabled={uploading || isPending}
                onChange={(e) => onUpload(e.target.files?.[0] || null)}
                className="block w-full text-sm text-mist file:mr-3 file:rounded-full file:border-0 file:bg-sage file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream hover:file:bg-sage-dark"
              />
              <span className="mt-1.5 block text-xs text-mist">
                JPG, PNG, WEBP o SVG · máx. 4.5 MB
                {uploading ? " · Subiendo…" : ""}
              </span>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-forest">
                O URL / ruta de imagen
              </span>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                className="w-full rounded-xl border border-sand bg-ivory/70 px-3 py-2 outline-none focus:border-sage"
                placeholder="/products/serum.svg o https://..."
              />
            </label>
          </div>
        </div>

        <label className="md:col-span-2 block text-sm">
          <span className="mb-1.5 block text-forest">Descripción</span>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full rounded-xl border border-sand bg-ivory/70 px-3 py-2 outline-none focus:border-sage"
            required
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-forest">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, active: e.target.checked }))
            }
          />
          Activo para recomendaciones
        </label>

        {error ? <p className="md:col-span-2 text-sm text-red-700">{error}</p> : null}

        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending || uploading}
            className="rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-cream hover:bg-sage-dark disabled:opacity-60"
          >
            {isPending ? "Guardando…" : editingId ? "Actualizar" : "Crear"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-sand px-5 py-2.5 text-sm text-mist hover:border-sage"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-sand bg-cream">
        {products.length === 0 ? (
          <p className="p-5 text-sm text-mist">No hay productos todavía.</p>
        ) : (
          <ul className="divide-y divide-sand">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-sand bg-ivory">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          toPublicImageUrl(product.imageUrl) || product.imageUrl
                        }
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium text-forest">
                      {product.name}{" "}
                      <span className="text-xs font-normal text-mist">
                        {product.active ? "activo" : "inactivo"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-mist">
                      {product.category} · {product.currency}
                      {product.price} · {product.skinTags}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(product)}
                    className="rounded-full border border-sand px-3 py-1.5 text-xs text-forest hover:border-sage"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="rounded-full border border-sand px-3 py-1.5 text-xs text-red-700 hover:border-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
