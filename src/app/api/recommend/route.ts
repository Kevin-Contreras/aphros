import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { analyzeSkinAndRecommend } from "@/lib/gemini";
import { getBrevoConfigStatus, sendRecommendationEmail } from "@/lib/brevo";

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

    // Always persist first so the UI can navigate immediately
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
            imageUrl: product.imageUrl,
            buyUrl: product.buyUrl,
            reason: recommendation.reasons?.[product.id] ?? null,
          })),
        ),
        emailSent: false,
      },
    });

    const brevoStatus = getBrevoConfigStatus();
    let emailSent = false;
    let emailReason: string | null = null;

    // Try a quick send; if it fails/times out, queue via after() without blocking UX
    if (!brevoStatus.ready) {
      emailReason = !brevoStatus.apiKeyPresent
        ? "BREVO_API_KEY ausente en Vercel"
        : !brevoStatus.senderEmailValid
          ? "BREVO_SENDER_EMAIL inválido en Vercel (debe ser un correo verificado)"
          : "Brevo no configurado";
    } else {
      const emailPayload = {
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
          imageUrl: product.imageUrl,
          buyUrl: product.buyUrl,
          reason: recommendation.reasons?.[product.id],
        })),
      };

      const emailResult = await sendRecommendationEmail(emailPayload);
      emailSent = emailResult.sent;
      emailReason = emailResult.sent ? null : emailResult.reason;

      if (emailSent) {
        await prisma.quizSubmission.update({
          where: { id: submission.id },
          data: { emailSent: true },
        });
      } else {
        // Retry once in the background so the browser is not stuck
        after(async () => {
          try {
            const retry = await sendRecommendationEmail(emailPayload);
            if (retry.sent) {
              await prisma.quizSubmission.update({
                where: { id: submission.id },
                data: { emailSent: true },
              });
            } else {
              console.error("Brevo retry failed:", retry.reason);
            }
          } catch (error) {
            console.error("Brevo after() failed:", error);
          }
        });
      }
    }

    return NextResponse.json({
      id: submission.id,
      emailSent,
      emailReason,
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
          imageUrl: product.imageUrl,
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
