import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database-url";

const connectionString = getDatabaseUrl();
if (!connectionString) {
  throw new Error("Missing DATABASE_URL (or POSTGRES_URL)");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

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
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();

  for (const question of questions) {
    const { options, ...rest } = question;
    await prisma.question.create({
      data: {
        ...rest,
        active: true,
        options: { create: options },
      },
    });
  }

  const count = await prisma.question.count();
  console.log(`Replaced questions. Now ${count} active questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
