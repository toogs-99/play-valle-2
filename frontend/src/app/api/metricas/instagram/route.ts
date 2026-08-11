import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import type { Prisma } from "@prisma/client";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const marcaId = url.searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const desde = url.searchParams.get("desde");
  const ate = url.searchParams.get("ate");

  const capturadoEm: Prisma.DateTimeFilter = {};
  if (desde) capturadoEm.gte = new Date(desde);
  if (ate) capturadoEm.lte = new Date(ate);

  const metricas = await prisma.instagramMetrica.findMany({
    where: {
      marcaId,
      ...(desde || ate ? { capturadoEm } : {}),
    },
    orderBy: { capturadoEm: "asc" },
  });

  return NextResponse.json({ marcaId, metricas });
}
