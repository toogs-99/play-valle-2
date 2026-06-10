"use client";

import React, { useState } from "react";
import { useAtas } from "@/hooks/useAtas";
import { BarList } from "@/components/BarList";
import { LineChart, TooltipProps } from "@/components/LineChart";
import { Toaster } from "@/components/Toaster";
import { useToast } from "@/lib/useToast";
import {
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  FileText,
  Award
} from "lucide-react";

// Types
type FilterType = "region" | "state";

// Static mock data for monthly revenue
const monthlyRevenueData = [
  { date: "Jan 26", revenue: 2340 },
  { date: "Feb 26", revenue: 3110 },
  { date: "Mar 26", revenue: 4643 },
  { date: "Apr 26", revenue: 4650 },
  { date: "May 26", revenue: 3980 },
  { date: "Jun 26", revenue: 4702 },
  { date: "Jul 26", revenue: 5990 },
  { date: "Aug 26", revenue: 5700 },
  { date: "Sep 26", revenue: 4250 },
  { date: "Oct 26", revenue: 4182 },
  { date: "Nov 26", revenue: 3812 },
  { date: "Dec 26", revenue: 4900 },
];

const fallbackSellers = [
  { name: "Roberto Silva Representações", value: 12 },
  { name: "Ana Paula Souza & Cia", value: 9 },
  { name: "Carlos Eduardo Dist. Ltda", value: 7 },
  { name: "Julio Cesar Representações", value: 5 },
  { name: "Mariana Costa Negócios", value: 4 },
];

const fallbackAtasSales = [
  { name: "GREAL ATA 001/2026", value: 8 },
  { name: "GREAL ATA 002/2026", value: 5 },
  { name: "ATA SIMPLIFICADA 012/2025", value: 3 },
  { name: "ATA SIMPLIFICADA 015/2026", value: 2 },
];



// Helper to generate dynamic deterministic monthly data based on selected filter
const getFilteredRevenueData = (filterType: FilterType, value: string) => {
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed += value.charCodeAt(i);
  }
  
  return [
    { date: "Jan 26", revenue: Math.floor(2100 + (seed % 9) * 140) },
    { date: "Feb 26", revenue: Math.floor(2800 + (seed % 6) * 190) },
    { date: "Mar 26", revenue: Math.floor(4100 + (seed % 5) * 230) },
    { date: "Apr 26", revenue: Math.floor(4300 - (seed % 3) * 90) },
    { date: "May 26", revenue: Math.floor(3600 + (seed % 7) * 130) },
    { date: "Jun 26", revenue: Math.floor(4600 + (seed % 5) * 170) },
    { date: "Jul 26", revenue: Math.floor(5600 + (seed % 8) * 210) },
    { date: "Aug 26", revenue: Math.floor(5300 + (seed % 4) * 240) },
    { date: "Sep 26", revenue: Math.floor(4100 - (seed % 2) * 130) },
    { date: "Oct 26", revenue: Math.floor(4000 + (seed % 6) * 110) },
    { date: "Nov 26", revenue: Math.floor(3700 + (seed % 4) * 170) },
    { date: "Dec 26", revenue: Math.floor(4700 + (seed % 9) * 180) },
  ];
};

