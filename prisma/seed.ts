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
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Hamamelis",
    description: "Control de grasa para piel grasa. Equilibra y matifica.",
    category: "Crema facial",
    skinTags: "grasa,mixta,acne",
    price: 72,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Jabón Facial Antiacné",
    description:
      "Semilla de girasol, melocotón, Omega 6 y vitamina E. Limpieza para piel con acné.",
    category: "Jabón",
    skinTags: "acne,grasa,mixta",
    price: 65,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Anti Acné",
    description: "Tratamiento facial para reducir brotes e impurezas.",
    category: "Crema facial",
    skinTags: "acne,grasa,mixta",
    price: 68,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Hidratante para Manos Coco",
    description: "Con aloe vera y vitamina E. Nutre e hidrata manos secas.",
    category: "Manos",
    skinTags: "seca,sensible,hidratante",
    price: 50,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Bálsamo Labial de Fresa",
    description: "Hidratante regenerador y nutritivo para labios.",
    category: "Labios",
    skinTags: "seca,hidratante",
    price: 30,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Macadamia",
    description:
      "Baba de caracol, colágeno y vitamina E. Pensada para piel madura.",
    category: "Crema facial",
    skinTags: "madura,seca,antiedad,hidratante",
    price: 68,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial con Filtro Solar SPF 45",
    description: "Aceite de jojoba y vitamina E. Protección diaria.",
    category: "Protector solar",
    skinTags: "todos,grasa,seca,mixta,sensible,proteccion",
    price: 59.5,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Exfoliante Labial Semilla de Fresa",
    description: "Almendras y vitamina E. Suaviza e hidrata los labios.",
    category: "Labios",
    skinTags: "seca,exfoliante",
    price: 30,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Agua Micelar Artesanal",
    description: "Desmaquillante hidratante con extractos naturales.",
    category: "Limpieza",
    skinTags: "todos,sensible,mixta,seca,grasa",
    price: 49.5,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Jabón Facial de Miel y Avena",
    description: "Nutritivo y calmante para piel sensible.",
    category: "Jabón",
    skinTags: "sensible,seca,calmante",
    price: 65,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Agua de Rosas Artesanal",
    description: "Hidratante y suavizante para piel con acné o rosácea.",
    category: "Tónico",
    skinTags: "acne,sensible,rosacea,mixta",
    price: 49.5,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Combo Rosas",
    description: "Rutina con agua de rosas y complementos Aphros.",
    category: "Combo",
    skinTags: "acne,sensible,rosacea",
    price: 93.5,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Exfoliante para Pies Menta Piperita y Luffa",
    description: "Calmante e hidratante. Presentación 250 mL.",
    category: "Pies",
    skinTags: "seca,exfoliante,hidratante",
    price: 110.5,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Protege y Aclara",
    description: "Combo crema con filtro solar + serum vitamina C.",
    category: "Combo",
    skinTags: "mixta,seca,aclarante,proteccion,antiedad",
    price: 140,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Combo Anti Acné",
    description: "Set para controlar grasa e impurezas.",
    category: "Combo",
    skinTags: "acne,grasa,mixta",
    price: 176,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Kit Mascarilla de Miel",
    description: "Mascarilla nutritiva y calmante.",
    category: "Mascarilla",
    skinTags: "sensible,seca,calmante,hidratante",
    price: 70.4,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Aclarante",
    description: "Baba de caracol, concha nácar y vitamina E.",
    category: "Crema facial",
    skinTags: "aclarante,mixta,seca,madura",
    price: 68,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Combo Hidratante de Manos",
    description: "2 cremas hidratantes de manos Aphros.",
    category: "Combo",
    skinTags: "seca,hidratante",
    price: 100,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Humectante",
    description: "Hidratación diaria para piel reseca o deshidratada.",
    category: "Crema facial",
    skinTags: "seca,mixta,hidratante",
    price: 80,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Exfoliante Rosa de Castilla",
    description: "Con baba de caracol, aloe vera y vitamina E.",
    category: "Crema facial",
    skinTags: "mixta,seca,exfoliante,madura",
    price: 68,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Exfoliante para Pies Menta y Arroz",
    description: "Calmante e hidratante. Presentación 100 mL.",
    category: "Pies",
    skinTags: "seca,exfoliante",
    price: 65,
    buyUrl: MARKETPLACE,
  },
  {
    name: "Desodorante Natural de Alumbre de Potasio",
    description: "Piedra cristal para piel sensible. 100 g.",
    category: "Desodorante",
    skinTags: "sensible,todos",
    price: 185,
    buyUrl: MARKETPLACE,
  },
];

