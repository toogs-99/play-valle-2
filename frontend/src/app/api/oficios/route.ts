import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import type { Prisma, StatusOficio } from "@prisma/client";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;
const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

const STATUS_VALIDOS: StatusOficio[] = ["pending", "approved", "rejected"];

// ~8MB de PDF em base64 (~10.7MB de texto base64) — limite de segurança.
const MAX_BASE64_LENGTH = 11_000_000;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const marcaId = url.searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const representanteId = url.searchParams.get("representanteId");
  const ataId = url.searchParams.get("ataId");
  const status = url.searchParams.get("status");

  if (status && !STATUS_VALIDOS.includes(status as StatusOficio)) {
    return NextResponse.json({ error: "status inválido." }, { status: 400 });
  }

  const where: Prisma.OficioWhereInput = { marcaId };
  if (representanteId) where.representanteId = representanteId;
  if (ataId) where.representante = { ataId };
  if (status) where.status = status as StatusOficio;

  // Nunca devolve o base64 na listagem — payload pesado, só é buscado no
  // endpoint de download dedicado.
  const oficios = await prisma.oficio.findMany({
    where,
    select: {
      id: true,
      marcaId: true,
      representanteId: true,
      status: true,
      arquivoNomeOriginal: true,
      arquivoMimeType: true,
      sentAt: true,
      vendedor: { select: { id: true, nome: true } },
      itens: {
        select: {
          id: true,
          itemAtaId: true,
          quantidade: true,
          itemAta: { select: { descricao: true, unidade: true, valorUnitario: true } },
        },
      },
      autorizacaoArquivoNome: true,
      autorizacaoArquivoEnviadoEm: true,
      createdAt: true,
      updatedAt: true,
      representante: {
        select: {
          id: true,
          nome: true,
          cidade: true,
          status: true,
          ata: { select: { id: true, numero: true } },
        },
      },
      autorizacao: { select: { id: true, numero: true, dataEmissao: true } },
    },
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json({ marcaId, papel: check.papel, oficios });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const marcaId = body?.marcaId;

  if (typeof marcaId !== "string") {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  const { representanteId, arquivoBase64, arquivoMimeType, arquivoNomeOriginal, vendedorId, itens } = body ?? {};

  if (
    typeof representanteId !== "string" ||
    typeof arquivoBase64 !== "string" ||
    typeof arquivoMimeType !== "string" ||
    typeof arquivoNomeOriginal !== "string" ||
    !arquivoBase64.trim()
  ) {
    return NextResponse.json(
      { error: "representanteId, arquivoBase64, arquivoMimeType e arquivoNomeOriginal são obrigatórios." },
      { status: 400 }
    );
  }

  if (arquivoMimeType !== "application/pdf") {
    return NextResponse.json({ error: "Apenas arquivos PDF são aceitos." }, { status: 400 });
  }

  if (arquivoBase64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: "Arquivo muito grande (limite ~8MB)." }, { status: 400 });
  }

  const assinaturaPdf = Buffer.from(arquivoBase64.slice(0, 20), "base64").toString("latin1");
  if (!assinaturaPdf.startsWith("%PDF-")) {
    return NextResponse.json({ error: "O conteúdo enviado não é um PDF válido." }, { status: 400 });
  }

  const representante = await prisma.representante.findFirst({
    where: { id: representanteId, marcaId },
  });

  if (!representante) {
    return NextResponse.json(
      { error: "Representante não encontrado nesta marca." },
      { status: 404 }
    );
  }

  if (representante.status !== "waiting_letter" && representante.status !== "expired") {
    return NextResponse.json(
      { error: `Representante com status "${representante.status}" não pode receber novo ofício.` },
      { status: 409 }
    );
  }

  // Vendedor responsável (opcional): precisa ser vendedor desta marca.
  if (vendedorId != null) {
    const vinculo =
      typeof vendedorId === "string" &&
      (await prisma.usuarioMarca.findFirst({ where: { marcaId, usuarioId: vendedorId, papel: "vendedor" } }));
    if (!vinculo) {
      return NextResponse.json({ error: "Vendedor não encontrado nesta marca." }, { status: 400 });
    }
  }

  // Produtos pedidos no ofício: precisam ser da ata do representante.
  const itensPedidos: { itemAtaId: string; quantidade: number }[] = [];
  if (itens != null) {
    if (!Array.isArray(itens)) {
      return NextResponse.json({ error: "itens deve ser uma lista." }, { status: 400 });
    }
    const vistos = new Set<string>();
    for (const it of itens) {
      if (
        typeof it?.itemAtaId !== "string" ||
        !Number.isInteger(it.quantidade) ||
        it.quantidade < 1 ||
        vistos.has(it.itemAtaId)
      ) {
        return NextResponse.json(
          { error: "Cada item precisa de itemAtaId único e quantidade inteira maior que zero." },
          { status: 400 }
        );
      }
      vistos.add(it.itemAtaId);
      itensPedidos.push({ itemAtaId: it.itemAtaId, quantidade: it.quantidade });
    }
    if (itensPedidos.length > 0) {
      const validos = await prisma.itemAta.count({
        where: { id: { in: itensPedidos.map((i) => i.itemAtaId) }, ataId: representante.ataId },
      });
      if (validos !== itensPedidos.length) {
        return NextResponse.json({ error: "Há produto que não pertence à ata do representante." }, { status: 400 });
      }
    }
  }

  const oficio = await prisma.oficio.create({
    data: {
      marcaId,
      representanteId,
      vendedorId: vendedorId ?? null,
      itens: { create: itensPedidos },
      arquivoBase64,
      arquivoMimeType,
      arquivoNomeOriginal,
    },
    select: {
      id: true,
      marcaId: true,
      representanteId: true,
      status: true,
      arquivoNomeOriginal: true,
      arquivoMimeType: true,
      sentAt: true,
      vendedor: { select: { id: true, nome: true } },
      itens: { select: { id: true, itemAtaId: true, quantidade: true } },
      createdAt: true,
      updatedAt: true,
      representante: {
        select: { id: true, nome: true, cidade: true, status: true, ata: { select: { id: true, numero: true } } },
      },
    },
  });

  return NextResponse.json({ oficio }, { status: 201 });
}
