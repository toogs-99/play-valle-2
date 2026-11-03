import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const oficio = await prisma.oficio.findUnique({
    where: { id },
    include: { representante: { select: { ataId: true } } },
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

  if (!oficio.autorizacaoArquivoBase64) {
    return NextResponse.json(
      { error: "Anexe o PDF da autorização de controle interno antes de homologar o ofício." },
      { status: 422 }
    );
  }

  const ata = await prisma.ata.findUnique({
    where: { id: oficio.representante.ataId },
    select: { id: true, valorAta: true },
  });
  if (!ata) {
    return NextResponse.json({ error: "Ata do representante não encontrada." }, { status: 404 });
  }

  const anoAtual = new Date().getFullYear();
  const inicioAno = new Date(`${anoAtual}-01-01T00:00:00.000Z`);

  const resultado = await prisma.$transaction(async (tx) => {
    const totalNoAno = await tx.autorizacaoAdesao.count({
      where: { marcaId: oficio.marcaId, dataEmissao: { gte: inicioAno } },
    });
    const numero = `AUT-${anoAtual}-${String(totalNoAno + 1).padStart(4, "0")}`;

    const oficioAtualizado = await tx.oficio.update({
      where: { id: oficio.id },
      data: { status: "approved" },
    });

    await tx.representante.update({
      where: { id: oficio.representanteId },
      data: { status: "active" },
    });

    const autorizacao = await tx.autorizacaoAdesao.create({
      data: {
        marcaId: oficio.marcaId,
        oficioId: oficio.id,
        numero,
      },
    });

    const venda = await tx.venda.create({
      data: {
        marcaId: oficio.marcaId,
        representanteId: oficio.representanteId,
        ataId: ata.id,
        oficioId: oficio.id,
        valor: ata.valorAta,
        status: "pendente",
      },
    });

    return { oficio: oficioAtualizado, autorizacao, venda };
  });

  return NextResponse.json(resultado);
}
