import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;

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

  const buffer = Buffer.from(oficio.arquivoBase64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": oficio.arquivoMimeType,
      "Content-Disposition": `inline; filename="${oficio.arquivoNomeOriginal}"`,
    },
  });
}
