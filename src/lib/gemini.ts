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

  const prompt = `Eres una esteticista y consultora botánica de Aphros (Guatemala).
Tu misión es recomendar una rutina personalizada con tono humano, cálido, empático y experto, como una asesora de cabecera en una boutique natural.
Evita a toda costa sonar como un bot o inteligencia artificial (prohibido usar frases cliché como "se recomienda", "según las respuestas", "en conclusión", "como IA").

Solo puedes elegir productos de la lista CANDIDATOS (ya filtrados por score). No inventes ids.

Perfil detectado:
${JSON.stringify(profile, null, 2)}

Respuestas del quiz:
${JSON.stringify(answers, null, 2)}

CANDIDATOS (ordenados por relevancia, matchScore más alto = mejor):
${JSON.stringify(candidatePayload, null, 2)}

Elige 3 a 4 productos que formen una rutina diaria coherente y minimalista:
- 1 limpieza o tónico si hace falta
- 1 tratamiento o sérum según la preocupación principal
- 1 hidratante / crema adecuada al tipo de piel
- incluye SPF si needsSpf=true y hay candidato con proteccion/SPF

Evita productos de pies/manos/desodorante salvo que encajen claramente con el rostro.
Prefiere candidatos con matchScore alto.

Responde ÚNICAMENTE JSON válido (sin formato markdown):
{
  "skinType": "${profile.skinType}",
  "summary": "2 a 3 frases cálidas, personales y profesionales explicando cómo se encuentra la piel y cómo estos productos botánicos le devolverán su equilibrio natural.",
  "tips": [
    "Consejo práctico y amoroso de aplicación (ej. cómo masajear o momento del día)",
    "Consejo de cuidado o hábito complementario",
    "Consejo de constancia o protección solar"
  ],
  "productIds": ["id1", "id2", "id3"],
  "reasons": {
    "id1": "Explicación natural de cómo sus ingredientes botánicos específicos benefician a su piel (ej. 'La caléndula calma el enrojecimiento y repara la barrera cutánea suavemente')"
  }
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
