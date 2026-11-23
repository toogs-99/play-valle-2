import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import { Prisma } from "@prisma/client";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro"] as const;
const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const marcaId = url.searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const ataId = url.searchParams.get("ataId");
  const where: Prisma.ContratoWhereInput = { marcaId };
  if (ataId) where.ataId = ataId;

  const contratos = await prisma.contrato.findMany({
    where,
    include: {
      ata: { select: { id: true, numero: true, orgao: true } },
      itens: { include: { itemAta: { select: { descricao: true, unidade: true } } } },
      empenhos: { orderBy: { emitidoEm: "desc" } },
    },
    orderBy: { assinadoEm: "desc" },
  });

  return NextResponse.json({
    marcaId,
    papel: check.papel,
    contratos: contratos.map((c) => ({
      ...c,
      valorEmpenhado: c.empenhos.reduce((acc, e) => acc + Number(e.valor), 0),
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { ataId, numero, municipio, data, observacao, itens, representanteId, valorSolicitado } = body ?? {};

  if (typeof ataId !== "string") {
    return NextResponse.json({ error: "ataId é obrigatório." }, { status: 400 });
  }
  const ata = await prisma.ata.findUnique({ where: { id: ataId }, select: { marcaId: true } });
  if (!ata) {
    return NextResponse.json({ error: "Ata não encontrada." }, { status: 404 });
  }

  const check = await requireRole(ata.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  if (typeof numero !== "string" || !numero.trim() || typeof municipio !== "string" || !municipio.trim()) {
    return NextResponse.json({ error: "numero e municipio são obrigatórios." }, { status: 400 });
  }
  if (valorSolicitado !== undefined && (typeof valorSolicitado !== "number" || !(valorSolicitado >= 0))) {
    return NextResponse.json({ error: "valorSolicitado inválido." }, { status: 400 });
  }
  const dataContrato = new Date(data);
  if (typeof data !== "string" || Number.isNaN(dataContrato.getTime())) {
    return NextResponse.json({ error: "data inválida." }, { status: 400 });
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    return NextResponse.json({ error: "Informe ao menos um item." }, { status: 400 });
  }

  // Soma por produto (o mesmo produto pode ser repetido no payload).
  const pedido = new Map<string, number>();
  for (const i of itens) {
    if (typeof i?.itemAtaId !== "string" || !Number.isInteger(i?.quantidade) || i.quantidade < 1) {
      return NextResponse.json(
        { error: "Cada item precisa de itemAtaId e quantidade inteira maior que zero." },
        { status: 400 }
      );
    }
    pedido.set(i.itemAtaId, (pedido.get(i.itemAtaId) ?? 0) + i.quantidade);
  }

  try {
    const contrato = await prisma.$transaction(async (tx) => {
      const produtos = await tx.itemAta.findMany({
        where: { ataId, id: { in: [...pedido.keys()] } },
      });
      if (produtos.length !== pedido.size) {
        throw new ErroValidacao("Há itens que não pertencem a esta ata.");
      }

      const consumo = await tx.itemContrato.groupBy({
        by: ["itemAtaId"],
        where: { itemAtaId: { in: produtos.map((p) => p.id) } },
        _sum: { quantidade: true },
      });
      const jaContratado = new Map(consumo.map((c) => [c.itemAtaId, c._sum.quantidade ?? 0]));

      for (const p of produtos) {
        const saldo = p.quantidade - (jaContratado.get(p.id) ?? 0);
        const qtd = pedido.get(p.id)!;
        if (qtd > saldo) {
          throw new ErroValidacao(
            `Saldo insuficiente para "${p.descricao}": solicitado ${qtd}, saldo na ata ${saldo}.`
          );
        }
      }

      if (typeof representanteId === "string") {
        const rep = await tx.representante.findFirst({ where: { id: representanteId, ataId }, select: { id: true } });
        if (!rep) throw new ErroValidacao("Representante não pertence a esta ata.");
      }

      const valorContratado = produtos.reduce(
        (acc, p) => acc.add(p.valorUnitario.mul(pedido.get(p.id)!)),
        new Prisma.Decimal(0)
      );

      const duplicado = await tx.contrato.findUnique({
        where: { marcaId_numero: { marcaId: ata.marcaId, numero: numero.trim() } },
        select: { id: true },
      });
      if (duplicado) throw new ErroValidacao(`Já existe um contrato com o número ${numero.trim()}.`);

      return tx.contrato.create({
        data: {
          marcaId: ata.marcaId,
          ataId,
          representanteId: typeof representanteId === "string" ? representanteId : null,
          numero: numero.trim(),
          municipio: municipio.trim(),
          valorSolicitado: valorSolicitado ?? valorContratado,
          valorContratado,
          assinadoEm: dataContrato,
          observacao: typeof observacao === "string" && observacao.trim() ? observacao.trim() : null,
          itens: {
            create: produtos.map((p) => ({
              itemAtaId: p.id,
              quantidade: pedido.get(p.id)!,
              valorUnitario: p.valorUnitario,
            })),
          },
        },
        include: { itens: true },
      });
    });

    return NextResponse.json({ contrato }, { status: 201 });
  } catch (err) {
    if (err instanceof ErroValidacao) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    throw err;
  }
}

class ErroValidacao extends Error {}
