import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

// Vendedores da marca (usuários com papel "vendedor"), usados para indicar o
// responsável por cada ofício recebido.
export async function GET(request: Request) {
  const marcaId = new URL(request.url).searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, ["admin", "gestor_atas", "financeiro", "vendedor"]);
  if (check.error) return check.error;

  const vinculos = await prisma.usuarioMarca.findMany({
    where: { marcaId, papel: "vendedor" },
    select: { usuario: { select: { id: true, nome: true } } },
    orderBy: { usuario: { nome: "asc" } },
  });

  return NextResponse.json({ vendedores: vinculos.map((v) => v.usuario) });
}
