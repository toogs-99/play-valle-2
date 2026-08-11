import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sincronizarMetricasInstagram } from "@/lib/instagram-sync";

/**
 * Ponto de entrada para um cron externo (ex: cron do provedor de hospedagem,
 * GitHub Actions scheduled workflow, etc.) — ainda não há worker/queue própria
 * no projeto, então a sincronização periódica é "empurrada" de fora chamando
 * este endpoint, por exemplo a cada 6h.
 *
 * Autenticação: header `Authorization: Bearer <CRON_SECRET>` (não usa sessão
 * de usuário, já que quem chama é um serviço externo sem cookie de login).
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

  const integracoesAtivas = await prisma.integracaoMeta.findMany({
    where: { ativo: true, instagramContaId: { not: null }, accessTokenCriptografado: { not: null } },
    select: { marcaId: true },
  });

  const resultados = await Promise.all(
    integracoesAtivas.map(async ({ marcaId }) => {
      const resultado = await sincronizarMetricasInstagram(marcaId);
      return { marcaId, ok: resultado.ok, error: resultado.error };
    })
  );

  return NextResponse.json({
    totalProcessado: resultados.length,
    sucesso: resultados.filter((r) => r.ok).length,
    falhas: resultados.filter((r) => !r.ok),
  });
}
