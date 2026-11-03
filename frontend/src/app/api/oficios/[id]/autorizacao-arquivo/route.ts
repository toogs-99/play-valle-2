import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;
const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

// ~8MB de PDF em base64 (~10.7MB de texto base64) — mesmo limite do ofício.
const MAX_BASE64_LENGTH = 11_000_000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const oficio = await prisma.oficio.findUnique({ where: { id } });
  if (!oficio) {
    return NextResponse.json({ error: "Ofício não encontrado." }, { status: 404 });
  }

  const check = await requireRole(oficio.marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  if (!oficio.autorizacaoArquivoBase64 || !oficio.autorizacaoArquivoMimeType) {
    return NextResponse.json({ error: "Nenhum arquivo de autorização anexado." }, { status: 404 });
  }

  const buffer = Buffer.from(oficio.autorizacaoArquivoBase64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": oficio.autorizacaoArquivoMimeType,
      "Content-Disposition": `inline; filename="${oficio.autorizacaoArquivoNome ?? "autorizacao.pdf"}"`,
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const oficio = await prisma.oficio.findUnique({
    where: { id },
    select: { id: true, marcaId: true, status: true },
  });
  if (!oficio) {
    return NextResponse.json({ error: "Ofício não encontrado." }, { status: 404 });
  }

  const check = await requireRole(oficio.marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  if (oficio.status !== "pending") {
    return NextResponse.json(
      { error: `Ofício já foi processado (status atual: "${oficio.status}").` },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  const { arquivoBase64, arquivoMimeType, arquivoNomeOriginal } = body ?? {};

  if (
    typeof arquivoBase64 !== "string" ||
    typeof arquivoMimeType !== "string" ||
    typeof arquivoNomeOriginal !== "string" ||
    !arquivoBase64.trim()
  ) {
    return NextResponse.json(
      { error: "arquivoBase64, arquivoMimeType e arquivoNomeOriginal são obrigatórios." },
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

  const atualizado = await prisma.oficio.update({
    where: { id },
    data: {
      autorizacaoArquivoNome: arquivoNomeOriginal,
      autorizacaoArquivoMimeType: arquivoMimeType,
      autorizacaoArquivoBase64: arquivoBase64,
      autorizacaoArquivoEnviadoEm: new Date(),
    },
    select: { id: true, autorizacaoArquivoNome: true, autorizacaoArquivoEnviadoEm: true },
  });

  return NextResponse.json({ oficio: atualizado });
}
