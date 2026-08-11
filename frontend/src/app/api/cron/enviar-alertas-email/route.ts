import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateConfiguracao } from "@/lib/configuracao";
import { calcularAlertas, montarCorpoAlertas } from "@/lib/alertas";
import { enviarEmail } from "@/lib/email-sender";

/**
 * Ponto de entrada para um cron externo, mesmo padrão de
 * POST /api/cron/sync-instagram e /api/cron/sync-whatsapp — reusa o mesmo
 * CRON_SECRET. Autenticação: header `Authorization: Bearer <CRON_SECRET>`.
 *
 * Configuracao.alertasEmailAtivo/alertasEmailDestinatarios é GLOBAL (Fase 3),
 * mas os alertas em si são calculados por marca — este job itera todas as
 * marcas, calcula os alertas de cada uma, e (se houver algo a alertar) envia
 * um e-mail por marca para cada destinatário configurado, usando a
 * IntegracaoEmail (SMTP) daquela marca especificamente.
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

  const configuracao = await getOrCreateConfiguracao();

  if (!configuracao.alertasEmailAtivo) {
    return NextResponse.json({ skipped: true, reason: "alertasEmailAtivo está desligado em Configurações." });
  }

  if (configuracao.alertasEmailDestinatarios.length === 0) {
    return NextResponse.json({ skipped: true, reason: "Nenhum destinatário configurado em Configurações." });
  }

  const marcas = await prisma.marca.findMany({ select: { id: true, nome: true } });

  const resultados: { marcaId: string; destinatario: string; ok: boolean; error?: string }[] = [];

  for (const marca of marcas) {
    const alertas = await calcularAlertas(marca.id);
    const totalAlertas = alertas.prazosVencidos.length + alertas.aguardandoOficio.length;
    if (totalAlertas === 0) continue;

    const assunto = `[LicitFlow] ${totalAlertas} alerta(s) de prazo — ${marca.nome}`;
    const corpo = montarCorpoAlertas(marca.nome, alertas);

    for (const destinatario of configuracao.alertasEmailDestinatarios) {
      const resultado = await enviarEmail(marca.id, {
        destinatario,
        assunto,
        corpo,
        contexto: alertas.prazosVencidos.length > 0 ? "alerta_prazo" : "alerta_oficio",
      });
      resultados.push({ marcaId: marca.id, destinatario, ok: resultado.ok, error: resultado.error });
    }
  }

  return NextResponse.json({
    totalEnviados: resultados.filter((r) => r.ok).length,
    totalFalhas: resultados.filter((r) => !r.ok).length,
    resultados,
  });
}
