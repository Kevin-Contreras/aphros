import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database-url";

const connectionString = getDatabaseUrl();
if (!connectionString) {
  throw new Error("Missing DATABASE_URL (or POSTGRES_URL)");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const MARKETPLACE = "https://www.pacifiko.com/marketplace/aphros";

const products = [
  {
    name: "Serum Facial de Vitamina C",
    description:
      "Hidratante aclarante y antiedad. Ideal para unificar tono y dar luminosidad.",
    category: "Serum",
    skinTags: "mixta,seca,madura,aclarante,antiedad",
    price: 61.6,
    imageUrl: "/products/serum-vitamina-c.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Hamamelis",
    description: "Control de grasa para piel grasa. Equilibra y matifica.",
    category: "Crema facial",
    skinTags: "grasa,mixta,acne",
    price: 72,
    imageUrl: "/products/crema-hamamelis.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Jabón Facial Antiacné",
    description:
      "Semilla de girasol, melocotón, Omega 6 y vitamina E. Limpieza para piel con acné.",
    category: "Jabón",
    skinTags: "acne,grasa,mixta",
    price: 65,
    imageUrl: "/products/jabon-antiacne.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Anti Acné",
    description: "Tratamiento facial para reducir brotes e impurezas.",
    category: "Crema facial",
    skinTags: "acne,grasa,mixta",
    price: 68,
    imageUrl: "/products/crema-antiacne.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Hidratante para Manos Coco",
    description: "Con aloe vera y vitamina E. Nutre e hidrata manos secas.",
    category: "Manos",
    skinTags: "seca,sensible,hidratante",
    price: 50,
    imageUrl: "/products/crema-manos-coco.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Bálsamo Labial de Fresa",
    description: "Hidratante regenerador y nutritivo para labios.",
    category: "Labios",
    skinTags: "seca,hidratante",
    price: 30,
    imageUrl: "/products/balsamo-fresa.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Macadamia",
    description:
      "Baba de caracol, colágeno y vitamina E. Pensada para piel madura.",
    category: "Crema facial",
    skinTags: "madura,seca,antiedad,hidratante",
    price: 68,
    imageUrl: "/products/crema-macadamia.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial con Filtro Solar SPF 45",
    description: "Aceite de jojoba y vitamina E. Protección diaria.",
    category: "Protector solar",
    skinTags: "todos,grasa,seca,mixta,sensible,proteccion",
    price: 59.5,
    imageUrl: "/products/crema-spf45.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Exfoliante Labial Semilla de Fresa",
    description: "Almendras y vitamina E. Suaviza e hidrata los labios.",
    category: "Labios",
    skinTags: "seca,exfoliante",
    price: 30,
    imageUrl: "/products/exfoliante-labial.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Agua Micelar Artesanal",
    description: "Desmaquillante hidratante con extractos naturales.",
    category: "Limpieza",
    skinTags: "todos,sensible,mixta,seca,grasa",
    price: 49.5,
    imageUrl: "/products/agua-micelar.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Jabón Facial de Miel y Avena",
    description: "Nutritivo y calmante para piel sensible.",
    category: "Jabón",
    skinTags: "sensible,seca,calmante",
    price: 65,
    imageUrl: "/products/jabon-miel-avena.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Agua de Rosas Artesanal",
    description: "Hidratante y suavizante para piel con acné o rosácea.",
    category: "Tónico",
    skinTags: "acne,sensible,rosacea,mixta",
    price: 49.5,
    imageUrl: "/products/agua-rosas.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Combo Rosas",
    description: "Rutina con agua de rosas y complementos Aphros.",
    category: "Combo",
    skinTags: "acne,sensible,rosacea",
    price: 93.5,
    imageUrl: "/products/combo-rosas.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Exfoliante para Pies Menta Piperita y Luffa",
    description: "Calmante e hidratante. Presentación 250 mL.",
    category: "Pies",
    skinTags: "seca,exfoliante,hidratante",
    price: 110.5,
    imageUrl: "/products/exfoliante-pies-luffa.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Protege y Aclara",
    description: "Combo crema con filtro solar + serum vitamina C.",
    category: "Combo",
    skinTags: "mixta,seca,aclarante,proteccion,antiedad",
    price: 140,
    imageUrl: "/products/protege-aclara.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Combo Anti Acné",
    description: "Set para controlar grasa e impurezas.",
    category: "Combo",
    skinTags: "acne,grasa,mixta",
    price: 176,
    imageUrl: "/products/combo-antiacne.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Kit Mascarilla de Miel",
    description: "Mascarilla nutritiva y calmante.",
    category: "Mascarilla",
    skinTags: "sensible,seca,calmante,hidratante",
    price: 70.4,
    imageUrl: "/products/kit-mascarilla-miel.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Aclarante",
    description: "Baba de caracol, concha nácar y vitamina E.",
    category: "Crema facial",
    skinTags: "aclarante,mixta,seca,madura",
    price: 68,
    imageUrl: "/products/crema-aclarante.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Combo Hidratante de Manos",
    description: "2 cremas hidratantes de manos Aphros.",
    category: "Combo",
    skinTags: "seca,hidratante",
    price: 100,
    imageUrl: "/products/combo-manos.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Humectante",
    description: "Hidratación diaria para piel reseca o deshidratada.",
    category: "Crema facial",
    skinTags: "seca,mixta,hidratante",
    price: 80,
    imageUrl: "/products/crema-humectante.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Exfoliante Rosa de Castilla",
    description: "Con baba de caracol, aloe vera y vitamina E.",
    category: "Crema facial",
    skinTags: "mixta,seca,exfoliante,madura",
    price: 68,
    imageUrl: "/products/crema-exfoliante-rosa.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Exfoliante para Pies Menta y Arroz",
    description: "Calmante e hidratante. Presentación 100 mL.",
    category: "Pies",
    skinTags: "seca,exfoliante",
    price: 65,
    imageUrl: "/products/exfoliante-pies-arroz.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Desodorante Natural de Alumbre de Potasio",
    description: "Piedra cristal para piel sensible. 100 g.",
    category: "Desodorante",
    skinTags: "sensible,todos",
    price: 185,
    imageUrl: "/products/desodorante-alumbre.svg",
    buyUrl: MARKETPLACE,
  },
];

const questions = [
  {
    text: "Al despertar, ¿cómo sientes tu rostro?",
    order: 1,
    options: [
      { label: "Brilloso o con exceso de grasa", value: "grasa", order: 1 },
      { label: "Tirante, áspero o deshidratado", value: "seca", order: 2 },
      { label: "Graso en frente/nariz y seco en mejillas", value: "mixta", order: 3 },
      { label: "Fácil de enrojecer o irritar", value: "sensible", order: 4 },
      { label: "Cómodo y equilibrado", value: "normal", order: 5 },
    ],
  },
  {
    text: "Dos horas después de lavarte la cara, ¿qué notas?",
    order: 2,
    options: [
      { label: "Vuelve el brillo rápido", value: "mucho_brillo", order: 1 },
      { label: "Solo brilla un poco la zona T", value: "algo_brillo", order: 2 },
      { label: "Se mantiene mate y cómoda", value: "poco_brillo", order: 3 },
      { label: "Se reseca o pica", value: "reseca", order: 4 },
    ],
  },
  {
    text: "¿Te salen granitos, puntos negros o brotes?",
    order: 3,
    options: [
      { label: "Sí, casi siempre tengo brotes", value: "acne_constante", order: 1 },
      { label: "Solo en épocas de estrés o ciclo", value: "acne_ocasional", order: 2 },
      { label: "Casi no tengo acné", value: "sin_acne", order: 3 },
    ],
  },
  {
    text: "Cuando pruebas un producto nuevo, ¿cómo reacciona tu piel?",
    order: 4,
    options: [
      { label: "Se irrita o arde con facilidad", value: "muy_sensible", order: 1 },
      { label: "A veces se pone roja o sensible", value: "algo_sensible", order: 2 },
      { label: "Casi nunca reacciona mal", value: "no_sensible", order: 3 },
    ],
  },
  {
    text: "Si Aphros te ayudara con una sola cosa, ¿cuál sería?",
    order: 5,
    options: [
      { label: "Menos grasa e impurezas", value: "control_grasa", order: 1 },
      { label: "Más hidratación y suavidad", value: "hidratacion", order: 2 },
      { label: "Aclarar manchas y unificar tono", value: "manchas", order: 3 },
      { label: "Firmeza y signos de edad", value: "antiedad", order: 4 },
      { label: "Calmar enrojecimiento o molestias", value: "calmar", order: 5 },
      { label: "Proteger del sol todos los días", value: "proteccion", order: 6 },
    ],
  },
  {
    text: "¿Usas protector solar en tu día a día?",
    order: 6,
    options: [
      { label: "Casi nunca, aunque salgo mucho", value: "sol_alto", order: 1 },
      { label: "A veces, cuando hay mucho sol", value: "sol_medio", order: 2 },
      { label: "Sí, casi todos los días", value: "usa_spf_diario", order: 3 },
      { label: "Casi no salgo / no lo uso", value: "sol_bajo", order: 4 },
    ],
  },
  {
    text: "¿Cómo es tu rutina de skincare ahora?",
    order: 7,
    options: [
      { label: "Nada o solo jabón de baño", value: "sin_rutina", order: 1 },
      { label: "Solo limpio el rostro", value: "basica", order: 2 },
      { label: "Limpio y pongo crema", value: "media", order: 3 },
      { label: "Varios pasos (limpiador, sérum, crema, SPF)", value: "completa", order: 4 },
    ],
  },
  {
    text: "¿En qué ambiente pasas la mayor parte del día?",
    order: 8,
    options: [
      { label: "Calle / sol / calor de Guatemala", value: "ambiente_sol", order: 1 },
      { label: "Oficina o interiores con A/C", value: "ambiente_ac", order: 2 },
      { label: "Casa, poco sol directo", value: "ambiente_casa", order: 3 },
      { label: "Mezcla de todo", value: "ambiente_mixto", order: 4 },
    ],
  },
];

async function main() {
  await prisma.quizSubmission.deleteMany();
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  for (const question of questions) {
    const { options, ...rest } = question;
    await prisma.question.create({
      data: {
        ...rest,
        options: { create: options },
      },
    });
  }

  console.log(`Seeded ${products.length} products and ${questions.length} questions`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
