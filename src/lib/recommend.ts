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

export type PrimaryGoal =
  | "control_grasa"
  | "hidratacion"
  | "manchas"
  | "antiedad"
  | "calmar"
  | "proteccion"
  | null;

export type UserProfile = {
  skinType: string;
  primaryGoal: PrimaryGoal;
  acneLevel: "constante" | "ocasional" | "ninguno";
  sensitivityLevel: "alta" | "media" | "baja";
  shineLevel: "alto" | "zona_t" | "mate" | "reseca" | "unknown";
  environment: "sol" | "ac" | "casa" | "mixto" | "unknown";
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

export function isBodyOnlyProduct(product: ProductForAi) {
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

function getRoutineStepOrder(product: ProductForAi): number {
  const cat = product.category.toLowerCase();
  const name = product.name.toLowerCase();
  if (
    cat.includes("limpieza") ||
    cat.includes("jabón") ||
    cat.includes("jabon") ||
    name.includes("micelar") ||
    name.includes("jabón") ||
    name.includes("jabon")
  ) {
    return 1;
  }
  if (cat.includes("exfoliante") || name.includes("exfoliante") || cat.includes("mascarilla")) {
    return 2;
  }
  if (cat.includes("tónico") || cat.includes("tonico") || name.includes("agua de rosas")) {
    return 3;
  }
  if (cat.includes("serum") || cat.includes("sérum") || name.includes("serum")) {
    return 4;
  }
  if (cat.includes("protector") || name.includes("spf") || name.includes("filtro solar")) {
    return 6;
  }
  if (cat.includes("combo")) {
    return 5;
  }
  return 5; // Cremas hidratantes / tratamientos
}

/** Avoid pairing a combo with the individual items already inside it. */
export function conflictsWithSelected(
  candidate: ProductForAi,
  selected: ProductForAi[],
): boolean {
  const candName = candidate.name.toLowerCase();

  for (const existing of selected) {
    const existName = existing.name.toLowerCase();

    // Protege y Aclara = Crema SPF 45 + Serum Vitamina C
    const isProtegeCombo = (n: string) => n.includes("protege y aclara");
    const isProtegePart = (n: string) =>
      n.includes("spf") || n.includes("filtro solar") || n.includes("vitamina c");
    if (
      (isProtegeCombo(candName) && isProtegePart(existName)) ||
      (isProtegePart(candName) && isProtegeCombo(existName))
    ) {
      return true;
    }

    // Combo Rosas = Agua de Rosas + complementos
    const isRosasCombo = (n: string) => n.includes("combo rosas");
    const isRosasPart = (n: string) => n.includes("agua de rosas");
    if (
      (isRosasCombo(candName) && isRosasPart(existName)) ||
      (isRosasPart(candName) && isRosasCombo(existName))
    ) {
      return true;
    }

    // Combo Anti Acné = Jabón Antiacné / Crema Anti Acné
    const isAcneCombo = (n: string) => n.includes("combo anti acn") || n.includes("combo antiacn");
    const isAcnePart = (n: string) =>
      n.includes("antiacn") || n.includes("anti acn");
    if (
      (isAcneCombo(candName) && isAcnePart(existName)) ||
      (isAcnePart(candName) && isAcneCombo(existName))
    ) {
      return true;
    }
  }

  return false;
}

export function buildUserProfile(answers: AnswerForAi[]): UserProfile {
  const exactTags = new Set<string>();
  const textBits: string[] = [];

  for (const answer of answers) {
    if (answer.chosenOption) textBits.push(answer.chosenOption.toLowerCase());
    if (answer.answer) textBits.push(answer.answer.toLowerCase());
    for (const tag of answer.tags ?? []) {
      exactTags.add(tag.toLowerCase());
    }
  }

  const text = textBits.join(" | ");

  // 1. Skin type — strictly respect explicit skin-type tags without alias pollution
  let skinType = "mixta";
  if (exactTags.has("grasa")) skinType = "grasa";
  else if (exactTags.has("seca")) skinType = "seca";
  else if (exactTags.has("mixta")) skinType = "mixta";
  else if (exactTags.has("sensible")) skinType = "sensible";
  else if (exactTags.has("normal")) skinType = "normal";
  else if (exactTags.has("madura")) skinType = "madura";
  else if (/tirante|áspero|deshidrat/.test(text)) skinType = "seca";
  else if (/enrojecer|irritar/.test(text)) skinType = "sensible";
  else if (/frente\/nariz|zona t/.test(text)) skinType = "mixta";
  else if (/exceso de grasa|brilloso/.test(text)) skinType = "grasa";
  else if (/cómodo y equilibrado/.test(text)) skinType = "normal";

  // 2. Shine level
  let shineLevel: UserProfile["shineLevel"] = "unknown";
  if (exactTags.has("mucho_brillo")) shineLevel = "alto";
  else if (exactTags.has("algo_brillo")) shineLevel = "zona_t";
  else if (exactTags.has("poco_brillo")) shineLevel = "mate";
  else if (exactTags.has("reseca")) shineLevel = "reseca";

  // 3. Acne level — NEVER trigger on sin_acne or "casi no tengo acné"
  let acneLevel: UserProfile["acneLevel"] = "ninguno";
  if (exactTags.has("acne_constante") || exactTags.has("acne")) {
    acneLevel = "constante";
  } else if (exactTags.has("acne_ocasional")) {
    acneLevel = "ocasional";
  } else if (exactTags.has("sin_acne")) {
    acneLevel = "ninguno";
  } else if (/casi siempre tengo brotes/.test(text)) {
    acneLevel = "constante";
  } else if (/estrés o ciclo/.test(text)) {
    acneLevel = "ocasional";
  }

  // 4. Sensitivity level — NEVER trigger on no_sensible
  let sensitivityLevel: UserProfile["sensitivityLevel"] = "baja";
  if (
    exactTags.has("muy_sensible") ||
    exactTags.has("calmar") ||
    skinType === "sensible"
  ) {
    sensitivityLevel = "alta";
  } else if (exactTags.has("algo_sensible")) {
    sensitivityLevel = "media";
  } else if (exactTags.has("no_sensible")) {
    sensitivityLevel = "baja";
  }

  // 5. Primary goal (Question 5)
  let primaryGoal: PrimaryGoal = null;
  if (exactTags.has("control_grasa")) primaryGoal = "control_grasa";
  else if (exactTags.has("hidratacion")) primaryGoal = "hidratacion";
  else if (exactTags.has("manchas")) primaryGoal = "manchas";
  else if (exactTags.has("antiedad")) primaryGoal = "antiedad";
  else if (exactTags.has("calmar")) primaryGoal = "calmar";
  else if (exactTags.has("proteccion")) primaryGoal = "proteccion";

  // 6. Routine level
  let routineLevel: UserProfile["routineLevel"] = "unknown";
  if (exactTags.has("sin_rutina")) routineLevel = "none";
  else if (exactTags.has("basica")) routineLevel = "basic";
  else if (exactTags.has("media")) routineLevel = "medium";
  else if (exactTags.has("completa")) routineLevel = "full";

  // 7. Environment
  let environment: UserProfile["environment"] = "unknown";
  if (exactTags.has("ambiente_sol")) environment = "sol";
  else if (exactTags.has("ambiente_ac")) environment = "ac";
  else if (exactTags.has("ambiente_casa")) environment = "casa";
  else if (exactTags.has("ambiente_mixto")) environment = "mixto";

  // 8. Derived boolean flags (accurate, no false positives)
  const hasAcne = acneLevel === "constante" || acneLevel === "ocasional";
  const isSensitive = sensitivityLevel === "alta" || sensitivityLevel === "media";
  const prefersHydration =
    primaryGoal === "hidratacion" ||
    skinType === "seca" ||
    shineLevel === "reseca" ||
    environment === "ac";
  const prefersOilControl =
    primaryGoal === "control_grasa" ||
    skinType === "grasa" ||
    shineLevel === "alto" ||
    acneLevel === "constante";
  const prefersBrightening =
    primaryGoal === "manchas" || exactTags.has("aclarante");
  const prefersAntiAging =
    primaryGoal === "antiedad" || exactTags.has("madura") || skinType === "madura";
  const needsSpf =
    primaryGoal === "proteccion" ||
    exactTags.has("sol_alto") ||
    exactTags.has("sol_medio") ||
    environment === "sol" ||
    prefersBrightening;

  const tags = unique([
    skinType,
    ...(hasAcne ? ["acne"] : []),
    ...(isSensitive ? ["sensible", "calmante"] : []),
    ...(prefersHydration ? ["hidratante", ...(skinType === "seca" ? ["seca"] : [])] : []),
    ...(prefersOilControl ? ["grasa"] : []),
    ...(prefersBrightening ? ["aclarante"] : []),
    ...(prefersAntiAging ? ["madura", "antiedad"] : []),
    ...(needsSpf ? ["proteccion"] : []),
  ]);

  const concerns: string[] = [];
  if (primaryGoal === "control_grasa") concerns.push("control de grasa e impurezas");
  if (primaryGoal === "hidratacion") concerns.push("hidratación profunda");
  if (primaryGoal === "manchas") concerns.push("aclarar manchas y luminosidad");
  if (primaryGoal === "antiedad") concerns.push("firmeza y cuidado antiedad");
  if (primaryGoal === "calmar") concerns.push("calmar enrojecimiento y sensibilidad");
  if (primaryGoal === "proteccion") concerns.push("protección solar diaria");

  if (hasAcne && primaryGoal !== "control_grasa") {
    concerns.push(acneLevel === "constante" ? "brotes frecuentes" : "brotes ocasionales");
  }
  if (sensitivityLevel === "alta" && primaryGoal !== "calmar") {
    concerns.push("piel sensible");
  }
  if (needsSpf && primaryGoal !== "proteccion") {
    concerns.push("protección solar");
  }

  return {
    skinType,
    primaryGoal,
    acneLevel,
    sensitivityLevel,
    shineLevel,
    environment,
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

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function scoreProduct(product: ProductForAi, profile: UserProfile) {
  const productTags = splitTags(product.skinTags);
  const nameLower = normalizeText(product.name);
  const catLower = normalizeText(product.category);
  const descLower = normalizeText(product.description);
  const fullText = `${nameLower} ${descLower}`;
  let score = 0;
  const matched: string[] = [];

  // Hard filter out body-only products from facial quiz
  if (isBodyOnlyProduct(product)) {
    return { score: -20, matched: [] };
  }

  // Skin type match (tags + description)
  if (productTags.includes(profile.skinType)) {
    score += 4;
    matched.push(profile.skinType);
  } else if (profile.skinType === "normal" && productTags.includes("todos")) {
    score += 3;
    matched.push("todo tipo de piel");
  }

  // Description-based semantic scoring (ingredients, benefits, and texture)
  const descAcne = /acne|brote|impureza|poro|punto negro|sebo/.test(descLower);
  const descOilControl = /matific|control de grasa|exceso de grasa|brillo|hamamelis|astringente/.test(descLower);
  const descHydration = /hidrat|humect|deshidrat|reseca|barrera|nutr|suaviza|aloe|miel/.test(descLower);
  const descBrightening = /aclar|mancha|unific|luminos|vitamina c|concha nacar|tono/.test(descLower);
  const descAntiAging = /antiedad|madura|colageno|firmeza|lineas|arruga|regenera|baba de caracol|elasticidad/.test(descLower);
  const descCalming = /calm|sensible|rojec|enrojec|rosacea|irrit|avena|miel|rosas/.test(descLower);
  const descSpf = /spf|filtro solar|proteccion solar|rayos uv|sol/.test(descLower);
  const descExfoliant = /exfoli|celulas muertas|renova/.test(descLower);

  // Heavy bonus for the user's explicit PRIMARY GOAL (tags + description)
  if (profile.primaryGoal === "manchas" && (productTags.includes("aclarante") || descBrightening)) {
    score += 9;
    matched.push("aclarante");
  }
  if (
    profile.primaryGoal === "antiedad" &&
    (productTags.includes("antiedad") || productTags.includes("madura") || descAntiAging)
  ) {
    score += 9;
    matched.push("antiedad");
  }
  if (
    profile.primaryGoal === "control_grasa" &&
    (productTags.includes("grasa") || productTags.includes("acne") || descOilControl)
  ) {
    score += 8;
    matched.push("control de grasa");
  }
  if (
    profile.primaryGoal === "hidratacion" &&
    (productTags.includes("hidratante") || nameLower.includes("humectante") || descHydration)
  ) {
    score += 8;
    matched.push("hidratante");
  }
  if (
    profile.primaryGoal === "calmar" &&
    (productTags.includes("calmante") ||
      productTags.includes("sensible") ||
      productTags.includes("rosacea") ||
      descCalming)
  ) {
    score += 9;
    matched.push("calmante");
  }
  if (profile.primaryGoal === "proteccion" && (productTags.includes("proteccion") || descSpf)) {
    score += 9;
    matched.push("protección solar");
  }

  // Secondary concern bonuses (tags + description)
  if (profile.acneLevel === "constante" && (productTags.includes("acne") || descAcne)) {
    score += 6;
    matched.push("acné");
  } else if (profile.acneLevel === "ocasional" && (productTags.includes("acne") || descAcne)) {
    score += 3;
    matched.push("brotes ocasionales");
  }

  if (
    profile.sensitivityLevel === "alta" &&
    (productTags.includes("calmante") || productTags.includes("sensible") || descCalming)
  ) {
    score += 5;
    matched.push("sensible");
  } else if (profile.sensitivityLevel === "media" && (productTags.includes("sensible") || descCalming)) {
    score += 2;
    matched.push("sensible");
  }

  if (profile.prefersHydration && (productTags.includes("hidratante") || descHydration)) {
    score += 3;
    matched.push("hidratación");
  }
  if (profile.prefersOilControl && (productTags.includes("grasa") || descOilControl)) {
    score += 3;
    matched.push("control de brillo");
  }
  if (profile.prefersBrightening && (productTags.includes("aclarante") || descBrightening)) {
    score += 4;
    matched.push("luminosidad");
  }
  if (profile.prefersAntiAging && (productTags.includes("antiedad") || productTags.includes("madura") || descAntiAging)) {
    score += 4;
    matched.push("antiedad");
  }
  if (profile.needsSpf && (productTags.includes("proteccion") || descSpf)) {
    score += 5;
    matched.push("SPF");
  }

  // Respect explicit contraindications written in product descriptions
  if (profile.skinType === "seca" && /evitar en piel(es)? (muy )?seca|no recomendad[ao] para piel(es)? seca/.test(descLower)) {
    score -= 8;
  }
  if (profile.skinType === "grasa" && /evitar en piel(es)? (muy )?grasa|no recomendad[ao] para piel(es)? grasa/.test(descLower)) {
    score -= 8;
  }
  if (profile.sensitivityLevel === "alta" && /evitar en piel(es)? (muy )?sensible|no recomendad[ao] para piel(es)? sensible/.test(descLower)) {
    score -= 8;
  }

  // Strict mismatch penalties so irrelevant products don't repeat for every user
  const isAntiAcneProduct = /anti\s*acn|antiacn/.test(nameLower);
  if (profile.acneLevel === "ninguno" && isAntiAcneProduct) {
    score -= 10;
  }

  const isSpfProduct = /spf|filtro solar/.test(fullText) || catLower.includes("protector");
  if (!profile.needsSpf && isSpfProduct) {
    score -= 6;
  }

  if (
    profile.skinType === "grasa" &&
    productTags.includes("seca") &&
    !productTags.includes("grasa") &&
    !productTags.includes("mixta")
  ) {
    score -= 6;
  }

  if (
    profile.skinType === "seca" &&
    productTags.includes("grasa") &&
    !productTags.includes("seca") &&
    !productTags.includes("mixta")
  ) {
    score -= 6;
  }

  if (profile.sensitivityLevel === "alta" && (productTags.includes("exfoliante") || descExfoliant)) {
    score -= 5;
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

  const canTake = (item: (typeof ranked)[number]) =>
    item.score > 0 &&
    !selected.some((s) => s.product.id === item.product.id) &&
    !conflictsWithSelected(
      item.product,
      selected.map((s) => s.product),
    );

  const take = (predicate: (item: (typeof ranked)[number]) => boolean) => {
    for (const item of ranked) {
      if (!canTake(item)) continue;
      if (!predicate(item)) continue;
      selected.push(item);
      return true;
    }
    return false;
  };

  // 1) Cleanser or toner appropriate for skin type
  take((item) =>
    /limpieza|jab[oó]n|t[oó]nico|micelar|agua de rosas/i.test(
      `${item.product.category} ${item.product.name}`,
    ),
  );

  // 2) Targeted treatment (serum / mask / exfoliant / primary goal cream)
  if (profile.primaryGoal === "manchas") {
    take((item) => /vitamina c|aclarante/i.test(item.product.name));
  } else if (profile.primaryGoal === "antiedad") {
    take((item) => /macadamia|vitamina c|exfoliante rosa/i.test(item.product.name));
  } else if (profile.primaryGoal === "calmar" || profile.sensitivityLevel === "alta") {
    take((item) => /miel|avena|rosas/i.test(item.product.name));
  } else if (profile.primaryGoal === "control_grasa" || profile.acneLevel === "constante") {
    take((item) => /anti\s*acn|hamamelis/i.test(item.product.name));
  } else if (profile.primaryGoal === "hidratacion") {
    take((item) => /humectante|miel|vitamina c/i.test(item.product.name));
  }

  // 3) Daily facial cream / moisturizer if not already covered
  if (
    !selected.some((s) =>
      /crema facial/i.test(s.product.category) && !/spf|solar/i.test(s.product.name),
    )
  ) {
    take(
      (item) =>
        /crema/i.test(item.product.category) && !/spf|solar/i.test(item.product.name),
    );
  }

  // 4) SPF if needed
  if (profile.needsSpf) {
    take((item) =>
      /spf|solar|protege/i.test(`${item.product.name} ${item.product.category}`),
    );
  }

  // Fill remaining slots with highest-scoring non-conflicting facial products
  for (const item of ranked) {
    if (selected.length >= limit) break;
    if (!canTake(item)) continue;
    selected.push(item);
  }

  // Sort by natural routine step order (cleanser -> toner/mask -> serum -> cream -> SPF)
  return selected
    .slice(0, limit)
    .sort(
      (a, b) => getRoutineStepOrder(a.product) - getRoutineStepOrder(b.product),
    );
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
        ? `Seleccionado para tu piel ${profile.skinType} por su enfoque en ${item.matched.slice(0, 3).join(", ")}.`
        : `Complementa tu rutina diaria para piel ${profile.skinType}.`;
    reasons[item.product.id] = why;
  }

  const concernText =
    profile.concerns.length > 0
      ? `Priorizamos ${profile.concerns.slice(0, 3).join(", ")}.`
      : "Armamos una rutina equilibrada y ligera para tu día a día.";

  return {
    skinType: profile.skinType,
    summary: `Tu piel muestra características de piel ${profile.skinType}. ${concernText}`,
    tips: [
      profile.sensitivityLevel === "alta"
        ? "Aplica cada producto con toques suaves sin frotar, idealmente con agua tibia o fresca."
        : "Limpia tu rostro mañana y noche con movimientos circulares suaves durante 30 segundos.",
      profile.needsSpf
        ? "Reaplica tu protector solar SPF 45 cada 3 a 4 horas si estás al aire libre o cerca de ventanas."
        : "Mantén una hidratación constante incluso los días que permaneces en interiores.",
      "Dale a tu piel de 2 a 3 semanas de constancia para notar el equilibrio natural de los ingredientes botánicos.",
    ],
    productIds: selected.map((item) => item.product.id),
    reasons,
  };
}

/** Validate AI picks against active facial products, remove combo conflicts, and keep routine order. */
export function refineAiPicks(
  ai: RecommendationResult,
  answers: AnswerForAi[],
  products: ProductForAi[],
): RecommendationResult {
  const profile = buildUserProfile(answers);
  const byId = new Map(products.map((p) => [p.id, p]));
  const picked: ProductForAi[] = [];

  for (const id of ai.productIds ?? []) {
    const product = byId.get(id);
    if (!product) continue;
    if (isBodyOnlyProduct(product)) continue;
    if (picked.some((p) => p.id === product.id)) continue;
    if (conflictsWithSelected(product, picked)) continue;
    picked.push(product);
  }

  if (picked.length >= 2) {
    // Ensure SPF if strongly needed and AI omitted it
    if (profile.needsSpf) {
      const hasSpf = picked.some((p) =>
        /spf|solar|protege/i.test(`${p.name} ${p.skinTags}`),
      );
      if (!hasSpf) {
        const spf = products.find(
          (p) =>
            (/spf|filtro solar/i.test(p.name) ||
              p.category.toLowerCase().includes("protector")) &&
            !conflictsWithSelected(p, picked),
        );
        if (spf) {
          if (picked.length >= 4) {
            picked[picked.length - 1] = spf;
          } else {
            picked.push(spf);
          }
        }
      }
    }

    const ordered = picked
      .slice(0, 4)
      .sort((a, b) => getRoutineStepOrder(a) - getRoutineStepOrder(b));

    return {
      ...ai,
      skinType: ai.skinType || profile.skinType,
      productIds: ordered.map((p) => p.id),
    };
  }

  return preciseFallbackRecommendation(answers, products);
}
