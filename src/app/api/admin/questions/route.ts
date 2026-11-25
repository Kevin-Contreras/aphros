import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const questionSchema = z.object({
  text: z.string().min(4),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        order: z.number().int().default(0),
      }),
    )
    .min(2),
});

export async function GET() {
  const questions = await prisma.question.findMany({
    orderBy: { order: "asc" },
    include: { options: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  try {
    const data = questionSchema.parse(await request.json());
    const question = await prisma.question.create({
      data: {
        text: data.text,
        order: data.order,
        active: data.active,
        options: {
          create: data.options.map((option, index) => ({
            label: option.label,
            value: option.value,
            order: option.order || index + 1,
          })),
        },
      },
      include: { options: true },
    });
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo crear" }, { status: 500 });
  }
}
