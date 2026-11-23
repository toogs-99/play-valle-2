import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import { calcularSaldoItens } from "@/lib/saldo-ata";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;
const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

// Lista os produtos da ata já com o saldo (registrado - contratado).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ata = await prisma.ata.findUnique({ where: { id }, select: { marcaId: true } });
  if (!ata) {
    return NextResponse.json({ error: "Ata não encontrada." }, { status: 404 });
  }

  const check = await requireRole(ata.marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  return NextResponse.json({ itens: await calcularSaldoItens(id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ata = await prisma.ata.findUnique({ where: { id }, select: { marcaId: true } });
  if (!ata) {
    return NextResponse.json({ error: "Ata não encontrada." }, { status: 404 });
  }

  const check = await requireRole(ata.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const body = await request.json().catch(() => null);
  const { descricao, unidade, valorUnitario, quantidade } = body ?? {};

  if (typeof descricao !== "string" || !descricao.trim()) {
    return NextResponse.json({ error: "descricao é obrigatória." }, { status: 400 });
  }
  if (typeof valorUnitario !== "number" || !(valorUnitario >= 0)) {
    return NextResponse.json({ error: "valorUnitario deve ser um número maior ou igual a zero." }, { status: 400 });
  }
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    return NextResponse.json({ error: "quantidade deve ser um inteiro maior que zero." }, { status: 400 });
  }
  if (unidade !== undefined && typeof unidade !== "string") {
    return NextResponse.json({ error: "unidade deve ser uma string." }, { status: 400 });
  }

  const item = await prisma.itemAta.create({
    data: {
      ataId: id,
      descricao: descricao.trim(),
      unidade: unidade?.trim() || "un",
      valorUnitario,
      quantidade,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
