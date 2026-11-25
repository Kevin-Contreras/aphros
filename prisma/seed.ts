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
      "Sérum antioxidante de textura ligera y rápida absorción con vitamina C. Ayuda a atenuar manchas solares, unificar el tono, aportar luminosidad y prevenir líneas finas. Ideal para piel mixta, seca, normal o madura; aplicar de mañana antes del protector solar o de noche.",
    category: "Serum",
    skinTags: "mixta,seca,madura,normal,aclarante,antiedad",
    price: 61.6,
    imageUrl: "/products/serum-vitamina-c.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Hamamelis",
    description:
      "Crema matificante de textura ligera con extracto de hamamelis astringente natural. Regula el exceso de sebo, minimiza el brillo en zona T y mantiene los poros limpios sin sensación pesada. Ideal para piel grasa o mixta de uso diario; evitar en piel muy seca.",
    category: "Crema facial",
    skinTags: "grasa,mixta,acne",
    price: 72,
    imageUrl: "/products/crema-hamamelis.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Jabón Facial Antiacné",
    description:
      "Limpiador facial artesanal con aceite de semilla de girasol, melocotón, Omega 6 y vitamina E. Limpia a profundidad poros obstruidos, reduce exceso de grasa y ayuda a controlar puntos negros y brotes sin resecar en exceso. Uso mañana y noche para piel grasa, mixta o con tendencia al acné.",
    category: "Jabón",
    skinTags: "acne,grasa,mixta",
    price: 65,
    imageUrl: "/products/jabon-antiacne.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Anti Acné",
    description:
      "Tratamiento facial ligero enfocado en calmar brotes activos, disminuir impurezas y equilibrar la producción de grasa. Se absorbe rápido sin obstruir poros. Recomendada de día y noche para piel grasa o mixta con acné frecuente u ocasional; evitar en piel seca sin brotes.",
    category: "Crema facial",
    skinTags: "acne,grasa,mixta",
    price: 68,
    imageUrl: "/products/crema-antiacne.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Hidratante para Manos Coco",
    description:
      "Crema corporal nutritiva para manos con aceite de coco, aloe vera y vitamina E. Repara resequedad, grietas y aspereza dejando las manos suaves sin sensación grasosa.",
    category: "Manos",
    skinTags: "seca,sensible,hidratante",
    price: 50,
    imageUrl: "/products/crema-manos-coco.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Bálsamo Labial de Fresa",
    description:
      "Bálsamo hidratante, regenerador y nutritivo para labios resecos o agrietados, con suave aroma natural a fresa.",
    category: "Labios",
    skinTags: "seca,hidratante",
    price: 30,
    imageUrl: "/products/balsamo-fresa.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Macadamia",
    description:
      "Crema facial nutritiva antiedad con aceite de macadamia, baba de caracol, colágeno y vitamina E. Mejora la firmeza, elasticidad y suaviza líneas de expresión mientras nutre profundamente la barrera cutánea. Ideal para piel madura, seca o normal (uso nocturno o diario); evitar en piel muy grasa con brotes.",
    category: "Crema facial",
    skinTags: "madura,seca,normal,antiedad,hidratante",
    price: 68,
    imageUrl: "/products/crema-macadamia.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial con Filtro Solar SPF 45",
    description:
      "Protector solar facial diario SPF 45 con aceite de jojoba y vitamina E. Protege contra rayos UV, previene manchas solares y envejecimiento prematuro sin dejar capa blanca pesada. Apto para todo tipo de piel, incluyendo grasa, mixta y sensible; aplicar cada mañana como último paso.",
    category: "Protector solar",
    skinTags: "todos,grasa,seca,mixta,sensible,normal,proteccion",
    price: 59.5,
    imageUrl: "/products/crema-spf45.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Exfoliante Labial Semilla de Fresa",
    description:
      "Exfoliante suave para labios con semillas de fresa, aceite de almendras y vitamina E. Retira pellejitos secos y deja los labios lisos e hidratados.",
    category: "Labios",
    skinTags: "seca,exfoliante",
    price: 30,
    imageUrl: "/products/exfoliante-labial.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Agua Micelar Artesanal",
    description:
      "Limpiador y desmaquillante suave con extractos botánicos naturales que remueve maquillaje, protector solar e impurezas del día sin irritar ni resecar. Apto para todo tipo de piel, excelente primer paso diario incluso en pieles sensibles o deshidratadas.",
    category: "Limpieza",
    skinTags: "todos,sensible,mixta,seca,grasa,normal",
    price: 49.5,
    imageUrl: "/products/agua-micelar.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Jabón Facial de Miel y Avena",
    description:
      "Jabón facial artesanal extra suave con miel pura y avena calmante. Limpia delicadamente sin alterar la barrera cutánea, alivia tirantez, descamación y enrojecimiento. Ideal para piel sensible, seca o irritada; uso diario mañana y noche.",
    category: "Jabón",
    skinTags: "sensible,seca,calmante,hidratante",
    price: 65,
    imageUrl: "/products/jabon-miel-avena.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Agua de Rosas Artesanal",
    description:
      "Tónico facial botánico refrescante que equilibra el pH, calma rojeces, rosácea e inflamación y aporta hidratación ligera tras la limpieza. Ideal para piel sensible, con rosácea, mixta o con brotes ocasionales; aplicar en bruma o a toquecitos mañana y noche.",
    category: "Tónico",
    skinTags: "acne,sensible,rosacea,mixta,calmante,normal",
    price: 49.5,
    imageUrl: "/products/agua-rosas.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Combo Rosas",
    description:
      "Set calmante y equilibrante con Agua de Rosas Artesanal y complementos botánicos Aphros. Diseñado para reducir enrojecimiento, aliviar piel reactiva o con rosácea y mantener frescura diaria sin irritación. Ideal para piel sensible o con brotes leves.",
    category: "Combo",
    skinTags: "acne,sensible,rosacea,calmante",
    price: 93.5,
    imageUrl: "/products/combo-rosas.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Exfoliante para Pies Menta Piperita y Luffa",
    description:
      "Exfoliante corporal para pies con menta piperita refrescante y luffa natural que suaviza asperezas y talones resecos. Presentación 250 mL.",
    category: "Pies",
    skinTags: "seca,exfoliante,hidratante",
    price: 110.5,
    imageUrl: "/products/exfoliante-pies-luffa.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Protege y Aclara",
    description:
      "Combo dúo de día que incluye Crema Facial con Filtro Solar SPF 45 + Serum Facial de Vitamina C. Combina luminosidad, corrección de manchas y protección solar diaria en un solo set. Ideal para piel mixta, seca o normal expuesta al sol que busca unificar el tono.",
    category: "Combo",
    skinTags: "mixta,seca,normal,aclarante,proteccion,antiedad",
    price: 140,
    imageUrl: "/products/protege-aclara.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Combo Anti Acné",
    description:
      "Set facial completo para controlar exceso de sebo, limpiar poros y reducir brotes persistentes e impurezas. Incluye rutina antiacné coordinada para piel grasa o mixta con acné constante; evitar en piel seca o muy sensible.",
    category: "Combo",
    skinTags: "acne,grasa,mixta",
    price: 176,
    imageUrl: "/products/combo-antiacne.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Kit Mascarilla de Miel",
    description:
      "Mascarilla facial artesanal nutritiva y reconfortante a base de miel natural. Aporta hidratación intensa, calma irritación y devuelve suavidad a pieles tirantes o expuestas a aire acondicionado. Uso 1 a 2 veces por semana en piel seca, sensible o deshidratada.",
    category: "Mascarilla",
    skinTags: "sensible,seca,calmante,hidratante,normal",
    price: 70.4,
    imageUrl: "/products/kit-mascarilla-miel.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Aclarante",
    description:
      "Crema facial renovadora con baba de caracol, concha nácar y vitamina E. Ayuda a desvanecer manchas oscuras, marcas post-brotes y tono desigual mientras hidrata suavemente. Ideal para piel mixta, seca, normal o madura; usar preferiblemente de noche junto con SPF de día.",
    category: "Crema facial",
    skinTags: "aclarante,mixta,seca,madura,normal",
    price: 68,
    imageUrl: "/products/crema-aclarante.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Combo Hidratante de Manos",
    description:
      "Dúo de 2 cremas hidratantes de manos Aphros con ingredientes botánicos para nutrir y proteger manos secas todo el día.",
    category: "Combo",
    skinTags: "seca,hidratante",
    price: 100,
    imageUrl: "/products/combo-manos.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Humectante",
    description:
      "Crema hidratante diaria de textura cómoda que restaura la humedad perdida, elimina la tirantez y fortalece la barrera cutánea frente a clima seco o aire acondicionado. Ideal para piel seca, deshidratada, normal o mixta de uso mañana y noche.",
    category: "Crema facial",
    skinTags: "seca,mixta,normal,hidratante",
    price: 80,
    imageUrl: "/products/crema-humectante.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Facial Exfoliante Rosa de Castilla",
    description:
      "Exfoliante facial cremoso con rosa de castilla, baba de caracol, aloe vera y vitamina E. Remueve células muertas, afina la textura y potencia la absorción de sérums y cremas. Uso 1 a 2 veces por semana de noche para piel mixta, normal, seca o madura; evitar en piel muy sensible o con rosácea.",
    category: "Crema facial",
    skinTags: "mixta,seca,normal,exfoliante,madura",
    price: 68,
    imageUrl: "/products/crema-exfoliante-rosa.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Crema Exfoliante para Pies Menta y Arroz",
    description:
      "Exfoliante suave para pies con menta refrescante y polvo de arroz que hidrata y renueva la piel áspera. Presentación 100 mL.",
    category: "Pies",
    skinTags: "seca,exfoliante",
    price: 65,
    imageUrl: "/products/exfoliante-pies-arroz.svg",
    buyUrl: MARKETPLACE,
  },
  {
    name: "Desodorante Natural de Alumbre de Potasio",
    description:
      "Piedra mineral cristalina 100% natural libre de aluminio sintético y fragancias. Controla el mal olor respetando la transpiración natural, ideal para axilas sensibles. 100 g.",
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
