import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import type { Prisma, StatusVenda } from "@prisma/client";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro"] as const;

const STATUS_VALIDOS: StatusVenda[] = ["pendente", "pago", "cancelado"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const marcaId = url.searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const status = url.searchParams.get("status");
  const representanteId = url.searchParams.get("representanteId");
  const ataId = url.searchParams.get("ataId");

  if (status && !STATUS_VALIDOS.includes(status as StatusVenda)) {
    return NextResponse.json({ error: "status inválido." }, { status: 400 });
  }

  const where: Prisma.VendaWhereInput = { marcaId };
  if (status) where.status = status as StatusVenda;
  if (representanteId) where.representanteId = representanteId;
  if (ataId) where.ataId = ataId;

  const vendas = await prisma.venda.findMany({
    where,
    include: {
      representante: { select: { id: true, nome: true, cidade: true } },
      ata: { select: { id: true, numero: true, orgao: true } },
    },
    orderBy: { criadaEm: "desc" },
  });

  return NextResponse.json({ marcaId, papel: check.papel, vendas });
}
