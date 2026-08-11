import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_ESCRITA = ["admin", "gestor_atas"] as const;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const oficio = await prisma.oficio.findUnique({ where: { id } });
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

  const oficioAtualizado = await prisma.oficio.update({
    where: { id: oficio.id },
    data: { status: "rejected" },
  });

  return NextResponse.json({ oficio: oficioAtualizado });
}
