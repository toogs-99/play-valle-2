import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const empenho = await prisma.empenho.findUnique({
    where: { id },
    include: { contrato: { select: { marcaId: true } } },
  });
  if (!empenho) {
    return NextResponse.json({ error: "Empenho não encontrado." }, { status: 404 });
  }

  const check = await requireRole(empenho.contrato.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  await prisma.empenho.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
