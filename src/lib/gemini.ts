import { GoogleGenerativeAI } from "@google/generative-ai";
import { recordAiUsage } from "@/lib/ai-usage";
import { withTimeout } from "@/lib/with-timeout";
import {
  buildUserProfile,
  preciseFallbackRecommendation,
  rankProducts,
  refineAiPicks,
  type AnswerForAi,
  type ProductForAi,
  type RecommendationResult,
} from "@/lib/recommend";

export type { AnswerForAi, ProductForAi, RecommendationResult };

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("La IA no devolvió JSON válido");
  }
  return JSON.parse(raw.slice(start, end + 1)) as RecommendationResult;
}

export async function analyzeSkinAndRecommend(
  answers: AnswerForAi[],
  products: ProductForAi[],
): Promise<RecommendationResult> {
  const profile = buildUserProfile(answers);
  const ranked = rankProducts(products, profile);
  const candidates = ranked.filter((item) => item.score > 0).slice(0, 10);
  const fallback = preciseFallbackRecommendation(answers, products);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || candidates.length === 0) {
    return fallback;
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.2 },
  });

  const candidatePayload = candidates.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    category: item.product.category,
    description: item.product.description,
    skinTags: item.product.skinTags,
    matchScore: item.score,
    matchedTags: item.matched,
  }));

  const prompt = `Eres esteticista de Aphros (Guatemala). Debes recomendar con PRECISIÓN.
Solo puedes elegir productos de la lista CANDIDATOS (ya filtrados por score). No inventes ids.

Perfil detectado:
${JSON.stringify(profile, null, 2)}

Respuestas del quiz:
${JSON.stringify(answers, null, 2)}

CANDIDATOS (ordenados por relevancia, matchScore más alto = mejor):
${JSON.stringify(candidatePayload, null, 2)}

Elige 3 a 5 productos que formen una rutina coherente:
- 1 limpieza o tónico si hace falta
- 1 tratamiento según la preocupación principal
- 1 crema / hidratación adecuada al tipo de piel
- incluye SPF si needsSpf=true y hay candidato con proteccion/SPF

Evita productos de pies/manos/desodorante salvo que encajen claramente.
Prefiere candidatos con matchScore alto.

Responde ÚNICAMENTE JSON válido (sin markdown):
{
  "skinType": "${profile.skinType}",
  "summary": "2-3 frases en español, específicas al perfil",
  "tips": ["tip1", "tip2", "tip3"],
  "productIds": ["id1", "id2", "id3"],
  "reasons": { "id1": "motivo concreto ligado a las respuestas" }
}`;

  let promptTokens = 0;
  let candidatesTokens = 0;
  let totalTokens = 0;

  try {
    const result = await withTimeout(
      model.generateContent(prompt),
      10_000,
      "Gemini",
    );
    const usage = result.response.usageMetadata;
    promptTokens = usage?.promptTokenCount ?? 0;
    candidatesTokens = usage?.candidatesTokenCount ?? 0;
    totalTokens = usage?.totalTokenCount ?? 0;

    const text = result.response.text();
    const parsed = extractJson(text);
    const refined = refineAiPicks(parsed, answers, products);
    void recordAiUsage({
      model: modelName,
      promptTokens,
      candidatesTokens,
      totalTokens,
      success: true,
    }).catch((error) => {
      console.error("AiUsage record failed:", error);
    });
    return refined;
  } catch {
    void recordAiUsage({
      model: modelName,
      promptTokens,
      candidatesTokens,
      totalTokens,
      success: false,
    }).catch((error) => {
      console.error("AiUsage record failed:", error);
    });
    return fallback;
  }
}
