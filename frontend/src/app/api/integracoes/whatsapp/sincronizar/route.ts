import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authorize";
import { sincronizarMetricasWhatsapp } from "@/lib/whatsapp-sync";

// Só admin pode mexer em qualquer nível da integração (configurar ou sincronizar).
const PAPEIS_ESCRITA = ["admin"] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const marcaId = body?.marcaId;

  if (typeof marcaId !== "string") {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const resultado = await sincronizarMetricasWhatsapp(marcaId);

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 422 });
  }

  return NextResponse.json({ metrica: resultado.metrica });
}
