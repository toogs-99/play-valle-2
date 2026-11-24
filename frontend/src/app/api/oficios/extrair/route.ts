import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";
import { extrairTextoPdf, sugerirItens } from "@/lib/extrair-itens-oficio";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;
const MAX_BASE64_LENGTH = 11_000_000;

// Tenta ler o PDF do ofício e sugerir os produtos/quantidades pedidos. Nunca
// grava nada: o usuário confere as sugestões e, se a leitura falhar, lança os
// itens um por um.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { marcaId, ataId, arquivoBase64 } = body ?? {};

  if (typeof marcaId !== "string" || typeof ataId !== "string" || typeof arquivoBase64 !== "string") {
    return NextResponse.json({ error: "marcaId, ataId e arquivoBase64 são obrigatórios." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_ESCRITA]);
  if (check.error) return check.error;

  if (arquivoBase64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: "Arquivo muito grande (limite ~8MB)." }, { status: 400 });
  }

  const itensAta = await prisma.itemAta.findMany({
    where: { ataId, ata: { marcaId } },
    select: { id: true, descricao: true },
  });

  try {
    const texto = await extrairTextoPdf(arquivoBase64);
    if (!texto.trim()) {
      return NextResponse.json({ itens: [], motivo: "O PDF não tem texto legível (provavelmente é digitalizado)." });
    }
    const itens = sugerirItens(texto, itensAta);
    return NextResponse.json({
      itens,
      motivo: itens.length === 0 ? "Não encontrei produtos da ata no texto do ofício." : null,
    });
  } catch {
    return NextResponse.json({ itens: [], motivo: "Não consegui ler este PDF." });
  }
}
