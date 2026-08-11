import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import type { Prisma, StatusEmailEnviado } from "@prisma/client";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro"] as const;

const STATUS_VALIDOS: StatusEmailEnviado[] = ["enviado", "falhou"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const marcaId = url.searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const status = url.searchParams.get("status");
  const desde = url.searchParams.get("desde");
  const ate = url.searchParams.get("ate");

  if (status && !STATUS_VALIDOS.includes(status as StatusEmailEnviado)) {
    return NextResponse.json({ error: "status inválido." }, { status: 400 });
  }

  const enviadoEm: Prisma.DateTimeFilter = {};
  if (desde) enviadoEm.gte = new Date(desde);
  if (ate) enviadoEm.lte = new Date(ate);

  const emails = await prisma.emailEnviado.findMany({
    where: {
      marcaId,
      ...(status ? { status: status as StatusEmailEnviado } : {}),
      ...(desde || ate ? { enviadoEm } : {}),
    },
    orderBy: { enviadoEm: "desc" },
    take: 200,
  });

  return NextResponse.json({ marcaId, papel: check.papel, emails });
}
