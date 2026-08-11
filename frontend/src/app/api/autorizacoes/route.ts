import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const marcaId = url.searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const ataId = url.searchParams.get("ataId");

  const autorizacoes = await prisma.autorizacaoAdesao.findMany({
    where: {
      marcaId,
      ...(ataId ? { oficio: { representante: { ataId } } } : {}),
    },
    include: {
      oficio: {
        select: {
          id: true,
          representante: {
            select: { id: true, nome: true, cidade: true, ataId: true },
          },
        },
      },
    },
    orderBy: { dataEmissao: "desc" },
  });

  return NextResponse.json({ marcaId, papel: check.papel, autorizacoes });
}
