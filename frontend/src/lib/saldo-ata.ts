import { prisma } from "@/lib/prisma";

export interface ItemComSaldo {
  id: string;
  ataId: string;
  descricao: string;
  unidade: string;
  valorUnitario: number;
  quantidade: number;
  quantidadeContratada: number;
  saldoQuantidade: number;
  valorRegistrado: number;
  valorContratado: number;
  saldoValor: number;
}

/**
 * Produtos de uma ata com o que já foi abatido por contratos/empenhos.
 * Saldo = quantidade registrada na ata - soma das quantidades contratadas.
 */
export async function calcularSaldoItens(ataId: string): Promise<ItemComSaldo[]> {
  const [itens, consumo] = await Promise.all([
    prisma.itemAta.findMany({ where: { ataId }, orderBy: { createdAt: "asc" } }),
    prisma.itemContrato.groupBy({
      by: ["itemAtaId"],
      where: { contrato: { ataId } },
      _sum: { quantidade: true },
    }),
  ]);

  const contratadoPorItem = new Map(consumo.map((c) => [c.itemAtaId, c._sum.quantidade ?? 0]));

  return itens.map((item) => {
    const valorUnitario = Number(item.valorUnitario);
    const quantidadeContratada = contratadoPorItem.get(item.id) ?? 0;
    return {
      id: item.id,
      ataId: item.ataId,
      descricao: item.descricao,
      unidade: item.unidade,
      valorUnitario,
      quantidade: item.quantidade,
      quantidadeContratada,
      saldoQuantidade: item.quantidade - quantidadeContratada,
      valorRegistrado: valorUnitario * item.quantidade,
      valorContratado: valorUnitario * quantidadeContratada,
      saldoValor: valorUnitario * (item.quantidade - quantidadeContratada),
    };
  });
}
