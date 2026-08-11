import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

export interface EnviarEmailParams {
  destinatario: string;
  assunto: string;
  corpo: string;
  contexto?: string;
}

export interface EnvioResult {
  ok: boolean;
  error?: string;
}

/**
 * Envia um e-mail real via SMTP usando a IntegracaoEmail configurada para a
 * marca. Sempre registra o resultado (sucesso ou falha) em EmailEnviado, e
 * nunca lança exceção para o chamador — sempre retorna { ok, error }.
 */
export async function enviarEmail(marcaId: string, params: EnviarEmailParams): Promise<EnvioResult> {
  const { destinatario, assunto, corpo, contexto } = params;

  const integracao = await prisma.integracaoEmail.findUnique({ where: { marcaId } });

  if (
    !integracao ||
    !integracao.ativo ||
    !integracao.smtpHost ||
    !integracao.smtpPort ||
    !integracao.smtpUsuario ||
    !integracao.smtpSenhaCriptografada ||
    !integracao.emailRemetente
  ) {
    const erro = "Integração de e-mail não configurada ou inativa para esta marca.";
    // Sem integração, não há onde registrar o log de forma consistente com uma
    // marca válida (a própria tabela exige marcaId) — mas se a marca existir,
    // ainda vale registrar a tentativa falha para visibilidade no histórico.
    await prisma.emailEnviado
      .create({
        data: { marcaId, destinatario, assunto, corpo, status: "falhou", erro, contexto },
      })
      .catch(() => {});
    return { ok: false, error: erro };
  }

  let senha: string;
  try {
    senha = decrypt(integracao.smtpSenhaCriptografada);
  } catch {
    const erro = "Falha ao descriptografar a senha SMTP salva. Reconfigure a integração.";
    await prisma.integracaoEmail.update({ where: { marcaId }, data: { ultimoErro: erro } });
    await prisma.emailEnviado.create({
      data: { marcaId, destinatario, assunto, corpo, status: "falhou", erro, contexto },
    });
    return { ok: false, error: erro };
  }

  try {
    const transporte = nodemailer.createTransport({
      host: integracao.smtpHost,
      port: integracao.smtpPort,
      secure: integracao.smtpSeguro,
      auth: { user: integracao.smtpUsuario, pass: senha },
    });

    const remetente = integracao.nomeRemetente
      ? `"${integracao.nomeRemetente}" <${integracao.emailRemetente}>`
      : integracao.emailRemetente;

    await transporte.sendMail({
      from: remetente,
      to: destinatario,
      subject: assunto,
      text: corpo,
    });

    await prisma.integracaoEmail.update({
      where: { marcaId },
      data: { ultimaSincronizacao: new Date(), ultimoErro: null },
    });
    await prisma.emailEnviado.create({
      data: { marcaId, destinatario, assunto, corpo, status: "enviado", contexto },
    });

    return { ok: true };
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido ao enviar e-mail via SMTP.";
    await prisma.integracaoEmail
      .update({ where: { marcaId }, data: { ultimoErro: mensagem } })
      .catch(() => {});
    await prisma.emailEnviado
      .create({
        data: { marcaId, destinatario, assunto, corpo, status: "falhou", erro: mensagem, contexto },
      })
      .catch(() => {});
    return { ok: false, error: mensagem };
  }
}
