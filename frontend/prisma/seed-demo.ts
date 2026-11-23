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

// Ata de demonstração com produtos: exercita o fluxo novo ponta a ponta
// (saldo por produto, contrato por itens, empenho e venda só do produto).
const PRODUTOS_DEMO = {
  ata: {
    numero: "DEMO-004/2026",
    orgao: "Prefeitura de Cidade Teste",
    descricao: "[DEMO] Ata com produtos para testar contratos, empenhos e vendas por produto",
    valorAta: 600_000,
  },
  itens: [
    { descricao: "[DEMO] Balanço duplo", unidade: "un", valorUnitario: 3_500, quantidade: 40 },
    { descricao: "[DEMO] Escorregador", unidade: "un", valorUnitario: 8_000, quantidade: 20 },
    { descricao: "[DEMO] Gangorra", unidade: "un", valorUnitario: 2_200, quantidade: 30 },
  ],
  // quantidades compradas pelo município no contrato
  contrato: {
    numero: "DEMO-CT-010/2026",
    cidade: "Cidade Teste",
    assinadoEm: "2026-11-10",
    compras: { "[DEMO] Balanço duplo": 10, "[DEMO] Escorregador": 5 } as Record<string, number>,
    empenho: { numero: "DEMO-NE-1001", valor: 50_000, emitidoEm: "2026-11-15" },
  },
  // Venda gerada por um ofício aprovado: vale só o produto vendido.
  venda: { produto: "[DEMO] Gangorra", quantidade: 4 },
};

async function seedProdutos(marcaId: string) {
  const { ata: ataDemo, itens, contrato: ct, venda } = PRODUTOS_DEMO;

  const ata =
    (await prisma.ata.findFirst({ where: { marcaId, numero: ataDemo.numero } })) ??
    (await prisma.ata.create({ data: { marcaId, ...ataDemo } }));

  const itemPorNome = new Map<string, { id: string; valorUnitario: unknown }>();
  for (const i of itens) {
    const item =
      (await prisma.itemAta.findFirst({ where: { ataId: ata.id, descricao: i.descricao } })) ??
      (await prisma.itemAta.create({ data: { ataId: ata.id, ...i } }));
    itemPorNome.set(i.descricao, item);
  }

  const representante =
    (await prisma.representante.findFirst({ where: { marcaId, ataId: ata.id, nome: "Representante Teste (demo)" } })) ??
    (await prisma.representante.create({
      data: {
        marcaId,
        ataId: ata.id,
        nome: "Representante Teste (demo)",
        cidade: ct.cidade,
        status: "active",
        waitingDeadline: new Date(ct.assinadoEm),
      },
    }));

  if (!(await prisma.contrato.findUnique({ where: { marcaId_numero: { marcaId, numero: ct.numero } } }))) {
    const linhas = Object.entries(ct.compras).map(([nome, quantidade]) => {
      const item = itens.find((i) => i.descricao === nome)!;
      return { itemAtaId: itemPorNome.get(nome)!.id, quantidade, valorUnitario: item.valorUnitario };
    });
    const total = linhas.reduce((acc, l) => acc + l.quantidade * l.valorUnitario, 0);
    const contrato = await prisma.contrato.create({
      data: {
        marcaId,
        ataId: ata.id,
        representanteId: representante.id,
        numero: ct.numero,
        municipio: ct.cidade,
        valorSolicitado: total,
        valorContratado: total,
        assinadoEm: new Date(ct.assinadoEm),
        itens: { create: linhas },
      },
    });
    await prisma.empenho.create({
      data: {
        contratoId: contrato.id,
        tipo: "nota_empenho",
        numero: ct.empenho.numero,
        valor: ct.empenho.valor,
        emitidoEm: new Date(ct.empenho.emitidoEm),
      },
    });
  }

  const jaTemVenda = await prisma.venda.findFirst({ where: { ataId: ata.id, representanteId: representante.id } });
  if (!jaTemVenda) {
    const item = itens.find((i) => i.descricao === venda.produto)!;
    const oficio = await prisma.oficio.create({
      data: {
        marcaId,
        representanteId: representante.id,
        status: "approved",
        arquivoNomeOriginal: "oficio_demo.pdf",
        arquivoMimeType: "application/pdf",
        arquivoBase64: Buffer.from("%PDF-1.4 demo").toString("base64"),
      },
    });
    await prisma.venda.create({
      data: {
        marcaId,
        representanteId: representante.id,
        ataId: ata.id,
        oficioId: oficio.id,
        itemAtaId: itemPorNome.get(venda.produto)!.id,
        quantidade: venda.quantidade,
        valor: item.valorUnitario * venda.quantidade,
        status: "pendente",
      },
    });
  }
}

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
    await seedProdutos(marca.id);
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
