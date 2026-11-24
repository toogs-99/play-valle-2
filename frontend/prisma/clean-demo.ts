import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Remove tudo que o seed-demo criou (atas com número "DEMO-..." e o que depende
// delas). A ordem importa: itens de contrato referenciam itens da ata com
// RESTRICT, então saem antes das atas.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const atas = await prisma.ata.findMany({ where: { numero: { startsWith: "DEMO-" } }, select: { id: true } });
  const ataIds = atas.map((a) => a.id);
  if (ataIds.length === 0) {
    console.log("Nenhum dado de demonstração encontrado.");
    return;
  }

  await prisma.$transaction([
    prisma.venda.deleteMany({ where: { ataId: { in: ataIds } } }),
    // itens de ofício também referenciam itens da ata com RESTRICT
    prisma.oficio.deleteMany({ where: { representante: { ataId: { in: ataIds } } } }),
    prisma.itemContrato.deleteMany({ where: { contrato: { ataId: { in: ataIds } } } }),
    prisma.contrato.deleteMany({ where: { ataId: { in: ataIds } } }), // empenhos caem em cascata
    prisma.ata.deleteMany({ where: { id: { in: ataIds } } }), // itens, representantes, ofícios em cascata
  ]);
  await prisma.usuario.deleteMany({ where: { email: "demo-vendedor@localhost.test" } });
  console.log(`${ataIds.length} ata(s) de demonstração removida(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
