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
    where: { email: "Admin Grupo valle" },
    update: {
      nome: "Admin Grupo valle",
      senhaHash: hashPassword("Grupovalle1234#"),
    },
    create: {
      nome: "Admin Grupo valle",
      email: "Admin Grupo valle",
      senhaHash: hashPassword("Grupovalle1234#"),
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

  const outrosUsuarios = [
    {
      nome: "André Simões Júnior",
      email: "andre_pms2011@hotmail.com",
      senha: "bTouA2Hhu9qFAa1!",
    },
    {
      nome: "Bianca",
      email: "biancagoncalves20@outlook.com",
      senha: "Asdw2026@",
    },
  ];

  for (const u of outrosUsuarios) {
    const user = await prisma.usuario.upsert({
      where: { email: u.email },
      update: {
        nome: u.nome,
        senhaHash: hashPassword(u.senha),
      },
      create: {
        nome: u.nome,
        email: u.email,
        senhaHash: hashPassword(u.senha),
      },
    });

    for (const marca of [esporteValle, playValle]) {
      await prisma.usuarioMarca.upsert({
        where: { usuarioId_marcaId: { usuarioId: user.id, marcaId: marca.id } },
        update: { papel: "admin" },
        create: { usuarioId: user.id, marcaId: marca.id, papel: "admin" },
      });
    }
  }

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