export default function DashboardPage() {
  const { representantes, atas, autorizacoes } = useAtas();
  const { toast } = useToast();

  // Component states for callback examples
  const [hoveredMonthlyData, setHoveredMonthlyData] = useState<TooltipProps | null>(null);
  const [hoveredFilteredData, setHoveredFilteredData] = useState<TooltipProps | null>(null);

  // Region and State filter states
  const [filterType, setFilterType] = useState<FilterType>("region");
  const [selectedValue, setSelectedValue] = useState<string>("Sul");

  // Formatters
  const currencyFormatter = (number: number) =>
    `R$ ${Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(number)}`;

  // Dynamic values based on filters
  const regionOptions = ["Norte", "Sul", "Leste", "Oeste", "Centro-Oeste"];
  const stateOptions = ["SP", "MG", "RJ", "ES", "PR", "SC", "RS"];

  const handleFilterTypeChange = (type: FilterType) => {
    setFilterType(type);
    setSelectedValue(type === "region" ? "Sul" : "SP");
    setHoveredFilteredData(null);
  };

  const currentFilteredData = getFilteredRevenueData(filterType, selectedValue);

  // Calculate dynamic top sellers based on current representatives
  const topSellers = representantes.length > 0
    ? Object.entries(
        representantes.reduce((acc, r) => {
          acc[r.name] = (acc[r.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : fallbackSellers;

  // Calculate dynamic top atas based on current representatives
  const topAtas = atas.length > 0
    ? atas.map(ata => {
        const count = representantes.filter(r => r.ataId === ata.id).length;
        return {
          name: ata.number,
          value: count
        };
      })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : fallbackAtasSales;



  // Monthly Revenue Tooltip Callback formatting
  const monthlyPayload = hoveredMonthlyData?.payload?.[0];
  const monthlyValue = monthlyPayload?.value;
  const formattedMonthlyValue = monthlyPayload
    ? currencyFormatter(monthlyValue)
    : currencyFormatter(monthlyRevenueData[monthlyRevenueData.length - 1].revenue);

  // Filtered Revenue Tooltip Callback formatting
  const filteredPayload = hoveredFilteredData?.payload?.[0];
  const filteredValue = filteredPayload?.value;
  const formattedFilteredValue = filteredPayload
    ? currencyFormatter(filteredValue)
    : currencyFormatter(currentFilteredData[currentFilteredData.length - 1].revenue);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Toaster />

      {/* Header */}
      <div className="animate-fade-in-slide-down">
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display">
          Painel Geral de Vendas
        </h2>
        <p className="text-muted-foreground text-xs mt-1.5 font-text">
          Visualize o ranking de representantes, produtos, atas e performance regionalizada.
        </p>
      </div>

      {/* Mini KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
        <div className="bg-card border border-border p-5 rounded-[var(--radius)] shadow-sm hover:shadow-md transition-all duration-300">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <DollarSign size={12} className="text-primary" /> Faturamento Estimado (Anual)
          </span>
          <h3 className="text-2xl font-black text-foreground mt-1.5 font-display">
            R$ 51.989,00
          </h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-2">
            +12.4% em relação ao ano anterior
          </p>
        </div>

        <div className="bg-card border border-border p-5 rounded-[var(--radius)] shadow-sm hover:shadow-md transition-all duration-300">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <Users size={12} className="text-primary" /> Vendedores Ativos
          </span>
          <h3 className="text-2xl font-black text-foreground mt-1.5 font-display">
            {representantes.length > 0 ? representantes.length : 15}
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium mt-2">
            Agrupados por região de interesse
          </p>
        </div>

        <div className="bg-card border border-border p-5 rounded-[var(--radius)] shadow-sm hover:shadow-md transition-all duration-300">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <FileText size={12} className="text-primary" /> Atas Ativas
          </span>
          <h3 className="text-2xl font-black text-foreground mt-1.5 font-display">
            {atas.length}
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium mt-2">
            Documentos em monitoramento ativo
          </p>
        </div>

        <div className="bg-card border border-border p-5 rounded-[var(--radius)] shadow-sm hover:shadow-md transition-all duration-300">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <MapPin size={12} className="text-primary" /> Adesões Autorizadas
          </span>
          <h3 className="text-2xl font-black text-foreground mt-1.5 font-display">
            {autorizacoes.length}
          </h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-2">
            Ofícios aprovados e expedidos
          </p>
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
              Classificação dos representantes pelo volume de cotas reservadas e estados de atuação. Clique nas barras para ver detalhes.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <BarList
              data={topSellers}
              valueFormatter={(val) => `${val} Cotas`}
              onValueChange={(item) =>
                toast({
                  description: `Representante: ${item.name}\nReservas: ${item.value} cotas`,
                })
              }
              className="mt-2"
            />
          </div>
        </div>

        {/* Card 2: Monthly Revenue (LineChart) */}
        <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300">
          <div className="flex flex-col mb-2">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Volume Financeiro
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Meses Mais Vendidos (Faturamento)
            </h3>
          </div>

          {/* Interactive display of values based on callback hover */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground font-text">
              {hoveredMonthlyData ? `Faturamento em ${hoveredMonthlyData.label}:` : "Faturamento total do último mês registrado:"}
            </p>
            <p className="text-2xl font-black text-foreground tracking-tight font-display mt-0.5">
              {formattedMonthlyValue}
            </p>
          </div>

          <div className="flex-1">
            <LineChart
              data={monthlyRevenueData}
              index="date"
              categories={["revenue"]}
              showLegend={false}
              showYAxis={false}
              startEndOnly={true}
              className="h-48"
              tooltipCallback={(props) => {
                if (props.active) {
                  setHoveredMonthlyData((prev) => {
                    if (prev?.label === props.label) return prev;
                    return props;
                  });
                } else {
                  setHoveredMonthlyData(null);
                }
                return null;
              }}
            />
          </div>
        </div>

      </div>

      {/* New Grid Row: Atas Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 animate-fade-in-slide-up [animation-delay:250ms]">
        
        {/* Card 4: Top Atas (BarList) */}
        <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
              <Award size={12} /> Aproveitamento de Licitações
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Atas Mais Vendidas (Maior Demanda)
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Ranking das Atas de Registro de Preços com maior adesão e cotação de reservas por região de entrega.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <BarList
              data={topAtas}
              valueFormatter={(val) => `${val} Vendas`}
              onValueChange={(item) =>
                toast({
                  description: `Ata: ${item.name}\nTotal de vendas/reservas: ${item.value}`,
                })
              }
              className="mt-2"
            />
          </div>
        </div>

      </div>

      {/* Filterable Line Chart Section */}
      <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300 animate-fade-in-slide-up [animation-delay:300ms]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4 mb-6">
          <div>
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Visualização Regional
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Faturamento Filtrado por Estado e Região
            </h3>
          </div>

          {/* Dual Level Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle Filter Type */}
            <div className="flex bg-muted p-1 rounded-lg border border-border text-xxs font-semibold shrink-0">
              <button
                onClick={() => handleFilterTypeChange("region")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterType === "region"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Região
              </button>
              <button
                onClick={() => handleFilterTypeChange("state")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterType === "state"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Estado
              </button>
            </div>

            {/* Select Value Dropdown */}
            <select
              value={selectedValue}
              onChange={(e) => {
                setSelectedValue(e.target.value);
                setHoveredFilteredData(null);
              }}
              className="bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {filterType === "region"
                ? regionOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      Região {opt}
                    </option>
                  ))
                : stateOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      UF: {opt}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* Filtered Line Chart Output */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-1 space-y-2">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Detalhamento Selecionado
            </span>
            <p className="text-xs text-muted-foreground font-text leading-relaxed">
              Mostrando os meses mais vendidos para o filtro selecionado (<strong>{filterType === "region" ? `Região ${selectedValue}` : `Estado ${selectedValue}`}</strong>). Passe o mouse sobre o gráfico para ver dados específicos.
            </p>
            <div className="pt-2">
              <p className="text-[11px] text-muted-foreground font-text">
                {hoveredFilteredData ? `Faturamento em ${hoveredFilteredData.label}:` : "Último faturamento mensal do filtro:"}
              </p>
              <p className="text-xl font-bold text-foreground font-display">
                {formattedFilteredValue}
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            <LineChart
              data={currentFilteredData}
              index="date"
              categories={["revenue"]}
              showLegend={false}
              showYAxis={false}
              startEndOnly={true}
              className="h-52"
              tooltipCallback={(props) => {
                if (props.active) {
                  setHoveredFilteredData((prev) => {
                    if (prev?.label === props.label) return prev;
                    return props;
                  });
                } else {
                  setHoveredFilteredData(null);
                }
                return null;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

