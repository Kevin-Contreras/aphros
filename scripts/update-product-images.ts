import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseUrl } from "../src/lib/database-url";

const connectionString = getDatabaseUrl();
if (!connectionString) throw new Error("Missing database URL");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const images: Record<string, string> = {
  "Serum Facial de Vitamina C": "/products/serum-vitamina-c.svg",
  "Crema Facial Hamamelis": "/products/crema-hamamelis.svg",
  "Jabón Facial Antiacné": "/products/jabon-antiacne.svg",
  "Crema Facial Anti Acné": "/products/crema-antiacne.svg",
  "Crema Hidratante para Manos Coco": "/products/crema-manos-coco.svg",
  "Bálsamo Labial de Fresa": "/products/balsamo-fresa.svg",
  "Crema Facial Macadamia": "/products/crema-macadamia.svg",
  "Crema Facial con Filtro Solar SPF 45": "/products/crema-spf45.svg",
  "Exfoliante Labial Semilla de Fresa": "/products/exfoliante-labial.svg",
  "Agua Micelar Artesanal": "/products/agua-micelar.svg",
  "Jabón Facial de Miel y Avena": "/products/jabon-miel-avena.svg",
  "Agua de Rosas Artesanal": "/products/agua-rosas.svg",
  "Combo Rosas": "/products/combo-rosas.svg",
  "Crema Exfoliante para Pies Menta Piperita y Luffa":
    "/products/exfoliante-pies-luffa.svg",
  "Protege y Aclara": "/products/protege-aclara.svg",
  "Combo Anti Acné": "/products/combo-antiacne.svg",
  "Kit Mascarilla de Miel": "/products/kit-mascarilla-miel.svg",
  "Crema Facial Aclarante": "/products/crema-aclarante.svg",
  "Combo Hidratante de Manos": "/products/combo-manos.svg",
  "Crema Facial Humectante": "/products/crema-humectante.svg",
  "Crema Facial Exfoliante Rosa de Castilla":
    "/products/crema-exfoliante-rosa.svg",
  "Crema Exfoliante para Pies Menta y Arroz":
    "/products/exfoliante-pies-arroz.svg",
  "Desodorante Natural de Alumbre de Potasio":
    "/products/desodorante-alumbre.svg",
};

async function main() {
  let updated = 0;
  for (const [name, imageUrl] of Object.entries(images)) {
    const result = await prisma.product.updateMany({
      where: { name },
      data: { imageUrl },
    });
    updated += result.count;
    console.log(`${name}: ${result.count}`);
  }
  console.log(`Updated ${updated} products`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
