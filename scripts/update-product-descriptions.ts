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

const updates: Array<{ name: string; description: string; skinTags: string }> = [
  {
    name: "Serum Facial de Vitamina C",
    description:
      "Sérum antioxidante de textura ligera y rápida absorción con vitamina C. Ayuda a atenuar manchas solares, unificar el tono, aportar luminosidad y prevenir líneas finas. Ideal para piel mixta, seca, normal o madura; aplicar de mañana antes del protector solar o de noche.",
    skinTags: "mixta,seca,madura,normal,aclarante,antiedad",
  },
  {
    name: "Crema Facial Hamamelis",
    description:
      "Crema matificante de textura ligera con extracto de hamamelis astringente natural. Regula el exceso de sebo, minimiza el brillo en zona T y mantiene los poros limpios sin sensación pesada. Ideal para piel grasa o mixta de uso diario; evitar en piel muy seca.",
    skinTags: "grasa,mixta,acne",
  },
  {
    name: "Jabón Facial Antiacné",
    description:
      "Limpiador facial artesanal con aceite de semilla de girasol, melocotón, Omega 6 y vitamina E. Limpia a profundidad poros obstruidos, reduce exceso de grasa y ayuda a controlar puntos negros y brotes sin resecar en exceso. Uso mañana y noche para piel grasa, mixta o con tendencia al acné.",
    skinTags: "acne,grasa,mixta",
  },
  {
    name: "Crema Facial Anti Acné",
    description:
      "Tratamiento facial ligero enfocado en calmar brotes activos, disminuir impurezas y equilibrar la producción de grasa. Se absorbe rápido sin obstruir poros. Recomendada de día y noche para piel grasa o mixta con acné frecuente u ocasional; evitar en piel seca sin brotes.",
    skinTags: "acne,grasa,mixta",
  },
  {
    name: "Crema Hidratante para Manos Coco",
    description:
      "Crema corporal nutritiva para manos con aceite de coco, aloe vera y vitamina E. Repara resequedad, grietas y aspereza dejando las manos suaves sin sensación grasosa.",
    skinTags: "seca,sensible,hidratante",
  },
  {
    name: "Bálsamo Labial de Fresa",
    description:
      "Bálsamo hidratante, regenerador y nutritivo para labios resecos o agrietados, con suave aroma natural a fresa.",
    skinTags: "seca,hidratante",
  },
  {
    name: "Crema Facial Macadamia",
    description:
      "Crema facial nutritiva antiedad con aceite de macadamia, baba de caracol, colágeno y vitamina E. Mejora la firmeza, elasticidad y suaviza líneas de expresión mientras nutre profundamente la barrera cutánea. Ideal para piel madura, seca o normal (uso nocturno o diario); evitar en piel muy grasa con brotes.",
    skinTags: "madura,seca,normal,antiedad,hidratante",
  },
  {
    name: "Crema Facial con Filtro Solar SPF 45",
    description:
      "Protector solar facial diario SPF 45 con aceite de jojoba y vitamina E. Protege contra rayos UV, previene manchas solares y envejecimiento prematuro sin dejar capa blanca pesada. Apto para todo tipo de piel, incluyendo grasa, mixta y sensible; aplicar cada mañana como último paso.",
    skinTags: "todos,grasa,seca,mixta,sensible,normal,proteccion",
  },
  {
    name: "Exfoliante Labial Semilla de Fresa",
    description:
      "Exfoliante suave para labios con semillas de fresa, aceite de almendras y vitamina E. Retira pellejitos secos y deja los labios lisos e hidratados.",
    skinTags: "seca,exfoliante",
  },
  {
    name: "Agua Micelar Artesanal",
    description:
      "Limpiador y desmaquillante suave con extractos botánicos naturales que remueve maquillaje, protector solar e impurezas del día sin irritar ni resecar. Apto para todo tipo de piel, excelente primer paso diario incluso en pieles sensibles o deshidratadas.",
    skinTags: "todos,sensible,mixta,seca,grasa,normal",
  },
  {
    name: "Jabón Facial de Miel y Avena",
    description:
      "Jabón facial artesanal extra suave con miel pura y avena calmante. Limpia delicadamente sin alterar la barrera cutánea, alivia tirantez, descamación y enrojecimiento. Ideal para piel sensible, seca o irritada; uso diario mañana y noche.",
    skinTags: "sensible,seca,calmante,hidratante",
  },
  {
    name: "Agua de Rosas Artesanal",
    description:
      "Tónico facial botánico refrescante que equilibra el pH, calma rojeces, rosácea e inflamación y aporta hidratación ligera tras la limpieza. Ideal para piel sensible, con rosácea, mixta o con brotes ocasionales; aplicar en bruma o a toquecitos mañana y noche.",
    skinTags: "acne,sensible,rosacea,mixta,calmante,normal",
  },
  {
    name: "Combo Rosas",
    description:
      "Set calmante y equilibrante con Agua de Rosas Artesanal y complementos botánicos Aphros. Diseñado para reducir enrojecimiento, aliviar piel reactiva o con rosácea y mantener frescura diaria sin irritación. Ideal para piel sensible o con brotes leves.",
    skinTags: "acne,sensible,rosacea,calmante",
  },
  {
    name: "Crema Exfoliante para Pies Menta Piperita y Luffa",
    description:
      "Exfoliante corporal para pies con menta piperita refrescante y luffa natural que suaviza asperezas y talones resecos. Presentación 250 mL.",
    skinTags: "seca,exfoliante,hidratante",
  },
  {
    name: "Protege y Aclara",
    description:
      "Combo dúo de día que incluye Crema Facial con Filtro Solar SPF 45 + Serum Facial de Vitamina C. Combina luminosidad, corrección de manchas y protección solar diaria en un solo set. Ideal para piel mixta, seca o normal expuesta al sol que busca unificar el tono.",
    skinTags: "mixta,seca,normal,aclarante,proteccion,antiedad",
  },
  {
    name: "Combo Anti Acné",
    description:
      "Set facial completo para controlar exceso de sebo, limpiar poros y reducir brotes persistentes e impurezas. Incluye rutina antiacné coordinada para piel grasa o mixta con acné constante; evitar en piel seca o muy sensible.",
    skinTags: "acne,grasa,mixta",
  },
  {
    name: "Kit Mascarilla de Miel",
    description:
      "Mascarilla facial artesanal nutritiva y reconfortante a base de miel natural. Aporta hidratación intensa, calma irritación y devuelve suavidad a pieles tirantes o expuestas a aire acondicionado. Uso 1 a 2 veces por semana en piel seca, sensible o deshidratada.",
    skinTags: "sensible,seca,calmante,hidratante,normal",
  },
  {
    name: "Crema Facial Aclarante",
    description:
      "Crema facial renovadora con baba de caracol, concha nácar y vitamina E. Ayuda a desvanecer manchas oscuras, marcas post-brotes y tono desigual mientras hidrata suavemente. Ideal para piel mixta, seca, normal o madura; usar preferiblemente de noche junto con SPF de día.",
    skinTags: "aclarante,mixta,seca,madura,normal",
  },
  {
    name: "Combo Hidratante de Manos",
    description:
      "Dúo de 2 cremas hidratantes de manos Aphros con ingredientes botánicos para nutrir y proteger manos secas todo el día.",
    skinTags: "seca,hidratante",
  },
  {
    name: "Crema Facial Humectante",
    description:
      "Crema hidratante diaria de textura cómoda que restaura la humedad perdida, elimina la tirantez y fortalece la barrera cutánea frente a clima seco o aire acondicionado. Ideal para piel seca, deshidratada, normal o mixta de uso mañana y noche.",
    skinTags: "seca,mixta,normal,hidratante",
  },
  {
    name: "Crema Facial Exfoliante Rosa de Castilla",
    description:
      "Exfoliante facial cremoso con rosa de castilla, baba de caracol, aloe vera y vitamina E. Remueve células muertas, afina la textura y potencia la absorción de sérums y cremas. Uso 1 a 2 veces por semana de noche para piel mixta, normal, seca o madura; evitar en piel muy sensible o con rosácea.",
    skinTags: "mixta,seca,normal,exfoliante,madura",
  },
  {
    name: "Crema Exfoliante para Pies Menta y Arroz",
    description:
      "Exfoliante suave para pies con menta refrescante y polvo de arroz que hidrata y renueva la piel áspera. Presentación 100 mL.",
    skinTags: "seca,exfoliante",
  },
  {
    name: "Desodorante Natural de Alumbre de Potasio",
    description:
      "Piedra mineral cristalina 100% natural libre de aluminio sintético y fragancias. Controla el mal olor respetando la transpiración natural, ideal para axilas sensibles. 100 g.",
    skinTags: "sensible,todos",
  },
];

async function main() {
  let updated = 0;
  for (const item of updates) {
    const res = await prisma.product.updateMany({
      where: { name: item.name },
      data: {
        description: item.description,
        skinTags: item.skinTags,
      },
    });
    updated += res.count;
  }
  console.log(`Updated ${updated} product descriptions in database.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
