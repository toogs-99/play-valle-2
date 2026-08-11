import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;
const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ata = await prisma.ata.findUnique({ where: { id } });
  if (!ata) {
    return NextResponse.json({ error: "Ata não encontrada." }, { status: 404 });
  }

  const check = await requireRole(ata.marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  return NextResponse.json({ ata });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ataAtual = await prisma.ata.findUnique({ where: { id } });
  if (!ataAtual) {
    return NextResponse.json({ error: "Ata não encontrada." }, { status: 404 });
  }

  const check = await requireRole(ataAtual.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const body = await request.json().catch(() => null);
  const { orgao, numero, descricao, valorAta } = body ?? {};

  if (orgao !== undefined && typeof orgao !== "string") {
    return NextResponse.json({ error: "orgao deve ser uma string." }, { status: 400 });
  }
  if (numero !== undefined && typeof numero !== "string") {
    return NextResponse.json({ error: "numero deve ser uma string." }, { status: 400 });
  }
  if (descricao !== undefined && descricao !== null && typeof descricao !== "string") {
    return NextResponse.json({ error: "descricao deve ser uma string ou nula." }, { status: 400 });
  }
  if (valorAta !== undefined && (typeof valorAta !== "number" || valorAta < 0)) {
    return NextResponse.json(
      { error: "valorAta deve ser um número maior ou igual a zero." },
      { status: 400 }
    );
  }

  const ata = await prisma.ata.update({
    where: { id },
    data: {
      ...(orgao !== undefined && { orgao }),
      ...(numero !== undefined && { numero }),
      ...(descricao !== undefined && { descricao }),
      ...(valorAta !== undefined && { valorAta }),
    },
  });

  return NextResponse.json({ ata });
}
