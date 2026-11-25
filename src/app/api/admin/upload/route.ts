import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { toPublicImageUrl } from "@/lib/media-url";

const MAX_BYTES = 4.5 * 1024 * 1024; // ~4.5MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function safeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 80);
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa JPG, PNG, WEBP, GIF o SVG." },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "La imagen debe pesar menos de 4.5 MB" },
        { status: 400 },
      );
    }

    const filename = `${Date.now()}-${safeFileName(file.name || "producto.jpg")}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Store is private — upload private, expose via /api/media proxy
      const blob = await put(`products/${filename}`, file, {
        access: "private",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return NextResponse.json({
        url: blob.url,
        displayUrl: toPublicImageUrl(blob.url),
      });
    }

    // Local / non-Blob environments: save under public/uploads
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Falta BLOB_READ_WRITE_TOKEN. En Vercel → Storage crea un Blob Store y conéctalo al proyecto, luego redeploy.",
        },
        { status: 500 },
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    const url = `/uploads/${filename}`;

    return NextResponse.json({ url, displayUrl: url });
  } catch (error) {
    console.error("upload failed", error);
    const message =
      error instanceof Error ? error.message : "No se pudo subir la imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
