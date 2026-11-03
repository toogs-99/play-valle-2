import "dotenv/config";
import { PrismaClient, TipoEmpenho } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Dados 100% fictícios, só para o cliente avaliar o painel de contratos e
// empenhos. Todo registro usa o prefixo "DEMO" no número, o que permite achá-lo
// e removê-lo depois. Idempotente: pode ser rodado várias vezes.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface EmpenhoDemo {
  tipo: TipoEmpenho;
  numero: string;
  valor: number;
  emitidoEm: string;
}

interface ContratoDemo {
  numero: string;
  representante: string;
  cidade: string;
  valorSolicitado: number;
  valorContratado: number;
  assinadoEm: string;
  empenhos: EmpenhoDemo[];
}

interface AtaDemo {
  numero: string;
  orgao: string;
  descricao: string;
  valorAta: number;
  contratos: ContratoDemo[];
}

const DEMO: Record<string, AtaDemo[]> = {
  "Play Valle": [
    {
      numero: "DEMO-001/2026",
      orgao: "Prefeitura Municipal de Exemplópolis",
      descricao: "[DEMO] Playgrounds e brinquedos de parque",
      valorAta: 1_500_000,
      contratos: [
        {
          numero: "DEMO-CT-001/2026",
          representante: "Recreio Modelo Ltda (demo)",
          cidade: "Campinas",
          valorSolicitado: 100_000,
          valorContratado: 70_000,
          assinadoEm: "2026-08-12",
          empenhos: [
            { tipo: "nota_empenho", numero: "DEMO-NE-0101", valor: 40_000, emitidoEm: "2026-08-20" },
            { tipo: "ordem_compra", numero: "DEMO-OC-0101", valor: 30_000, emitidoEm: "2026-09-02" },
          ],
        },
        {
          numero: "DEMO-CT-002/2026",
          representante: "Parquinhos Fictícios ME (demo)",
          cidade: "Sorocaba",
          valorSolicitado: 250_000,
          valorContratado: 180_000,
          assinadoEm: "2026-09-05",
          empenhos: [{ tipo: "nota_empenho", numero: "DEMO-NE-0102", valor: 180_000, emitidoEm: "2026-09-15" }],
        },
        {
          numero: "DEMO-CT-003/2026",
          representante: "Diversão Exemplo EPP (demo)",
          cidade: "Ribeirão Preto",
          valorSolicitado: 400_000,
          valorContratado: 320_000,
          assinadoEm: "2026-10-01",
          empenhos: [],
        },
      ],
    },
    {
      numero: "DEMO-002/2026",
      orgao: "Secretaria de Educação de Modelolândia",
      descricao: "[DEMO] Mobiliário lúdico para escolas",
      valorAta: 800_000,
      contratos: [
        {
          numero: "DEMO-CT-004/2026",
          representante: "Escola Viva Comércio (demo)",
          cidade: "Santos",
          valorSolicitado: 150_000,
          valorContratado: 120_000,
          assinadoEm: "2026-09-20",
          empenhos: [{ tipo: "ordem_compra", numero: "DEMO-OC-0201", valor: 60_000, emitidoEm: "2026-10-05" }],
        },
      ],
    },
  ],
  "Esporte Valle": [
    {
      numero: "DEMO-003/2026",
      orgao: "Secretaria de Esportes de Testelândia",
      descricao: "[DEMO] Equipamentos para quadras e academias ao ar livre",
      valorAta: 1_000_000,
      contratos: [
        {
          numero: "DEMO-CT-005/2026",
          representante: "Quadra Certa Esportes (demo)",
          cidade: "Bauru",
          valorSolicitado: 300_000,
          valorContratado: 210_000,
          assinadoEm: "2026-08-28",
          empenhos: [
            { tipo: "nota_empenho", numero: "DEMO-NE-0301", valor: 210_000, emitidoEm: "2026-09-10" },
          ],
        },
      ],
    },
  ],
};

async function main() {
  for (const [nomeMarca, atas] of Object.entries(DEMO)) {
    const marca = await prisma.marca.findUnique({ where: { nome: nomeMarca } });
    if (!marca) {
      console.warn(`Marca "${nomeMarca}" não encontrada — rode "npm run prisma:seed" antes.`);
      continue;
    }

    for (const ataDemo of atas) {
      const ataExistente = await prisma.ata.findFirst({
        where: { marcaId: marca.id, numero: ataDemo.numero },
      });
      const ata =
        ataExistente ??
        (await prisma.ata.create({
          data: {
            marcaId: marca.id,
            numero: ataDemo.numero,
            orgao: ataDemo.orgao,
            descricao: ataDemo.descricao,
            valorAta: ataDemo.valorAta,
          },
        }));

      for (const ct of ataDemo.contratos) {
        let representante = await prisma.representante.findFirst({
          where: { marcaId: marca.id, ataId: ata.id, nome: ct.representante },
        });
        if (!representante) {
          representante = await prisma.representante.create({
            data: {
              marcaId: marca.id,
              ataId: ata.id,
              nome: ct.representante,
              cidade: ct.cidade,
              status: "active",
              waitingDeadline: new Date(ct.assinadoEm),
            },
          });
        }

        const contrato = await prisma.contrato.upsert({
          where: { marcaId_numero: { marcaId: marca.id, numero: ct.numero } },
          update: {},
          create: {
            marcaId: marca.id,
            ataId: ata.id,
            representanteId: representante.id,
            numero: ct.numero,
            valorSolicitado: ct.valorSolicitado,
            valorContratado: ct.valorContratado,
            assinadoEm: new Date(ct.assinadoEm),
          },
        });

        for (const emp of ct.empenhos) {
          await prisma.empenho.upsert({
            where: { contratoId_numero: { contratoId: contrato.id, numero: emp.numero } },
            update: {},
            create: {
              contratoId: contrato.id,
              tipo: emp.tipo,
              numero: emp.numero,
              valor: emp.valor,
              emitidoEm: new Date(emp.emitidoEm),
            },
          });
        }
      }
    }
    console.log(`Dados de demonstração carregados para "${nomeMarca}".`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
