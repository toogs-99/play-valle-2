import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

// Qualquer papel com acesso à marca pode listar as atas.
const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;

// Só quem gerencia atas (ou admin) pode criar uma nova.
const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

export async function GET(request: Request) {
  const marcaId = new URL(request.url).searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const atas = await prisma.ata.findMany({
    where: { marcaId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ marcaId, papel: check.papel, atas });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const marcaId = body?.marcaId;

  if (typeof marcaId !== "string") {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const { orgao, numero, descricao, valorAta } = body ?? {};
  if (typeof orgao !== "string" || typeof numero !== "string") {
    return NextResponse.json(
      { error: "orgao e numero são obrigatórios." },
      { status: 400 }
    );
  }

  if (valorAta !== undefined && (typeof valorAta !== "number" || valorAta < 0)) {
    return NextResponse.json(
      { error: "valorAta deve ser um número maior ou igual a zero." },
      { status: 400 }
    );
  }

  const ata = await prisma.ata.create({
    data: {
      marcaId,
      orgao,
      numero,
      descricao: descricao ?? null,
      valorAta: valorAta ?? 0,
    },
  });

  return NextResponse.json({ ata }, { status: 201 });
}
