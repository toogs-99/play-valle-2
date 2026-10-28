import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Secretarias cadastradas na tabela secretarias
    const secretariasDb = await prisma.$queryRaw<{ nome: string }[]>`
      SELECT nome FROM secretarias ORDER BY nome ASC
    `.catch(() => []);

    // 2. Cidades / secretarias já cadastradas em representantes existentes
    const repsDb = await prisma.representante.findMany({
      select: { cidade: true },
      distinct: ["cidade"],
    });

    const setNomes = new Set<string>();
    for (const s of secretariasDb) {
      if (s.nome?.trim()) setNomes.add(s.nome.trim());
    }
    for (const r of repsDb) {
      if (r.cidade?.trim()) setNomes.add(r.cidade.trim());
    }

    const secretarias = Array.from(setNomes).sort((a, b) => a.localeCompare(b, "pt-BR"));

    return NextResponse.json({ secretarias });
  } catch (error) {
    console.error("Erro ao buscar secretarias:", error);
    return NextResponse.json({ secretarias: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const nome = typeof body?.nome === "string" ? body.nome.trim() : "";

    if (!nome) {
      return NextResponse.json({ error: "Nome da secretaria é obrigatório." }, { status: 400 });
    }

    const id = `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await prisma.$executeRaw`
      INSERT INTO secretarias (id, nome, "createdAt")
      VALUES (${id}, ${nome}, CURRENT_TIMESTAMP)
      ON CONFLICT (nome) DO NOTHING
    `;

    return NextResponse.json({ ok: true, nome });
  } catch (error) {
    console.error("Erro ao registrar secretaria:", error);
    return NextResponse.json({ error: "Erro interno ao registrar secretaria." }, { status: 500 });
  }
}
