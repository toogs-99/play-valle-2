import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import type { TipoEmpenho } from "@prisma/client";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;
const TIPOS: TipoEmpenho[] = ["nota_empenho", "ordem_compra"];

// Lança uma nota de empenho / ordem de compra contra um contrato. A soma dos
// empenhos não pode passar do valor contratado.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    select: { marcaId: true, valorContratado: true },
  });
  if (!contrato) {
    return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
  }

  const check = await requireRole(contrato.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const body = await request.json().catch(() => null);
  const { tipo, numero, valor, emitidoEm } = body ?? {};

  if (!TIPOS.includes(tipo)) {
    return NextResponse.json({ error: "tipo deve ser 'nota_empenho' ou 'ordem_compra'." }, { status: 400 });
  }
  if (typeof numero !== "string" || !numero.trim()) {
    return NextResponse.json({ error: "numero é obrigatório." }, { status: 400 });
  }
  if (typeof valor !== "number" || !(valor > 0)) {
    return NextResponse.json({ error: "valor deve ser maior que zero." }, { status: 400 });
  }
  const data = emitidoEm ? new Date(emitidoEm) : new Date();
  if (Number.isNaN(data.getTime())) {
    return NextResponse.json({ error: "emitidoEm inválido." }, { status: 400 });
  }

  const empenhado = await prisma.empenho.aggregate({ where: { contratoId: id }, _sum: { valor: true } });
  const saldo = Number(contrato.valorContratado) - Number(empenhado._sum.valor ?? 0);
  if (valor > saldo + 0.001) {
    return NextResponse.json(
      { error: `Valor acima do saldo do contrato (disponível: ${saldo.toFixed(2)}).` },
      { status: 422 }
    );
  }

  const duplicado = await prisma.empenho.findUnique({
    where: { contratoId_numero: { contratoId: id, numero: numero.trim() } },
    select: { id: true },
  });
  if (duplicado) {
    return NextResponse.json({ error: "Já existe um empenho com esse número neste contrato." }, { status: 409 });
  }

  const empenho = await prisma.empenho.create({
    data: { contratoId: id, tipo, numero: numero.trim(), valor, emitidoEm: data },
  });
  return NextResponse.json({ empenho }, { status: 201 });
}
