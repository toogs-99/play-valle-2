import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import { encrypt } from "@/lib/crypto";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro"] as const;
const PAPEIS_ESCRITA = ["admin"] as const;

// Nunca inclui smtpSenhaCriptografada na resposta.
function serializarIntegracao(integracao: {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUsuario: string | null;
  smtpSeguro: boolean;
  emailRemetente: string | null;
  nomeRemetente: string | null;
  ativo: boolean;
  ultimaSincronizacao: Date | null;
  ultimoErro: string | null;
  smtpSenhaCriptografada: string | null;
}) {
  return {
    configurada: Boolean(
      integracao.smtpHost && integracao.smtpPort && integracao.smtpUsuario &&
      integracao.smtpSenhaCriptografada && integracao.emailRemetente
    ),
    smtpHost: integracao.smtpHost,
    smtpPort: integracao.smtpPort,
    smtpUsuario: integracao.smtpUsuario,
    smtpSeguro: integracao.smtpSeguro,
    emailRemetente: integracao.emailRemetente,
    nomeRemetente: integracao.nomeRemetente,
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

  const integracao = await prisma.integracaoEmail.findUnique({ where: { marcaId } });

  if (!integracao) {
    return NextResponse.json({
      integracao: {
        configurada: false,
        smtpHost: null,
        smtpPort: null,
        smtpUsuario: null,
        smtpSeguro: true,
        emailRemetente: null,
        nomeRemetente: null,
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

  const { smtpHost, smtpPort, smtpUsuario, smtpSenha, smtpSeguro, emailRemetente, nomeRemetente, ativo } = body ?? {};

  if (smtpHost !== undefined && typeof smtpHost !== "string") {
    return NextResponse.json({ error: "smtpHost deve ser uma string." }, { status: 400 });
  }
  if (smtpPort !== undefined && (typeof smtpPort !== "number" || !Number.isInteger(smtpPort))) {
    return NextResponse.json({ error: "smtpPort deve ser um inteiro." }, { status: 400 });
  }
  if (smtpUsuario !== undefined && typeof smtpUsuario !== "string") {
    return NextResponse.json({ error: "smtpUsuario deve ser uma string." }, { status: 400 });
  }
  if (smtpSenha !== undefined && typeof smtpSenha !== "string") {
    return NextResponse.json({ error: "smtpSenha deve ser uma string." }, { status: 400 });
  }
  if (smtpSeguro !== undefined && typeof smtpSeguro !== "boolean") {
    return NextResponse.json({ error: "smtpSeguro deve ser booleano." }, { status: 400 });
  }
  if (emailRemetente !== undefined && typeof emailRemetente !== "string") {
    return NextResponse.json({ error: "emailRemetente deve ser uma string." }, { status: 400 });
  }
  if (nomeRemetente !== undefined && nomeRemetente !== null && typeof nomeRemetente !== "string") {
    return NextResponse.json({ error: "nomeRemetente deve ser uma string ou nula." }, { status: 400 });
  }
  if (ativo !== undefined && typeof ativo !== "boolean") {
    return NextResponse.json({ error: "ativo deve ser booleano." }, { status: 400 });
  }

  const data: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUsuario?: string;
    smtpSenhaCriptografada?: string;
    smtpSeguro?: boolean;
    emailRemetente?: string;
    nomeRemetente?: string | null;
    ativo?: boolean;
  } = {};

  if (smtpHost !== undefined) data.smtpHost = smtpHost.trim();
  if (smtpPort !== undefined) data.smtpPort = smtpPort;
  if (smtpUsuario !== undefined) data.smtpUsuario = smtpUsuario.trim();
  if (smtpSenha !== undefined && smtpSenha.trim()) data.smtpSenhaCriptografada = encrypt(smtpSenha.trim());
  if (smtpSeguro !== undefined) data.smtpSeguro = smtpSeguro;
  if (emailRemetente !== undefined) data.emailRemetente = emailRemetente.trim();
  if (nomeRemetente !== undefined) data.nomeRemetente = nomeRemetente?.trim() || null;

  if (ativo !== undefined) {
    data.ativo = ativo;
  } else if (data.smtpHost && data.smtpPort && data.smtpUsuario && data.smtpSenhaCriptografada && data.emailRemetente) {
    data.ativo = true;
  }

  const integracao = await prisma.integracaoEmail.upsert({
    where: { marcaId },
    update: data,
    create: { marcaId, ...data },
  });

  return NextResponse.json({ integracao: serializarIntegracao(integracao) });
}
