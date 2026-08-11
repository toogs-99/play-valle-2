import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface GraphApiError {
  message: string;
  type?: string;
  code?: number;
}

interface GraphInsightValue {
  value: number;
}

interface GraphInsightMetric {
  name: string;
  values: GraphInsightValue[];
}

interface GraphInsightsResponse {
  data?: GraphInsightMetric[];
  error?: GraphApiError;
}

interface GraphAccountResponse {
  followers_count?: number;
  error?: GraphApiError;
}

export interface SincronizacaoResult {
  ok: boolean;
  error?: string;
  metrica?: Awaited<ReturnType<typeof prisma.instagramMetrica.create>>;
}

function mensagemDeErroGraphApi(error: GraphApiError): string {
  // Código 190 = OAuthException (token expirado/inválido/revogado).
  if (error.code === 190) {
    return "Token de acesso expirado ou inválido. Gere um novo token de longa duração e reconfigure a integração.";
  }
  return `Erro da Instagram Graph API: ${error.message}`;
}

function getMetricValue(insights: GraphInsightMetric[] | undefined, nome: string): number {
  return insights?.find((m) => m.name === nome)?.values?.[0]?.value ?? 0;
}

/**
 * Busca a integração da marca, chama a Instagram Graph API (Insights) e salva
 * um novo snapshot em InstagramMetrica. Nunca lança exceção para o chamador —
 * sempre retorna { ok, error } e registra o erro em IntegracaoMeta.ultimoErro.
 *
 * Sem token real configurado, a chamada de rede falha (ou retorna erro da API)
 * de forma controlada — é o comportamento esperado até as credenciais existirem.
 */
export async function sincronizarMetricasInstagram(marcaId: string): Promise<SincronizacaoResult> {
  const integracao = await prisma.integracaoMeta.findUnique({ where: { marcaId } });

  if (!integracao || !integracao.accessTokenCriptografado || !integracao.instagramContaId) {
    return { ok: false, error: "Integração do Instagram não configurada para esta marca." };
  }

  let accessToken: string;
  try {
    accessToken = decrypt(integracao.accessTokenCriptografado);
  } catch {
    const erro = "Falha ao descriptografar o token salvo. Reconfigure a integração.";
    await prisma.integracaoMeta.update({ where: { marcaId }, data: { ultimoErro: erro } });
    return { ok: false, error: erro };
  }

  try {
    // Métricas de conta (nível de perfil) — reach/impressions via Insights,
    // followers_count via o endpoint do próprio objeto da conta.
    // NOTA: curtidas/comentários agregados exigiriam paginar mídias recentes
    // (/{ig-user-id}/media) e somar os insights por post — fora do escopo desta
    // primeira versão, ficam registrados como 0 até essa etapa ser implementada.
    const insightsUrl = `${GRAPH_API_BASE}/${integracao.instagramContaId}/insights?metric=reach,impressions&period=day&access_token=${encodeURIComponent(accessToken)}`;
    const contaUrl = `${GRAPH_API_BASE}/${integracao.instagramContaId}?fields=followers_count&access_token=${encodeURIComponent(accessToken)}`;

    const [insightsRes, contaRes] = await Promise.all([fetch(insightsUrl), fetch(contaUrl)]);
    const insightsData: GraphInsightsResponse = await insightsRes.json();
    const contaData: GraphAccountResponse = await contaRes.json();

    const apiError = insightsData.error ?? contaData.error;
    if (apiError) {
      const mensagem = mensagemDeErroGraphApi(apiError);
      await prisma.integracaoMeta.update({ where: { marcaId }, data: { ultimoErro: mensagem } });
      return { ok: false, error: mensagem };
    }

    const metrica = await prisma.instagramMetrica.create({
      data: {
        marcaId,
        seguidores: contaData.followers_count ?? 0,
        alcance: getMetricValue(insightsData.data, "reach"),
        impressoes: getMetricValue(insightsData.data, "impressions"),
        engajamento: 0,
        curtidas: 0,
        comentarios: 0,
      },
    });

    await prisma.integracaoMeta.update({
      where: { marcaId },
      data: { ultimaSincronizacao: new Date(), ultimoErro: null },
    });

    return { ok: true, metrica };
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido ao sincronizar com a Instagram Graph API.";
    await prisma.integracaoMeta
      .update({ where: { marcaId }, data: { ultimoErro: mensagem } })
      .catch(() => {});
    return { ok: false, error: mensagem };
  }
}
