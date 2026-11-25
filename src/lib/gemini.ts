import { GoogleGenerativeAI } from "@google/generative-ai";

export type ProductForAi = {
  id: string;
  name: string;
  description: string;
  category: string;
  skinTags: string;
  price: number;
  currency: string;
  buyUrl: string;
};

export type AnswerForAi = {
  question: string;
  answer: string;
};

export type RecommendationResult = {
  skinType: string;
  summary: string;
  tips: string[];
  productIds: string[];
  reasons: Record<string, string>;
};

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

function fallbackRecommendation(
  answers: AnswerForAi[],
  products: ProductForAi[],
): RecommendationResult {
  const joined = answers.map((a) => a.answer.toLowerCase()).join(" ");
  const tags: string[] = [];
  if (joined.includes("grasa") || joined.includes("acne") || joined.includes("brillo")) {
    tags.push("grasa", "acne", "mixta");
  }
  if (joined.includes("seca") || joined.includes("hidrat")) {
    tags.push("seca", "hidratante");
  }
  if (joined.includes("sensible") || joined.includes("calmar")) {
    tags.push("sensible", "calmante");
  }
  if (joined.includes("madura") || joined.includes("antiedad")) {
    tags.push("madura", "antiedad");
  }
  if (joined.includes("manchas") || joined.includes("aclar")) {
    tags.push("aclarante");
  }
  if (joined.includes("sol") || joined.includes("proteccion")) {
    tags.push("proteccion");
  }
  if (tags.length === 0) tags.push("todos", "mixta", "hidratante");

  const scored = products
    .map((product) => {
      const productTags = product.skinTags.toLowerCase().split(",");
      const score = tags.reduce(
        (acc, tag) => acc + (productTags.some((t) => t.includes(tag)) ? 1 : 0),
        0,
      );
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const selected =
    scored.length > 0
      ? scored
      : products.slice(0, 3).map((product) => ({ product, score: 1 }));

  const reasons: Record<string, string> = {};
  for (const item of selected) {
    reasons[item.product.id] =
      "Encaja con las necesidades que compartiste en el test de piel Aphros.";
  }

  return {
    skinType: tags[0] ?? "mixta",
    summary:
      "Según tus respuestas, armamos una rutina Aphros con productos artesanales pensados para tu piel.",
    tips: [
      "Limpia suavemente mañana y noche.",
      "Usa protector solar SPF todos los días.",
      "Introduce un producto nuevo a la vez para observar cómo responde tu piel.",
    ],
    productIds: selected.map((item) => item.product.id),
    reasons,
  };
}

export async function analyzeSkinAndRecommend(
  answers: AnswerForAi[],
  products: ProductForAi[],
): Promise<RecommendationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackRecommendation(answers, products);
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.4 },
  });

  const prompt = `Eres esteticista de Aphros, marca guatemalteca de cosmética artesanal.
Analiza las respuestas del quiz de piel y recomienda SOLO productos del catálogo (usa sus id exactos).
Responde ÚNICAMENTE con JSON válido (sin markdown) con esta forma:
{
  "skinType": "grasa|seca|mixta|sensible|madura|normal",
  "summary": "2-3 frases en español amables y claras",
  "tips": ["tip1", "tip2", "tip3"],
  "productIds": ["id1", "id2", "id3"],
  "reasons": { "id1": "por qué este producto" }
}
Reglas:
- Recomienda entre 3 y 5 productos.
- Prioriza match con tags de piel y preocupación principal.
- Si hay alta exposición al sol, incluye protector SPF si está en catálogo.
- No inventes productos fuera del catálogo.

Respuestas del usuario:
${JSON.stringify(answers, null, 2)}

Catálogo Aphros:
${JSON.stringify(products, null, 2)}
`;

  try {
    const { withTimeout } = await import("@/lib/with-timeout");
    const result = await withTimeout(
      model.generateContent(prompt),
      10_000,
      "Gemini",
    );
    const text = result.response.text();
    const parsed = extractJson(text);
    const validIds = new Set(products.map((p) => p.id));
    parsed.productIds = (parsed.productIds ?? []).filter((id) => validIds.has(id));
    if (parsed.productIds.length === 0) {
      return fallbackRecommendation(answers, products);
    }
    return parsed;
  } catch {
    return fallbackRecommendation(answers, products);
  }
}
