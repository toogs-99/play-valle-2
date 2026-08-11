import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authorize";
import { enviarEmail } from "@/lib/email-sender";

const PAPEIS_ESCRITA = ["admin"] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const marcaId = body?.marcaId;
  const destinatario = body?.destinatario;

  if (typeof marcaId !== "string") {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }
  if (typeof destinatario !== "string" || !destinatario.trim()) {
    return NextResponse.json({ error: "destinatario é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const resultado = await enviarEmail(marcaId, {
    destinatario: destinatario.trim(),
    assunto: "Teste de configuração SMTP — LicitFlow",
    corpo: "Este é um e-mail de teste enviado pelo LicitFlow para validar a configuração SMTP desta marca. Se você recebeu esta mensagem, a integração está funcionando corretamente.",
    contexto: "teste_configuracao",
  });

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
