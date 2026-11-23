"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BarList } from "@/components/BarList";
import { LineChart, TooltipProps } from "@/components/LineChart";
import { Toaster } from "@/components/Toaster";
import { useToast } from "@/lib/useToast";
import {
  DollarSign,
  Users,
  FileText,
  Award,
  Clock,
  Check,
} from "lucide-react";

interface MarcaAtiva {
  marcaId: string;
  marcaNome: string;
  papel: "admin" | "gestor_atas" | "financeiro" | "vendedor";
}

interface DashboardData {
  kpis: {
    totalAtas: number;
    totalRepresentantes: number;
    oficiosPendentes: number;
    totalAutorizacoes: number;
    faturamentoPago: number;
    faturamentoPendente: number;
    totalContratado: number;
    totalEmpenhado: number;
    saldoDisponivel: number;
  };
  saldoAtas: {
    id: string;
    numero: string;
    orgao: string;
    valorAta: number;
    solicitado: number;
    contratado: number;
    empenhado: number;
    saldo: number;
    totalContratos: number;
  }[];
  receitaMensal: { date: string; revenue: number }[];
  topVendedores: { name: string; value: number }[];
  topAtas: { name: string; value: number }[];
}

interface VendaPendente {
  id: string;
  valor: string;
  status: "pendente" | "pago" | "cancelado";
  criadaEm: string;
  representante: { id: string; nome: string; cidade: string };
  ata: { id: string; numero: string };
}

const PAPEIS_MARCAR_PAGA = ["admin", "financeiro"];

