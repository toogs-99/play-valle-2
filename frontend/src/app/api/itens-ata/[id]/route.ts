import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

async function carregarItem(id: string) {
  return prisma.itemAta.findUnique({
    where: { id },
    include: { ata: { select: { marcaId: true } }, _count: { select: { itensContrato: true, itensOficio: true } } },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await carregarItem(id);
  if (!item) {
    return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  }

  const check = await requireRole(item.ata.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const body = await request.json().catch(() => null);
  const { descricao, unidade, valorUnitario, quantidade } = body ?? {};

  if (descricao !== undefined && (typeof descricao !== "string" || !descricao.trim())) {
    return NextResponse.json({ error: "descricao inválida." }, { status: 400 });
  }
  if (unidade !== undefined && typeof unidade !== "string") {
    return NextResponse.json({ error: "unidade deve ser uma string." }, { status: 400 });
  }
  if (valorUnitario !== undefined && (typeof valorUnitario !== "number" || !(valorUnitario >= 0))) {
    return NextResponse.json({ error: "valorUnitario inválido." }, { status: 400 });
  }
  if (quantidade !== undefined && (!Number.isInteger(quantidade) || quantidade < 1)) {
    return NextResponse.json({ error: "quantidade deve ser um inteiro maior que zero." }, { status: 400 });
  }

  const atualizado = await prisma.itemAta.update({
    where: { id },
    data: {
      ...(descricao !== undefined && { descricao: descricao.trim() }),
      ...(unidade !== undefined && { unidade: unidade.trim() || "un" }),
      ...(valorUnitario !== undefined && { valorUnitario }),
      ...(quantidade !== undefined && { quantidade }),
    },
  });

  return NextResponse.json({ item: atualizado });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await carregarItem(id);
  if (!item) {
    return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  }

  const check = await requireRole(item.ata.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  if (item._count.itensContrato > 0 || item._count.itensOficio > 0) {
    return NextResponse.json(
      { error: "Item já usado em contratos/empenhos/ofícios e não pode ser removido." },
      { status: 409 }
    );
  }

  await prisma.itemAta.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
