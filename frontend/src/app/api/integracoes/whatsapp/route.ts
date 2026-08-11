import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import { encrypt } from "@/lib/crypto";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro"] as const;
const PAPEIS_ESCRITA = ["admin"] as const;

// Nunca inclui accessTokenCriptografado na resposta.
function serializarIntegracao(integracao: {
  wabaId: string | null;
  phoneNumberId: string | null;
  ativo: boolean;
  ultimaSincronizacao: Date | null;
  ultimoErro: string | null;
  accessTokenCriptografado: string | null;
}) {
  return {
    configurada: Boolean(integracao.wabaId && integracao.phoneNumberId && integracao.accessTokenCriptografado),
    wabaId: integracao.wabaId,
    phoneNumberId: integracao.phoneNumberId,
    ativo: integracao.ativo,
    ultimaSincronizacao: integracao.ultimaSincronizacao,
    ultimoErro: integracao.ultimoErro,
  };
}

export async function GET(request: Request) {
  const marcaId = new URL(request.url).searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const integracao = await prisma.integracaoWhatsapp.findUnique({ where: { marcaId } });

  if (!integracao) {
    return NextResponse.json({
      integracao: {
        configurada: false,
        wabaId: null,
        phoneNumberId: null,
        ativo: false,
        ultimaSincronizacao: null,
        ultimoErro: null,
      },
    });
  }

  return NextResponse.json({ integracao: serializarIntegracao(integracao) });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const marcaId = body?.marcaId;

  if (typeof marcaId !== "string") {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const { wabaId, phoneNumberId, accessToken, ativo } = body ?? {};

  if (wabaId !== undefined && typeof wabaId !== "string") {
    return NextResponse.json({ error: "wabaId deve ser uma string." }, { status: 400 });
  }
  if (phoneNumberId !== undefined && typeof phoneNumberId !== "string") {
    return NextResponse.json({ error: "phoneNumberId deve ser uma string." }, { status: 400 });
  }
  if (accessToken !== undefined && typeof accessToken !== "string") {
    return NextResponse.json({ error: "accessToken deve ser uma string." }, { status: 400 });
  }
  if (ativo !== undefined && typeof ativo !== "boolean") {
    return NextResponse.json({ error: "ativo deve ser booleano." }, { status: 400 });
  }

  const data: {
    wabaId?: string;
    phoneNumberId?: string;
    accessTokenCriptografado?: string;
    ativo?: boolean;
  } = {};

  if (wabaId !== undefined) data.wabaId = wabaId.trim();
  if (phoneNumberId !== undefined) data.phoneNumberId = phoneNumberId.trim();
  if (accessToken !== undefined && accessToken.trim()) {
    data.accessTokenCriptografado = encrypt(accessToken.trim());
  }
  if (ativo !== undefined) {
    data.ativo = ativo;
  } else if (data.wabaId && data.phoneNumberId && data.accessTokenCriptografado) {
    data.ativo = true;
  }

  const integracao = await prisma.integracaoWhatsapp.upsert({
    where: { marcaId },
    update: data,
    create: { marcaId, ...data },
  });

  return NextResponse.json({ integracao: serializarIntegracao(integracao) });
}
