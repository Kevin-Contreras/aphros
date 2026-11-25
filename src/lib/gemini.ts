import { GoogleGenerativeAI } from "@google/generative-ai";
import { recordAiUsage } from "@/lib/ai-usage";
import { withTimeout } from "@/lib/with-timeout";
import {
  buildUserProfile,
  isBodyOnlyProduct,
  preciseFallbackRecommendation,
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
  const facialCatalog = products.filter((product) => !isBodyOnlyProduct(product));
  const fallback = preciseFallbackRecommendation(answers, products);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || facialCatalog.length === 0) {
    return fallback;
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  const catalogPayload = facialCatalog.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    skinTags: product.skinTags,
    price: `${product.currency}${product.price}`,
  }));

  const prompt = `Eres la esteticista principal y consultora botánica de Aphros (cosmética natural artesanal de Guatemala).
Tu tarea es analizar en profundidad CADA respuesta de la persona y diseñar una rutina facial verdaderamente personalizada, precisa y distinta según su perfil exacto.

Tono: humano, cálido, empático y experto, como una asesora en una boutique botánica. Prohibido usar frases robóticas o cliché ("según tus respuestas", "se recomienda", "como IA", "en conclusión").

PERFIL ESTRUCTURADO DETECTADO:
${JSON.stringify(
  {
    tipoDePiel: profile.skinType,
    objetivoPrincipal: profile.primaryGoal,
    nivelDeAcne: profile.acneLevel,
    nivelDeSensibilidad: profile.sensitivityLevel,
    nivelDeBrillo: profile.shineLevel,
    rutinaActual: profile.routineLevel,
    ambienteDiario: profile.environment,
    necesitaProtectorSolar: profile.needsSpf,
  },
  null,
  2,
)}

RESPUESTAS COMPLETAS DEL CUESTIONARIO:
${JSON.stringify(
  answers.map((a) => ({
    pregunta: a.question,
    respuesta: a.chosenOption || a.answer || "",
  })),
  null,
  2,
)}

CATÁLOGO FACIAL COMPLETO DE APHROS (elige SOLO IDs exactos de esta lista):
${JSON.stringify(catalogPayload, null, 2)}

REGLAS CLÍNICAS Y DE PRECISIÓN (OBLIGATORIAS):
1. Lee a fondo la "description" de CADA producto del catálogo: usa sus ingredientes activos, beneficios específicos, textura, momento de uso (día/noche/semanal) y contraindicaciones para elegir la rutina más exacta.
2. Elige entre 3 y 4 productos en ORDEN EXACTO DE APLICACIÓN: Limpieza/Jabón -> Exfoliante o Mascarilla (si aplica) -> Tónico -> Sérum/Tratamiento -> Crema facial -> Protector solar SPF (al final, solo si necesitaProtectorSolar=true).
3. Diferencia bien cada perfil, NO repitas siempre los mismos productos:
   - Si objetivoPrincipal = "manchas": prioriza Serum Facial de Vitamina C y/o Crema Facial Aclarante (o Protege y Aclara si también necesita SPF).
   - Si objetivoPrincipal = "antiedad": prioriza Crema Facial Macadamia y/o Serum Facial de Vitamina C (y Crema Exfoliante Rosa de Castilla si no tiene sensibilidad alta).
   - Si objetivoPrincipal = "hidratacion" o piel seca: prioriza Crema Facial Humectante, Jabón Facial de Miel y Avena, Kit Mascarilla de Miel o Agua Micelar Artesanal.
   - Si objetivoPrincipal = "calmar" o sensibilidad alta: prioriza Jabón Facial de Miel y Avena, Agua de Rosas Artesanal (o Combo Rosas) y Kit Mascarilla de Miel; evita exfoliantes fuertes.
   - Si objetivoPrincipal = "control_grasa" o piel grasa: prioriza Crema Facial Hamamelis; solo incluye productos "Anti Acné" si nivelDeAcne es "constante" u "ocasional".
   - Si nivelDeAcne = "ninguno": PROHIBIDO recomendar Jabón Facial Antiacné, Crema Facial Anti Acné o Combo Anti Acné.
   - Respeta estrictamente cualquier contraindicación indicada en la descripción (por ejemplo, evitar productos matificantes en piel seca o texturas ricas/antiedad en piel grasa con acné).
   - Si rutinaActual = "completa", ofrece pasos más específicos (sérum, mascarilla, exfoliante o tratamiento puntual) en lugar de solo básicos genéricos.
4. NUNCA dupliques un Combo con los productos individuales que ya incluye:
   - "Protege y Aclara" ya incluye SPF 45 + Serum Vitamina C.
   - "Combo Rosas" ya incluye Agua de Rosas.
   - "Combo Anti Acné" ya incluye productos antiacné.
5. En "reasons", cita los ingredientes botánicos concretos de la descripción de cada producto y explica cómo benefician directamente las respuestas de esta persona (incluyendo si conviene usarlo de día, noche o semanalmente).

Responde ÚNICAMENTE con JSON válido con esta estructura exacta:
{
  "skinType": "${profile.skinType}",
  "summary": "2 a 3 frases cálidas y específicas describiendo el estado de su piel y cómo esta combinación exacta atiende su objetivo principal y su entorno diario.",
  "tips": [
    "Consejo práctico de aplicación específico para esta rutina",
    "Consejo adaptado a su ambiente diario o sensibilidad",
    "Consejo de constancia o protección"
  ],
  "productIds": ["id1", "id2", "id3"],
  "reasons": {
    "id1": "Explicación concreta conectando los ingredientes botánicos del producto con su piel y objetivo."
  }
}`;

  let promptTokens = 0;
  let candidatesTokens = 0;
  let totalTokens = 0;

  try {
    const result = await withTimeout(
      model.generateContent(prompt),
      12_000,
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
  } catch (error) {
    console.error("Gemini recommendation failed, using fallback:", error);
    void recordAiUsage({
      model: modelName,
      promptTokens,
      candidatesTokens,
      totalTokens,
      success: false,
    }).catch((recordError) => {
      console.error("AiUsage record failed:", recordError);
    });
    return fallback;
  }
}
