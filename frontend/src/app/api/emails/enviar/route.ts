import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authorize";
import { enviarEmail } from "@/lib/email-sender";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const marcaId = body?.marcaId;

  if (typeof marcaId !== "string") {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const { destinatario, assunto, corpo } = body ?? {};

  if (typeof destinatario !== "string" || !destinatario.trim()) {
    return NextResponse.json({ error: "destinatario é obrigatório." }, { status: 400 });
  }
  if (typeof assunto !== "string" || !assunto.trim()) {
    return NextResponse.json({ error: "assunto é obrigatório." }, { status: 400 });
  }
  if (typeof corpo !== "string" || !corpo.trim()) {
    return NextResponse.json({ error: "corpo é obrigatório." }, { status: 400 });
  }

  const resultado = await enviarEmail(marcaId, {
    destinatario: destinatario.trim(),
    assunto: assunto.trim(),
    corpo: corpo.trim(),
    contexto: "manual",
  });

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
