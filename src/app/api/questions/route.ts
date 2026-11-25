import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();
  const questions = await prisma.question.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      options: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(questions);
}
