import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import { getOrCreateConfiguracao } from "@/lib/configuracao";
import type { Prisma, StatusRepresentante } from "@prisma/client";

// Qualquer papel com acesso à marca pode listar representantes.
const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;

// Só quem gerencia atas (ou admin) pode cadastrar um novo representante.
const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

const STATUS_VALIDOS: StatusRepresentante[] = [
  "waiting_letter",
  "active",
  "waitlist",
  "expired",
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const marcaId = url.searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const ataId = url.searchParams.get("ataId");
  const cidade = url.searchParams.get("cidade");
  const status = url.searchParams.get("status");

  if (status && !STATUS_VALIDOS.includes(status as StatusRepresentante)) {
    return NextResponse.json({ error: "status inválido." }, { status: 400 });
  }

  const where: Prisma.RepresentanteWhereInput = { marcaId };
  if (ataId) where.ataId = ataId;
  if (cidade) where.cidade = { contains: cidade, mode: "insensitive" };
  if (status) where.status = status as StatusRepresentante;

  const representantes = await prisma.representante.findMany({
    where,
    include: { ata: { select: { id: true, numero: true, orgao: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ marcaId, papel: check.papel, representantes });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const marcaId = body?.marcaId;

  if (typeof marcaId !== "string") {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const { ataId, nome, cidade } = body ?? {};

  if (typeof ataId !== "string" || typeof nome !== "string" || typeof cidade !== "string") {
    return NextResponse.json(
      { error: "ataId, nome e cidade são obrigatórios." },
      { status: 400 }
    );
  }

  if (!nome.trim() || !cidade.trim()) {
    return NextResponse.json(
      { error: "nome e cidade não podem ser vazios." },
      { status: 400 }
    );
  }

  const ata = await prisma.ata.findFirst({ where: { id: ataId, marcaId } });
  if (!ata) {
    return NextResponse.json(
      { error: "Ata não encontrada nesta marca." },
      { status: 404 }
    );
  }

  const configuracao = await getOrCreateConfiguracao();
  const waitingDays = Number.isFinite(body?.waitingDays)
    ? Number(body.waitingDays)
    : configuracao.prazoPadraoDias;

  // Representantes que já ocupam uma "vaga" nesta cidade+ata (não expirados).
  const naoExpirados = await prisma.representante.findMany({
    where: {
      ataId,
      marcaId,
      cidade: { equals: cidade.trim(), mode: "insensitive" },
      status: { not: "expired" },
    },
  });

  if (
    configuracao.limiteRepresentantesPorRegiao !== null &&
    naoExpirados.length >= configuracao.limiteRepresentantesPorRegiao
  ) {
    return NextResponse.json(
      {
        error: `Limite de ${configuracao.limiteRepresentantesPorRegiao} representante(s) por cidade nesta ata já foi atingido para "${cidade.trim()}".`,
      },
      { status: 422 }
    );
  }

  // Regra de duplicidade: já existe outro representante não-expirado na mesma
  // cidade+ata? Se sim, o novo nasce em fila de espera ("waitlist").
  const duplicado = naoExpirados[0] ?? null;

  const waitingDeadline = new Date();
  waitingDeadline.setDate(waitingDeadline.getDate() + waitingDays);

  const representante = await prisma.representante.create({
    data: {
      marcaId,
      ataId,
      nome: nome.trim(),
      cidade: cidade.trim(),
      status: duplicado ? "waitlist" : "waiting_letter",
      waitingDeadline,
    },
    include: { ata: { select: { id: true, numero: true, orgao: true } } },
  });

  return NextResponse.json(
    { representante, duplicado: duplicado ? { id: duplicado.id, nome: duplicado.nome } : null },
    { status: 201 }
  );
}
