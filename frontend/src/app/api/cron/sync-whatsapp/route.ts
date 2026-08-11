import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sincronizarMetricasWhatsapp } from "@/lib/whatsapp-sync";

/**
 * Ponto de entrada para um cron externo, mesmo padrão de
 * POST /api/cron/sync-instagram — reusa o mesmo CRON_SECRET.
 * Autenticação: header `Authorization: Bearer <CRON_SECRET>`.
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado no servidor." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const integracoesAtivas = await prisma.integracaoWhatsapp.findMany({
    where: {
      ativo: true,
      wabaId: { not: null },
      phoneNumberId: { not: null },
      accessTokenCriptografado: { not: null },
    },
    select: { marcaId: true },
  });

  const resultados = await Promise.all(
    integracoesAtivas.map(async ({ marcaId }) => {
      const resultado = await sincronizarMetricasWhatsapp(marcaId);
      return { marcaId, ok: resultado.ok, error: resultado.error };
    })
  );

  return NextResponse.json({
    totalProcessado: resultados.length,
    sucesso: resultados.filter((r) => r.ok).length,
    falhas: resultados.filter((r) => !r.ok),
  });
}
