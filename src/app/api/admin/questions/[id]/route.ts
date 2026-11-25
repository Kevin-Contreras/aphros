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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = questionSchema.parse(await request.json());

    await prisma.answerOption.deleteMany({ where: { questionId: id } });

    const question = await prisma.question.update({
      where: { id },
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
      include: { options: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(question);
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
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
