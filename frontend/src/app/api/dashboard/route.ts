import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorize";

const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro", "vendedor"] as const;

const MESES_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function decimalParaNumero(valor: unknown): number {
  return valor === null || valor === undefined ? 0 : Number(valor);
}

export async function GET(request: Request) {
  const marcaId = new URL(request.url).searchParams.get("marcaId");
  if (!marcaId) {
    return NextResponse.json({ error: "marcaId é obrigatório." }, { status: 400 });
  }

  const check = await requireRole(marcaId, [...PAPEIS_LEITURA]);
  if (check.error) return check.error;

  const [
    totalAtas,
    totalRepresentantes,
    oficiosPendentes,
    totalAutorizacoes,
    faturamentoPagoAgg,
    faturamentoPendenteAgg,
    vendasPagasUltimoAno,
    topVendedoresRaw,
    topAtasRaw,
  ] = await Promise.all([
    prisma.ata.count({ where: { marcaId } }),
    prisma.representante.count({ where: { marcaId } }),
    prisma.oficio.count({ where: { marcaId, status: "pending" } }),
    prisma.autorizacaoAdesao.count({ where: { marcaId } }),
    prisma.venda.aggregate({ where: { marcaId, status: "pago" }, _sum: { valor: true } }),
    prisma.venda.aggregate({ where: { marcaId, status: "pendente" }, _sum: { valor: true } }),
    prisma.venda.findMany({
      where: {
        marcaId,
        status: "pago",
        pagaEm: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
      select: { valor: true, pagaEm: true },
    }),
    prisma.venda.groupBy({
      by: ["representanteId"],
      where: { marcaId, status: { not: "cancelado" } },
      _sum: { valor: true },
      orderBy: { _sum: { valor: "desc" } },
      take: 5,
    }),
    prisma.venda.groupBy({
      by: ["ataId"],
      where: { marcaId, status: { not: "cancelado" } },
      _sum: { valor: true },
      orderBy: { _sum: { valor: "desc" } },
      take: 5,
    }),
  ]);

  // Receita mensal (últimos 12 meses, baseada na data de pagamento).
  const receitaPorMes = new Map<string, number>();
  for (const venda of vendasPagasUltimoAno) {
    if (!venda.pagaEm) continue;
    const chave = `${venda.pagaEm.getFullYear()}-${String(venda.pagaEm.getMonth() + 1).padStart(2, "0")}`;
    receitaPorMes.set(chave, (receitaPorMes.get(chave) ?? 0) + decimalParaNumero(venda.valor));
  }

  const receitaMensal: { date: string; revenue: number }[] = [];
  const hoje = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    receitaMensal.push({
      date: `${MESES_PT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      revenue: receitaPorMes.get(chave) ?? 0,
    });
  }

  // Resolve nomes de representantes/atas para os rankings.
  const representanteIds = topVendedoresRaw.map((v) => v.representanteId);
  const ataIds = topAtasRaw.map((v) => v.ataId);

  const [representantesInfo, atasInfo] = await Promise.all([
    prisma.representante.findMany({
      where: { id: { in: representanteIds } },
      select: { id: true, nome: true },
    }),
    prisma.ata.findMany({
      where: { id: { in: ataIds } },
      select: { id: true, numero: true },
    }),
  ]);

  const nomeRepresentantePorId = new Map(representantesInfo.map((r) => [r.id, r.nome]));
  const numeroAtaPorId = new Map(atasInfo.map((a) => [a.id, a.numero]));

  const topVendedores = topVendedoresRaw.map((v) => ({
    name: nomeRepresentantePorId.get(v.representanteId) ?? "Representante removido",
    value: decimalParaNumero(v._sum.valor),
  }));

  const topAtas = topAtasRaw.map((v) => ({
    name: numeroAtaPorId.get(v.ataId) ?? "Ata removida",
    value: decimalParaNumero(v._sum.valor),
  }));

  return NextResponse.json({
    marcaId,
    kpis: {
      totalAtas,
      totalRepresentantes,
      oficiosPendentes,
      totalAutorizacoes,
      faturamentoPago: decimalParaNumero(faturamentoPagoAgg._sum.valor),
      faturamentoPendente: decimalParaNumero(faturamentoPendenteAgg._sum.valor),
    },
    receitaMensal,
    topVendedores,
    topAtas,
  });
}
