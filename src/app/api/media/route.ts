import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { isVercelBlobUrl } from "@/lib/media-url";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("u");

  if (!url || !isVercelBlobUrl(url)) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN no configurado" },
      { status: 500 },
    );
  }

  try {
    const result = await get(url, {
      access: "private",
      token,
    });

    if (!result?.stream) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      result.blob.contentType || "application/octet-stream",
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(result.stream, { status: 200, headers });
  } catch (error) {
    console.error("media proxy failed", error);
    return NextResponse.json({ error: "No se pudo cargar la imagen" }, { status: 500 });
  }
}