export default function DashboardPage() {
  const { toast } = useToast();

  const [marcaAtiva, setMarcaAtiva] = useState<MarcaAtiva | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [vendasPendentes, setVendasPendentes] = useState<VendaPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingVendaId, setUpdatingVendaId] = useState<string | null>(null);

  const [hoveredMonthlyData, setHoveredMonthlyData] = useState<TooltipProps | null>(null);

  const currencyFormatter = (number: number) =>
    number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const fetchDashboard = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/dashboard?marcaId=${marcaId}`);
    if (!res.ok) throw new Error("Falha ao carregar dados do painel.");
    const data = await res.json();
    setDashboard(data);
  }, []);

  const fetchVendasPendentes = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/vendas?marcaId=${marcaId}&status=pendente`);
    if (!res.ok) throw new Error("Falha ao carregar vendas pendentes.");
    const data = await res.json();
    setVendasPendentes(data.vendas);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError("");
      try {
        const marcaRes = await fetch("/api/marca-ativa");
        if (!marcaRes.ok) throw new Error("Não foi possível identificar a marca ativa.");
        const { marcaAtiva: marca } = await marcaRes.json();
        if (cancelled) return;
        setMarcaAtiva(marca);

        await Promise.all([fetchDashboard(marca.marcaId), fetchVendasPendentes(marca.marcaId)]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro inesperado.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [fetchDashboard, fetchVendasPendentes]);

  const podeMarcarPaga = marcaAtiva ? PAPEIS_MARCAR_PAGA.includes(marcaAtiva.papel) : false;

  const handleMarcarPaga = async (vendaId: string) => {
    if (!marcaAtiva) return;
    setUpdatingVendaId(vendaId);
    try {
      const res = await fetch(`/api/vendas/${vendaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pago" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ description: data.error || "Falha ao marcar venda como paga." });
        return;
      }
      toast({ description: "Venda marcada como paga!" });
      await Promise.all([fetchDashboard(marcaAtiva.marcaId), fetchVendasPendentes(marcaAtiva.marcaId)]);
    } catch {
      toast({ description: "Erro de rede ao atualizar venda." });
    } finally {
      setUpdatingVendaId(null);
    }
  };

  const monthlyPayload = hoveredMonthlyData?.payload?.[0];
  const monthlyValue = monthlyPayload?.value;
  const ultimoMes = dashboard?.receitaMensal[dashboard.receitaMensal.length - 1];
  const formattedMonthlyValue = monthlyPayload
    ? currencyFormatter(monthlyValue)
    : currencyFormatter(ultimoMes?.revenue ?? 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto space-y-2">
        <p className="text-sm font-semibold text-foreground font-text">{error || "Dados indisponíveis."}</p>
      </div>
    );
  }

  const { kpis, receitaMensal, topVendedores, topAtas, saldoAtas } = dashboard;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Toaster />

      {/* Header */}
      <div className="animate-fade-in-slide-down">
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display">
          Painel Geral de Vendas
        </h2>
        <p className="text-muted-foreground text-xs mt-1.5 font-text">
          Faturamento, rankings e vendas geradas por adesões aprovadas
          {marcaAtiva ? ` — ${marcaAtiva.marcaNome}` : ""}.
        </p>
      </div>

      {/* Mini KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
        <div className="bg-card border border-border p-4 rounded-[var(--radius)] shadow-sm hover:shadow-md transition-all duration-300 col-span-2 lg:col-span-2">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <DollarSign size={12} className="text-primary" /> Faturamento (Pago)
          </span>
          <h3 className="text-2xl font-black text-foreground mt-1.5 font-display">
            {currencyFormatter(kpis.faturamentoPago)}
          </h3>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-2">
            + {currencyFormatter(kpis.faturamentoPendente)} a receber
          </p>
        </div>

        <div className="bg-card border border-border p-4 rounded-[var(--radius)] shadow-sm hover:shadow-md transition-all duration-300">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <Users size={12} className="text-primary" /> Representantes
          </span>
          <h3 className="text-2xl font-black text-foreground mt-1.5 font-display">
            {kpis.totalRepresentantes}
          </h3>
        </div>

        <div className="bg-card border border-border p-4 rounded-[var(--radius)] shadow-sm hover:shadow-md transition-all duration-300">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <FileText size={12} className="text-primary" /> Atas
          </span>
          <h3 className="text-2xl font-black text-foreground mt-1.5 font-display">
            {kpis.totalAtas}
          </h3>
        </div>

        <div className="bg-card border border-border p-4 rounded-[var(--radius)] shadow-sm hover:shadow-md transition-all duration-300">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <Clock size={12} className="text-primary" /> Ofícios Pendentes
          </span>
          <h3 className="text-2xl font-black text-foreground mt-1.5 font-display">
            {kpis.oficiosPendentes}
          </h3>
        </div>

        <div className="bg-card border border-border p-4 rounded-[var(--radius)] shadow-sm hover:shadow-md transition-all duration-300">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <Award size={12} className="text-primary" /> Adesões
          </span>
          <h3 className="text-2xl font-black text-foreground mt-1.5 font-display">
            {kpis.totalAutorizacoes}
          </h3>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:200ms]">
        {/* Card 1: Top Sellers (BarList) */}
        <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Análise de Vendas
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Maiores Vendedores (Ranking)
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Classificação dos representantes por valor total de vendas (pagas + pendentes). Clique nas barras para ver detalhes.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {topVendedores.length === 0 ? (
              <p className="text-xs text-muted-foreground font-text text-center py-8">Nenhuma venda registrada ainda.</p>
            ) : (
              <BarList
                data={topVendedores}
                valueFormatter={(val) => currencyFormatter(val)}
                onValueChange={(item) =>
                  toast({ description: `Representante: ${item.name}\nTotal em vendas: ${currencyFormatter(item.value)}` })
                }
                className="mt-2"
              />
            )}
          </div>
        </div>

        {/* Card 2: Monthly Revenue (LineChart) */}
        <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300">
          <div className="flex flex-col mb-2">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Volume Financeiro
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Faturamento Mensal (Pago)
            </h3>
          </div>

          <div className="mb-4">
            <p className="text-xs text-muted-foreground font-text">
              {hoveredMonthlyData ? `Faturamento em ${hoveredMonthlyData.label}:` : "Faturamento do último mês:"}
            </p>
            <p className="text-2xl font-black text-foreground tracking-tight font-display mt-0.5">
              {formattedMonthlyValue}
            </p>
          </div>

          <div className="flex-1">
            <LineChart
              data={receitaMensal}
              index="date"
              categories={["revenue"]}
              showLegend={false}
              showYAxis={false}
              startEndOnly={true}
              className="h-[220px] md:h-80"
              tooltipCallback={(props) => {
                if (props.active) {
                  setHoveredMonthlyData((prev) => (prev?.label === props.label ? prev : props));
                } else {
                  setHoveredMonthlyData(null);
                }
                return null;
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Atas */}
      <div className="grid grid-cols-1 gap-8 animate-fade-in-slide-up [animation-delay:250ms]">
        <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
              <Award size={12} /> Aproveitamento de Licitações
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Atas Mais Vendidas (Maior Faturamento)
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Ranking das Atas de Registro de Preços por valor total de vendas geradas.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {topAtas.length === 0 ? (
              <p className="text-xs text-muted-foreground font-text text-center py-8">Nenhuma venda registrada ainda.</p>
            ) : (
              <BarList
                data={topAtas}
                valueFormatter={(val) => currencyFormatter(val)}
                onValueChange={(item) =>
                  toast({ description: `Ata: ${item.name}\nTotal em vendas: ${currencyFormatter(item.value)}` })
                }
                className="mt-2"
              />
            )}
          </div>
        </div>
      </div>

      {/* Controle de saldo por Ata */}
      <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm overflow-hidden animate-fade-in-slide-up [animation-delay:275ms]">
        <div className="px-6 py-5 border-b border-border bg-muted/20">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
            Contratos e Empenhos
          </span>
          <h3 className="font-bold text-sm text-foreground font-display mt-0.5">Controle de Saldo por Ata</h3>
          <p className="text-[11px] text-muted-foreground font-text mt-1">
            Compara o valor integral da ata com o que as prefeituras realmente contrataram e empenharam.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-border">
          <div>
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">Contratado</span>
            <p className="text-xl font-black text-foreground font-display mt-1">{currencyFormatter(kpis.totalContratado)}</p>
          </div>
          <div>
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">Empenhado</span>
            <p className="text-xl font-black text-foreground font-display mt-1">{currencyFormatter(kpis.totalEmpenhado)}</p>
          </div>
          <div>
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">Saldo disponível</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-1">{currencyFormatter(kpis.saldoDisponivel)}</p>
          </div>
        </div>

        {saldoAtas.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <p className="text-xs font-text">Nenhuma ata cadastrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase font-text">
                  <th className="p-4">Ata</th>
                  <th className="p-4 text-right">Valor da Ata</th>
                  <th className="p-4 text-right">Solicitado</th>
                  <th className="p-4 text-right">Contratado</th>
                  <th className="p-4 text-right">Empenhado</th>
                  <th className="p-4 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {saldoAtas.map((ata) => (
                  <tr key={ata.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-text">
                      <span className="font-semibold text-foreground block">{ata.numero}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {ata.orgao} · {ata.totalContratos} contrato(s)
                      </span>
                    </td>
                    <td className="p-4 text-right text-muted-foreground font-text">{currencyFormatter(ata.valorAta)}</td>
                    <td className="p-4 text-right text-muted-foreground font-text">{currencyFormatter(ata.solicitado)}</td>
                    <td className="p-4 text-right font-bold text-foreground font-text">{currencyFormatter(ata.contratado)}</td>
                    <td className="p-4 text-right text-muted-foreground font-text">{currencyFormatter(ata.empenhado)}</td>
                    <td
                      className={`p-4 text-right font-bold font-text ${
                        ata.saldo < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {currencyFormatter(ata.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vendas Pendentes (gestão manual) */}
      <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm overflow-hidden animate-fade-in-slide-up [animation-delay:300ms]">
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Contas a Receber
            </span>
            <h3 className="font-bold text-sm text-foreground font-display mt-0.5">Vendas Pendentes de Pagamento</h3>
          </div>
          <span className="text-[10px] text-muted-foreground font-bold bg-muted/40 px-2 py-1 rounded-lg font-text">
            {vendasPendentes.length} pendente(s)
          </span>
        </div>

        {vendasPendentes.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <p className="text-xs font-text">Nenhuma venda pendente de pagamento no momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase font-text">
                  <th className="p-4">Representante</th>
                  <th className="p-4">Ata</th>
                  <th className="p-4">Criada Em</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vendasPendentes.map((venda) => (
                  <tr key={venda.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-semibold text-foreground font-text">{venda.representante.nome}</td>
                    <td className="p-4 text-muted-foreground font-text">{venda.ata.numero}</td>
                    <td className="p-4 text-muted-foreground font-text">
                      {new Date(venda.criadaEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4 text-right font-bold text-foreground font-text">
                      {currencyFormatter(Number(venda.valor))}
                    </td>
                    <td className="p-4 text-right">
                      {podeMarcarPaga ? (
                        <button
                          onClick={() => handleMarcarPaga(venda.id)}
                          disabled={updatingVendaId === venda.id}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-[10px] px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                        >
                          <Check size={11} />
                          {updatingVendaId === venda.id ? "Salvando..." : "Marcar como Paga"}
                        </button>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 font-text">
                          Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