const questions = [
  {
    text: "¿Cómo describirías tu tipo de piel?",
    order: 1,
    options: [
      { label: "Grasa (brilla con facilidad)", value: "grasa", order: 1 },
      { label: "Seca (se siente tirante)", value: "seca", order: 2 },
      { label: "Mixta (zona T grasa, mejillas normales/secas)", value: "mixta", order: 3 },
      { label: "Sensible (enrojece o arde fácil)", value: "sensible", order: 4 },
      { label: "Normal / equilibrada", value: "normal", order: 5 },
    ],
  },
  {
    text: "¿Qué tanto brillo o grasa notas durante el día?",
    order: 2,
    options: [
      { label: "Mucho, sobre todo en frente y nariz", value: "mucho_brillo", order: 1 },
      { label: "Algo en la zona T", value: "algo_brillo", order: 2 },
      { label: "Poco o nada", value: "poco_brillo", order: 3 },
      { label: "Más bien se reseca", value: "reseca", order: 4 },
    ],
  },
  {
    text: "¿Tu piel es sensible o reactiva?",
    order: 3,
    options: [
      { label: "Sí, se irrita con muchos productos", value: "muy_sensible", order: 1 },
      { label: "A veces, con cambios de clima o fragancias", value: "algo_sensible", order: 2 },
      { label: "No, tolera bien la mayoría", value: "no_sensible", order: 3 },
    ],
  },
  {
    text: "¿Tienes acné o brotes frecuentes?",
    order: 4,
    options: [
      { label: "Sí, de forma constante", value: "acne_constante", order: 1 },
      { label: "De vez en cuando", value: "acne_ocasional", order: 2 },
      { label: "Casi nunca", value: "sin_acne", order: 3 },
    ],
  },
  {
    text: "¿Cuál es tu principal preocupación ahora?",
    order: 5,
    options: [
      { label: "Controlar grasa e impurezas", value: "control_grasa", order: 1 },
      { label: "Hidratación y sequedad", value: "hidratacion", order: 2 },
      { label: "Manchas / tono uneven", value: "manchas", order: 3 },
      { label: "Signos de edad / firmeza", value: "antiedad", order: 4 },
      { label: "Calmar sensibilidad o enrojecimiento", value: "calmar", order: 5 },
      { label: "Protección solar diaria", value: "proteccion", order: 6 },
    ],
  },
  {
    text: "¿Cuánta exposición al sol tienes en un día típico?",
    order: 6,
    options: [
      { label: "Alta (mucho tiempo al aire libre)", value: "sol_alto", order: 1 },
      { label: "Media", value: "sol_medio", order: 2 },
      { label: "Baja (casi siempre en interiores)", value: "sol_bajo", order: 3 },
    ],
  },
  {
    text: "¿Qué rutina de cuidado usas hoy?",
    order: 7,
    options: [
      { label: "Ninguna / solo jabón", value: "sin_rutina", order: 1 },
      { label: "Limpieza básica", value: "basica", order: 2 },
      { label: "Limpieza + crema", value: "media", order: 3 },
      { label: "Rutina completa (limpiador, sérum, crema, SPF)", value: "completa", order: 4 },
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
