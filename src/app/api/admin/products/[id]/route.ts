import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  category: z.string().min(2),
  skinTags: z.string().min(2),
  price: z.number().positive(),
  currency: z.string().default("Q"),
  imageUrl: z
    .string()
    .refine(
      (value) =>
        !value ||
        value.startsWith("/") ||
        /^https?:\/\//i.test(value),
      "URL de imagen inválida",
    )
    .optional()
    .nullable(),
  buyUrl: z.string().url(),
  active: z.boolean().default(true),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = productSchema.parse(await request.json());
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
