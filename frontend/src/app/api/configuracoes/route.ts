import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticated, requireGlobalAdmin } from "@/lib/authorize";
import { getOrCreateConfiguracao } from "@/lib/configuracao";

export async function GET() {
  const check = await requireAuthenticated();
  if (check.error) return check.error;

  const configuracao = await getOrCreateConfiguracao();
  return NextResponse.json({ configuracao });
}

export async function PUT(request: Request) {
  const check = await requireGlobalAdmin();
  if (check.error) return check.error;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { prazoPadraoDias, limiteRepresentantesPorRegiao, alertasEmailAtivo, alertasEmailDestinatarios } = body;

  if (prazoPadraoDias !== undefined && (!Number.isInteger(prazoPadraoDias) || prazoPadraoDias < 1)) {
    return NextResponse.json({ error: "prazoPadraoDias deve ser um inteiro positivo." }, { status: 400 });
  }

  if (
    limiteRepresentantesPorRegiao !== undefined &&
    limiteRepresentantesPorRegiao !== null &&
    (!Number.isInteger(limiteRepresentantesPorRegiao) || limiteRepresentantesPorRegiao < 1)
  ) {
    return NextResponse.json(
      { error: "limiteRepresentantesPorRegiao deve ser um inteiro positivo ou nulo (sem limite)." },
      { status: 400 }
    );
  }

  if (alertasEmailAtivo !== undefined && typeof alertasEmailAtivo !== "boolean") {
    return NextResponse.json({ error: "alertasEmailAtivo deve ser booleano." }, { status: 400 });
  }

  if (
    alertasEmailDestinatarios !== undefined &&
    (!Array.isArray(alertasEmailDestinatarios) || !alertasEmailDestinatarios.every((e) => typeof e === "string"))
  ) {
    return NextResponse.json(
      { error: "alertasEmailDestinatarios deve ser uma lista de e-mails (strings)." },
      { status: 400 }
    );
  }

  await getOrCreateConfiguracao();

  const configuracao = await prisma.configuracao.update({
    where: { id: "singleton" },
    data: {
      ...(prazoPadraoDias !== undefined && { prazoPadraoDias }),
      ...(limiteRepresentantesPorRegiao !== undefined && { limiteRepresentantesPorRegiao }),
      ...(alertasEmailAtivo !== undefined && { alertasEmailAtivo }),
      ...(alertasEmailDestinatarios !== undefined && {
        alertasEmailDestinatarios: alertasEmailDestinatarios.map((e: string) => e.trim()).filter(Boolean),
      }),
    },
  });

  return NextResponse.json({ configuracao });
}
