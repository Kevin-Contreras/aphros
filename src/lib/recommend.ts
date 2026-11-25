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
  chosenOption?: string;
  tags?: string[];
  answer?: string;
};

export type RecommendationResult = {
  skinType: string;
  summary: string;
  tips: string[];
  productIds: string[];
  reasons: Record<string, string>;
};

export type UserProfile = {
  skinType: string;
  tags: string[];
  concerns: string[];
  needsSpf: boolean;
  hasAcne: boolean;
  isSensitive: boolean;
  prefersHydration: boolean;
  prefersOilControl: boolean;
  prefersBrightening: boolean;
  prefersAntiAging: boolean;
  routineLevel: "none" | "basic" | "medium" | "full" | "unknown";
};

const TAG_ALIASES: Record<string, string[]> = {
  grasa: ["grasa", "acne", "mixta"],
  seca: ["seca", "hidratante"],
  mixta: ["mixta", "grasa", "seca"],
  sensible: ["sensible", "calmante"],
  normal: ["todos", "mixta", "hidratante"],
  mucho_brillo: ["grasa", "acne"],
  algo_brillo: ["mixta", "grasa"],
  poco_brillo: ["normal", "seca"],
  reseca: ["seca", "hidratante"],
  muy_sensible: ["sensible", "calmante"],
  algo_sensible: ["sensible"],
  no_sensible: [],
  acne_constante: ["acne", "grasa"],
  acne_ocasional: ["acne", "mixta"],
  sin_acne: [],
  control_grasa: ["grasa", "acne"],
  hidratacion: ["seca", "hidratante"],
  manchas: ["aclarante"],
  antiedad: ["madura", "antiedad"],
  calmar: ["sensible", "calmante"],
  proteccion: ["proteccion"],
  sol_alto: ["proteccion"],
  sol_medio: ["proteccion"],
  sol_bajo: [],
  usa_spf_diario: ["proteccion"],
  sin_rutina: ["todos"],
  basica: ["todos"],
  media: ["hidratante"],
  completa: [],
  ambiente_sol: ["proteccion", "grasa"],
  ambiente_ac: ["seca", "hidratante"],
  ambiente_casa: [],
  ambiente_mixto: ["mixta"],
};

const HIGH_WEIGHT = new Set([
  "grasa",
  "seca",
  "mixta",
  "sensible",
  "acne",
  "hidratante",
  "aclarante",
  "antiedad",
  "madura",
  "calmante",
  "proteccion",
]);

