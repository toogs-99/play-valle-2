import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;
const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

export async function GET(request: Request) {
  const marcaId = new URL(request.url).searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const avisos = await prisma.aviso.findMany({
    where: { marcaId, ativo: true },
    include: { criadoPor: { select: { id: true, nome: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ marcaId, avisos });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const marcaId = body?.marcaId;

  if (typeof marcaId !== "string") {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const { titulo, mensagem } = body ?? {};

  if (typeof titulo !== "string" || !titulo.trim() || typeof mensagem !== "string" || !mensagem.trim()) {
    return NextResponse.json({ error: "titulo e mensagem são obrigatórios." }, { status: 400 });
  }

  const aviso = await prisma.aviso.create({
    data: {
      marcaId,
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      criadoPorId: check.usuarioId,
    },
    include: { criadoPor: { select: { id: true, nome: true } } },
  });

  return NextResponse.json({ aviso }, { status: 201 });
}
