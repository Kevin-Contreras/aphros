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
  imageUrl: z.string().url().optional().nullable(),
  buyUrl: z.string().url(),
  active: z.boolean().default(true),
});

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const data = productSchema.parse(await request.json());
    const product = await prisma.product.create({
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo crear" }, { status: 500 });
  }
}
