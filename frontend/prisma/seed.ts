import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const esporteValle = await prisma.marca.upsert({
    where: { nome: "Esporte Valle" },
    update: {},
    create: { nome: "Esporte Valle" },
  });

  const playValle = await prisma.marca.upsert({
    where: { nome: "Play Valle" },
    update: {},
    create: { nome: "Play Valle" },
  });

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@licitflow.com.br" },
    update: {},
    create: {
      nome: "Administrador LicitFlow",
      email: "admin@licitflow.com.br",
      senhaHash: hashPassword("admin123"),
    },
  });

  await prisma.usuarioMarca.upsert({
    where: { usuarioId_marcaId: { usuarioId: admin.id, marcaId: esporteValle.id } },
    update: { papel: "admin" },
    create: { usuarioId: admin.id, marcaId: esporteValle.id, papel: "admin" },
  });

  await prisma.usuarioMarca.upsert({
    where: { usuarioId_marcaId: { usuarioId: admin.id, marcaId: playValle.id } },
    update: { papel: "admin" },
    create: { usuarioId: admin.id, marcaId: playValle.id, papel: "admin" },
  });

  console.log("Seed concluído:");
  console.log({ esporteValle, playValle, admin: { id: admin.id, email: admin.email } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
