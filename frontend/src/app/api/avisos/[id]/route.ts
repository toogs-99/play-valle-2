import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

// "Excluir" um aviso apenas o desativa (soft delete) — mantém histórico.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const aviso = await prisma.aviso.findUnique({ where: { id } });
  if (!aviso) {
    return NextResponse.json({ error: "Aviso não encontrado." }, { status: 404 });
  }

  const check = await requireRole(aviso.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  await prisma.aviso.update({ where: { id }, data: { ativo: false } });

  return NextResponse.json({ ok: true });
}
