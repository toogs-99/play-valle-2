import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

export async function POST(
  request: Request,
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

  const ata = await prisma.ata.findUnique({
    where: { id: oficio.representante.ataId },
    select: { id: true, valorAta: true, _count: { select: { itens: true } } },
  });
  if (!ata) {
    return NextResponse.json({ error: "Ata do representante não encontrada." }, { status: 404 });
  }

  // A venda vale apenas o produto vendido (valor unitário x quantidade), não o
  // total da ata. Atas sem produtos cadastrados mantêm o comportamento antigo
  // (valor fixo da ata) para não quebrar o fluxo de quem ainda não migrou.
  const body = await request.json().catch(() => null);
  let itemAtaId: string | null = null;
  let quantidade = 1;
  let valorVenda = ata.valorAta;

  if (ata._count.itens > 0) {
    if (typeof body?.itemAtaId !== "string") {
      return NextResponse.json(
        { error: "Informe o produto (itemAtaId) vendido para homologar este ofício." },
        { status: 400 }
      );
    }
    quantidade = body.quantidade ?? 1;
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      return NextResponse.json({ error: "quantidade deve ser um inteiro maior que zero." }, { status: 400 });
    }
    const item = await prisma.itemAta.findFirst({
      where: { id: body.itemAtaId, ataId: ata.id },
      select: { id: true, valorUnitario: true },
    });
    if (!item) {
      return NextResponse.json({ error: "Produto não pertence a esta ata." }, { status: 400 });
    }
    itemAtaId = item.id;
    valorVenda = item.valorUnitario.mul(quantidade);
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
        itemAtaId,
        quantidade,
        valor: valorVenda,
        status: "pendente",
      },
    });

    return { oficio: oficioAtualizado, autorizacao, venda };
  });

  return NextResponse.json(resultado);
}