function splitTags(value: string) {
  return value
    .toLowerCase()
    .split(/[,\s|/]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function unique(tags: string[]) {
  return [...new Set(tags)];
}

export function buildUserProfile(answers: AnswerForAi[]): UserProfile {
  const rawTags: string[] = [];
  const textBits: string[] = [];

  for (const answer of answers) {
    if (answer.chosenOption) textBits.push(answer.chosenOption.toLowerCase());
    if (answer.answer) textBits.push(answer.answer.toLowerCase());
    for (const tag of answer.tags ?? []) {
      rawTags.push(tag.toLowerCase());
      rawTags.push(...(TAG_ALIASES[tag.toLowerCase()] ?? []));
    }
  }

  const joined = `${rawTags.join(" ")} ${textBits.join(" ")}`;

  let skinType = "mixta";
  if (/\bgrasa\b/.test(joined)) skinType = "grasa";
  else if (/\bseca\b/.test(joined) || /reseca|tirante/.test(joined)) skinType = "seca";
  else if (/\bsensible\b/.test(joined)) skinType = "sensible";
  else if (/\bmadura\b|antiedad/.test(joined)) skinType = "madura";
  else if (/\bnormal\b/.test(joined)) skinType = "normal";
  else if (/\bmixta\b/.test(joined)) skinType = "mixta";

  const hasAcne = /acne|brotes|impurezas/.test(joined);
  const isSensitive = /sensible|calmar|irrit/.test(joined);
  const prefersHydration = /seca|hidrat|reseca|tirante/.test(joined);
  const prefersOilControl = /grasa|brillo|control_grasa|acne/.test(joined);
  const prefersBrightening = /manchas|aclar|tono|vitamina c/.test(joined);
  const prefersAntiAging = /antiedad|madura|firmeza|edad/.test(joined);
  const needsSpf =
    /proteccion|sol_alto|sol_medio|usa_spf_diario|ambiente_sol|spf|solar/.test(
      joined,
    ) || prefersBrightening;

  let routineLevel: UserProfile["routineLevel"] = "unknown";
  if (/sin_rutina|solo jab[oó]n/.test(joined)) routineLevel = "none";
  else if (/\bbasica\b|limpieza b[aá]sica/.test(joined)) routineLevel = "basic";
  else if (/\bmedia\b|limpieza \+ crema/.test(joined)) routineLevel = "medium";
  else if (/completa|s[eé]rum|spf/.test(joined)) routineLevel = "full";

  const tags = unique([
    skinType,
    ...rawTags,
    ...(hasAcne ? ["acne"] : []),
    ...(isSensitive ? ["sensible", "calmante"] : []),
    ...(prefersHydration ? ["seca", "hidratante"] : []),
    ...(prefersOilControl ? ["grasa"] : []),
    ...(prefersBrightening ? ["aclarante"] : []),
    ...(prefersAntiAging ? ["madura", "antiedad"] : []),
    ...(needsSpf ? ["proteccion"] : []),
  ]).filter((tag) => tag !== "no_sensible" && tag !== "sin_acne");

  const concerns: string[] = [];
  if (hasAcne) concerns.push("acné / impurezas");
  if (prefersOilControl) concerns.push("control de grasa");
  if (prefersHydration) concerns.push("hidratación");
  if (prefersBrightening) concerns.push("manchas / luminosidad");
  if (prefersAntiAging) concerns.push("antiedad");
  if (isSensitive) concerns.push("sensibilidad");
  if (needsSpf) concerns.push("protección solar");

  return {
    skinType,
    tags,
    concerns,
    needsSpf,
    hasAcne,
    isSensitive,
    prefersHydration,
    prefersOilControl,
    prefersBrightening,
    prefersAntiAging,
    routineLevel,
  };
}

function productTagList(product: ProductForAi) {
  return splitTags(product.skinTags);
}

function isBodyOnlyProduct(product: ProductForAi) {
  const category = product.category.toLowerCase();
  const name = product.name.toLowerCase();
  return (
    category.includes("pies") ||
    category.includes("manos") ||
    category.includes("desodorante") ||
    category.includes("labios") ||
    name.includes("pies") ||
    name.includes("manos") ||
    name.includes("labial") ||
    name.includes("desodorante")
  );
}

function isFacialCore(product: ProductForAi) {
  const category = product.category.toLowerCase();
  return (
    category.includes("crema") ||
    category.includes("serum") ||
    category.includes("sérum") ||
    category.includes("jabón") ||
    category.includes("jabon") ||
    category.includes("limpieza") ||
    category.includes("tónico") ||
    category.includes("tonico") ||
    category.includes("protector") ||
    category.includes("combo") ||
    category.includes("mascarilla")
  );
}

export function scoreProduct(product: ProductForAi, profile: UserProfile) {
  const productTags = productTagList(product);
  let score = 0;
  const matched: string[] = [];

  for (const tag of profile.tags) {
    const hit = productTags.some(
      (productTag) => productTag === tag || productTag.includes(tag) || tag.includes(productTag),
    );
    if (!hit) continue;
    const weight = HIGH_WEIGHT.has(tag) ? 3 : 1;
    score += weight;
    matched.push(tag);
  }

  // Strong bonuses for exact concern fit
  if (profile.hasAcne && productTags.some((t) => t.includes("acne"))) score += 4;
  if (profile.prefersOilControl && productTags.some((t) => t.includes("grasa"))) score += 3;
  if (profile.prefersHydration && productTags.some((t) => t.includes("hidrat") || t === "seca"))
    score += 3;
  if (profile.prefersBrightening && productTags.some((t) => t.includes("aclar") || t.includes("antiedad")))
    score += 3;
  if (profile.prefersAntiAging && productTags.some((t) => t.includes("madura") || t.includes("antiedad")))
    score += 3;
  if (profile.isSensitive && productTags.some((t) => t.includes("sensible") || t.includes("calmante")))
    score += 3;
  if (profile.needsSpf && productTags.some((t) => t.includes("proteccion"))) score += 5;
  if (
    !profile.needsSpf &&
    (/spf|solar/i.test(product.name) || product.category.toLowerCase().includes("protector"))
  ) {
    score -= 5;
  }

  // Penalize irrelevant body products unless concern clearly matches
  if (isBodyOnlyProduct(product) && isFacialCore(product) === false) {
    const bodyOk =
      (product.category.toLowerCase().includes("labios") && profile.prefersHydration) ||
      (product.category.toLowerCase().includes("manos") && profile.prefersHydration) ||
      (product.category.toLowerCase().includes("pies") && false);
    if (!bodyOk) score -= 6;
  }

  // Avoid recommending "todos" catch-alls as top picks unless little else matches
  if (productTags.includes("todos") && matched.length <= 1) score -= 2;

  // Mismatch penalties
  if (profile.skinType === "grasa" && productTags.includes("seca") && !productTags.includes("mixta") && !productTags.includes("grasa")) {
    score -= 4;
  }
  if (profile.skinType === "seca" && productTags.includes("grasa") && !productTags.includes("mixta") && !productTags.includes("seca")) {
    score -= 4;
  }
  if (!profile.hasAcne && /anti\s*acn|antiacne|combo anti/i.test(product.name) && !profile.prefersOilControl) {
    score -= 3;
  }

  return { score, matched: unique(matched) };
}

export function rankProducts(products: ProductForAi[], profile: UserProfile) {
  return products
    .map((product) => {
      const { score, matched } = scoreProduct(product, profile);
      return { product, score, matched };
    })
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
}

function pickBalancedRoutine(
  ranked: ReturnType<typeof rankProducts>,
  profile: UserProfile,
  limit = 4,
) {
  const selected: typeof ranked = [];
  const usedCategories = new Set<string>();

  const take = (predicate: (item: (typeof ranked)[number]) => boolean) => {
    for (const item of ranked) {
      if (selected.some((s) => s.product.id === item.product.id)) continue;
      if (item.score <= 0) continue;
      if (!predicate(item)) continue;
      selected.push(item);
      usedCategories.add(item.product.category.toLowerCase());
      return true;
    }
    return false;
  };

  const isSpf = (item: (typeof ranked)[number]) =>
    /spf|solar|protege y aclara/i.test(item.product.name) ||
    item.product.category.toLowerCase().includes("protector");

  // 1) Core treatment for main concern (exclude SPF from this slot)
  if (profile.hasAcne || profile.prefersOilControl) {
    take(
      (item) =>
        !isSpf(item) &&
        /anti\s*acn|antiacne|hamamelis|jab[oó]n facial anti/i.test(item.product.name),
    );
    take(
      (item) =>
        !isSpf(item) &&
        /acne|grasa/i.test(item.product.skinTags) &&
        /crema|jab[oó]n|combo|serum/i.test(`${item.product.category} ${item.product.name}`),
    );
  } else if (profile.prefersBrightening) {
    take((item) => !isSpf(item) && /aclar|vitamina c|serum/i.test(`${item.product.name} ${item.product.skinTags}`));
  } else if (profile.prefersAntiAging) {
    take((item) => !isSpf(item) && /madura|antiedad|macadamia|serum/i.test(`${item.product.name} ${item.product.skinTags}`));
  } else if (profile.isSensitive) {
    take((item) => !isSpf(item) && /sensible|calmante|rosas|miel|avena|micelar/i.test(`${item.product.name} ${item.product.skinTags}`));
  } else if (profile.prefersHydration) {
    take((item) => !isSpf(item) && /hidrat|humect/i.test(`${item.product.name} ${item.product.skinTags}`));
  }

  // 2) Cleanser / toner if routine is weak
  if (profile.routineLevel === "none" || profile.routineLevel === "basic") {
    take((item) => /jab[oó]n|micelar|agua de rosas|t[oó]nico|limpieza/i.test(`${item.product.category} ${item.product.name}`));
  }

  // 3) Moisturizer / cream
  take((item) => /crema|humect|hidrat/i.test(`${item.product.category} ${item.product.name}`));

  // 4) SPF if needed
  if (profile.needsSpf) {
    take((item) => /spf|solar|proteccion|protege/i.test(`${item.product.name} ${item.product.skinTags}`));
  }

  // Fill remaining with best scores, prefer facial
  for (const item of ranked) {
    if (selected.length >= limit) break;
    if (selected.some((s) => s.product.id === item.product.id)) continue;
    if (item.score <= 0) continue;
    if (isBodyOnlyProduct(item.product) && selected.length < limit - 1) continue;
    selected.push(item);
  }

  // Absolute fallback
  if (selected.length === 0) {
    return ranked.filter((item) => item.score > 0).slice(0, limit);
  }

  return selected.slice(0, limit);
}

export function preciseFallbackRecommendation(
  answers: AnswerForAi[],
  products: ProductForAi[],
): RecommendationResult {
  const profile = buildUserProfile(answers);
  const ranked = rankProducts(products, profile);
  const selected = pickBalancedRoutine(ranked, profile, 4);

  const reasons: Record<string, string> = {};
  for (const item of selected) {
    const why =
      item.matched.length > 0
        ? `Coincide con tu perfil (${item.matched.slice(0, 3).join(", ")}).`
        : "Encaja con las necesidades detectadas en tu test Aphros.";
    reasons[item.product.id] = why;
  }

  const concernText =
    profile.concerns.length > 0
      ? `Priorizamos: ${profile.concerns.join(", ")}.`
      : "Armamos una rutina equilibrada según tus respuestas.";

  return {
    skinType: profile.skinType,
    summary: `Detectamos piel ${profile.skinType}. ${concernText}`,
    tips: [
      profile.hasAcne
        ? "Mantén limpieza suave mañana y noche; evita sobre-exfoliar."
        : "Limpia suavemente mañana y noche.",
      profile.needsSpf
        ? "Aplica protector solar SPF todos los días, incluso en interiores luminosos."
        : "Si sales al sol, suma protector SPF a tu rutina.",
      "Introduce un producto nuevo a la vez para ver cómo responde tu piel.",
    ],
    productIds: selected.map((item) => item.product.id),
    reasons,
  };
}

/** Keep only AI picks that are among the top scored candidates. */
export function refineAiPicks(
  ai: RecommendationResult,
  answers: AnswerForAi[],
  products: ProductForAi[],
): RecommendationResult {
  const profile = buildUserProfile(answers);
  const ranked = rankProducts(products, profile);
  const candidateIds = new Set(
    ranked.filter((item) => item.score > 0).slice(0, 10).map((item) => item.product.id),
  );

  const filtered = (ai.productIds ?? []).filter((id) => candidateIds.has(id));

  if (filtered.length >= 3) {
    // Ensure SPF if required
    if (profile.needsSpf) {
      const hasSpf = filtered.some((id) => {
        const product = products.find((p) => p.id === id);
        return product
          ? /spf|solar|proteccion|protege/i.test(`${product.name} ${product.skinTags}`)
          : false;
      });
      if (!hasSpf) {
        const spf = ranked.find((item) =>
          /spf|solar|proteccion|protege/i.test(`${item.product.name} ${item.product.skinTags}`),
        );
        if (spf && !filtered.includes(spf.product.id)) {
          filtered[filtered.length - 1] = spf.product.id;
        }
      }
    }

    return {
      ...ai,
      skinType: ai.skinType || profile.skinType,
      productIds: filtered.slice(0, 5),
    };
  }

  return preciseFallbackRecommendation(answers, products);
}
