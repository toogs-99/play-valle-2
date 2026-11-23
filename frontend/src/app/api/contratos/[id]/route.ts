import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

// Excluir devolve os itens ao saldo da ata (os ItemContrato caem em cascata).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: { ata: { select: { marcaId: true } } },
  });
  if (!contrato) {
    return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
  }

  const check = await requireRole(contrato.ata.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  await prisma.contrato.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
