import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import type { StatusTemplateWhatsapp } from "@prisma/client";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface GraphApiError {
  message: string;
  type?: string;
  code?: number;
}

interface ConversationAnalyticsPoint {
  conversation: number;
  start: number;
  end: number;
}

interface ConversationAnalyticsData {
  data_points?: ConversationAnalyticsPoint[];
}

interface ConversationAnalyticsResponse {
  conversation_analytics?: { data?: ConversationAnalyticsData[] };
  error?: GraphApiError;
}

interface MessageTemplateItem {
  id: string;
  name: string;
  status: string; // "APPROVED" | "PENDING" | "REJECTED" (Cloud API retorna em maiúsculas)
  category: string;
}

interface MessageTemplatesResponse {
  data?: MessageTemplateItem[];
  error?: GraphApiError;
}

export interface SincronizacaoResult {
  ok: boolean;
  error?: string;
  metrica?: Awaited<ReturnType<typeof prisma.whatsappMetrica.create>>;
}

function mensagemDeErroGraphApi(error: GraphApiError): string {
  if (error.code === 190) {
    return "Token de acesso expirado ou inválido. Gere um novo token de sistema e reconfigure a integração.";
  }
  return `Erro da WhatsApp Cloud API: ${error.message}`;
}

function mapStatusTemplate(statusGraphApi: string): StatusTemplateWhatsapp {
  switch (statusGraphApi.toUpperCase()) {
    case "APPROVED":
      return "aprovado";
    case "REJECTED":
      return "rejeitado";
    default:
      return "pendente";
  }
}

/**
 * Busca a integração da marca, chama a WhatsApp Business Cloud API (Conversation
 * Analytics + Message Templates) e salva um novo snapshot em WhatsappMetrica,
 * além de sincronizar a lista de WhatsappTemplate. Segue o mesmo contrato de
 * sincronizarMetricasInstagram: nunca lança exceção, sempre { ok, error }.
 *
 * Sem token real configurado, a chamada de rede falha (ou a API retorna erro)
 * de forma controlada — comportamento esperado até as credenciais existirem.
 *
 * NOTA sobre os campos: a Cloud API não expõe "mensagens enviadas/entregues/
 * lidas" agregadas via GET — esses status chegam por webhook em tempo real
 * conforme o app envia mensagens. O endpoint de Conversation Analytics (usado
 * aqui) dá a contagem de CONVERSAS por categoria, que é o que preenche
 * conversasIniciadas de forma real; os demais contadores ficam em 0 até o
 * projeto implementar o receptor de webhooks (fora do escopo desta fase).
 */
export async function sincronizarMetricasWhatsapp(marcaId: string): Promise<SincronizacaoResult> {
  const integracao = await prisma.integracaoWhatsapp.findUnique({ where: { marcaId } });

  if (!integracao || !integracao.accessTokenCriptografado || !integracao.wabaId || !integracao.phoneNumberId) {
    return { ok: false, error: "Integração do WhatsApp não configurada para esta marca." };
  }

  let accessToken: string;
  try {
    accessToken = decrypt(integracao.accessTokenCriptografado);
  } catch {
    const erro = "Falha ao descriptografar o token salvo. Reconfigure a integração.";
    await prisma.integracaoWhatsapp.update({ where: { marcaId }, data: { ultimoErro: erro } });
    return { ok: false, error: erro };
  }

  try {
    const agora = Math.floor(Date.now() / 1000);
    const seteDiasAtras = agora - 7 * 24 * 60 * 60;

    const analyticsFields = encodeURIComponent(
      `conversation_analytics.start(${seteDiasAtras}).end(${agora}).granularity(DAILY).phone_numbers([${integracao.phoneNumberId}])`
    );
    const analyticsUrl = `${GRAPH_API_BASE}/${integracao.wabaId}?fields=${analyticsFields}&access_token=${encodeURIComponent(accessToken)}`;
    const templatesUrl = `${GRAPH_API_BASE}/${integracao.wabaId}/message_templates?fields=name,status,category&access_token=${encodeURIComponent(accessToken)}`;

    const [analyticsRes, templatesRes] = await Promise.all([fetch(analyticsUrl), fetch(templatesUrl)]);
    const analyticsData: ConversationAnalyticsResponse = await analyticsRes.json();
    const templatesData: MessageTemplatesResponse = await templatesRes.json();

    const apiError = analyticsData.error ?? templatesData.error;
    if (apiError) {
      const mensagem = mensagemDeErroGraphApi(apiError);
      await prisma.integracaoWhatsapp.update({ where: { marcaId }, data: { ultimoErro: mensagem } });
      return { ok: false, error: mensagem };
    }

    const pontos = analyticsData.conversation_analytics?.data?.[0]?.data_points ?? [];
    const conversasIniciadas = pontos.reduce((soma, p) => soma + (p.conversation ?? 0), 0);

    const metrica = await prisma.whatsappMetrica.create({
      data: {
        marcaId,
        conversasIniciadas,
        mensagensEnviadas: 0,
        mensagensEntregues: 0,
        mensagensLidas: 0,
      },
    });

    // Sincroniza templates: substitui a lista atual pela resposta mais recente da API.
    if (templatesData.data) {
      await prisma.$transaction([
        prisma.whatsappTemplate.deleteMany({ where: { marcaId } }),
        prisma.whatsappTemplate.createMany({
          data: templatesData.data.map((tpl) => ({
            marcaId,
            nome: tpl.name,
            status: mapStatusTemplate(tpl.status),
            categoria: tpl.category,
          })),
        }),
      ]);
    }

    await prisma.integracaoWhatsapp.update({
      where: { marcaId },
      data: { ultimaSincronizacao: new Date(), ultimoErro: null },
    });

    return { ok: true, metrica };
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido ao sincronizar com a WhatsApp Cloud API.";
    await prisma.integracaoWhatsapp
      .update({ where: { marcaId }, data: { ultimoErro: mensagem } })
      .catch(() => {});
    return { ok: false, error: mensagem };
  }
}
