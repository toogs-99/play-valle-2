import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import type { StatusVenda } from "@prisma/client";

const PAPEIS_ESCRITA = ["admin", "financeiro"] as const;

const STATUS_VALIDOS: StatusVenda[] = ["pendente", "pago", "cancelado"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const venda = await prisma.venda.findUnique({ where: { id } });
  if (!venda) {
    return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });
  }

  const check = await requireRole(venda.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (typeof status !== "string" || !STATUS_VALIDOS.includes(status as StatusVenda)) {
    return NextResponse.json(
      { error: `status é obrigatório e deve ser um de: ${STATUS_VALIDOS.join(", ")}.` },
      { status: 400 }
    );
  }

  const vendaAtualizada = await prisma.venda.update({
    where: { id },
    data: {
      status: status as StatusVenda,
      pagaEm: status === "pago" ? new Date() : null,
    },
  });

  return NextResponse.json({ venda: vendaAtualizada });
}
