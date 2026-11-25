import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { analyzeSkinAndRecommend } from "@/lib/gemini";
import { sendRecommendationEmail } from "@/lib/brevo";

const bodySchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        questionText: z.string(),
        optionId: z.string(),
        optionLabel: z.string(),
        optionValue: z.string(),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = bodySchema.parse(json);

    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No hay productos activos para recomendar" },
        { status: 400 },
      );
    }

    const aiAnswers = data.answers.map((answer) => ({
      question: answer.questionText,
      answer: `${answer.optionLabel} (${answer.optionValue})`,
    }));

    const recommendation = await analyzeSkinAndRecommend(
      aiAnswers,
      products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        skinTags: product.skinTags,
        price: product.price,
        currency: product.currency,
        buyUrl: product.buyUrl,
      })),
    );

    const recommended = products.filter((product) =>
      recommendation.productIds.includes(product.id),
    );

    let emailSent = false;
    try {
      const emailResult = await sendRecommendationEmail({
        toEmail: data.email,
        toName: data.name,
        skinType: recommendation.skinType,
        summary: recommendation.summary,
        tips: recommendation.tips,
        products: recommended.map((product) => ({
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          buyUrl: product.buyUrl,
          reason: recommendation.reasons?.[product.id],
        })),
      });
      emailSent = emailResult.sent;
    } catch {
      emailSent = false;
    }

    const submission = await prisma.quizSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        answers: JSON.stringify(data.answers),
        skinAnalysis: JSON.stringify({
          skinType: recommendation.skinType,
          summary: recommendation.summary,
          tips: recommendation.tips,
          reasons: recommendation.reasons,
        }),
        recommendedProducts: JSON.stringify(
          recommended.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            currency: product.currency,
            buyUrl: product.buyUrl,
            reason: recommendation.reasons?.[product.id] ?? null,
          })),
        ),
        emailSent,
      },
    });

    return NextResponse.json({
      id: submission.id,
      emailSent,
      result: {
        skinType: recommendation.skinType,
        summary: recommendation.summary,
        tips: recommendation.tips,
        products: recommended.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          currency: product.currency,
          buyUrl: product.buyUrl,
          reason: recommendation.reasons?.[product.id] ?? null,
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo generar la recomendación" },
      { status: 500 },
    );
  }
}
