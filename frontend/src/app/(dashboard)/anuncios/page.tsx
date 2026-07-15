"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Percent,
  AlertTriangle,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  MousePointerClick,
  DollarSign,
  Gauge
} from "lucide-react";

export default function AnunciosPage() {
  const [activeAccount, setActiveAccount] = useState("all");

  // Heatmap helper matrix
  // 7 rows (days Dom-Sáb) x 7 columns (hours: 6h, 8h, 10h, 12h, 14h, 16h, 18h)
  // Dom (0), Seg (1), Ter (2), Qua (3), Qui (4), Sex (5), Sáb (6)
  // Pico: Ter/Qua/Sex entre 9h-15h (10h, 12h, 14h blocks)
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const hours = ["6h", "8h", "10h", "12h", "14h", "16h", "18h"];
  
  const heatmapData = [
    // Dom (very low)
    [1, 1, 1, 1, 1, 1, 1],
    // Seg (medium)
    [2, 3, 3, 4, 3, 3, 2],
    // Ter (pico 9h-15h => 10h, 12h, 14h)
    [2, 4, 9, 9, 9, 4, 2],
    // Qua (pico 9h-15h)
    [2, 4, 9, 9, 9, 4, 2],
    // Qui (medium)
    [2, 3, 4, 4, 3, 3, 2],
    // Sex (pico 9h-15h)
    [2, 4, 9, 9, 9, 4, 2],
    // Sáb (low)
    [1, 2, 2, 2, 2, 2, 1],
  ];

  const getHeatmapBg = (value: number) => {
    switch (value) {
      case 9:
        return "bg-indigo-650 dark:bg-indigo-500 text-white"; // pico
      case 4:
        return "bg-indigo-650/60 dark:bg-indigo-500/60";
      case 3:
        return "bg-indigo-650/30 dark:bg-indigo-500/30";
      case 2:
        return "bg-indigo-650/15 dark:bg-indigo-500/15";
      default:
        return "bg-slate-100/50 dark:bg-neutral-800/40";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-slide-down">
        <span className="text-xxs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest font-text">
          Tráfego Pago
        </span>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display mt-0.5">
          Google Ads — Desempenho de Campanhas
        </h2>
        <p className="text-muted-foreground text-xs mt-1.5 font-text">
          Campanhas ativas no Google Search: acompanhe cliques, conversões e orçamento.
        </p>
        <p className="text-muted-foreground/80 text-xxs mt-1.5 font-text font-medium">
          Período: 27 Mai – 23 Jun 2026
        </p>
      </div>

      {/* Account Selector */}
      <div className="flex justify-start animate-fade-in-slide-down [animation-delay:50ms]">
        <div className="inline-flex bg-slate-100/80 dark:bg-neutral-800/80 p-1 rounded-[12px] border border-gray-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveAccount("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200 ${
              activeAccount === "all"
                ? "bg-white dark:bg-neutral-700 text-indigo-650 dark:text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas as contas
          </button>
          <button
            onClick={() => setActiveAccount("esportevalle")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200 ${
              activeAccount === "esportevalle"
                ? "bg-white dark:bg-neutral-700 text-indigo-650 dark:text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            @esportevalle
          </button>
          <button
            onClick={() => setActiveAccount("esporte.vale")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200 ${
              activeAccount === "esporte.vale"
                ? "bg-white dark:bg-neutral-700 text-indigo-650 dark:text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            @esporte.vale
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
        {/* Cliques */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Cliques
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                499
              </h3>
            </div>
            <MousePointerClick className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium mt-3 flex items-center gap-1 font-text">
            Período: Mai/26
          </p>
        </div>

        {/* CTR */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                CTR
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                6,56%
              </h3>
            </div>
            <Percent className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-3 flex items-center gap-1 font-text">
            Acima da média do setor
          </p>
        </div>

        {/* CPC Médio */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                CPC Médio
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                R$ 1,06
              </h3>
            </div>
            <DollarSign className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium mt-3 flex items-center gap-1 font-text">
            Custo por clique médio
          </p>
        </div>

        {/* Pontuação de Otimização */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Otimização
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                87,2%
              </h3>
            </div>
            <Gauge className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium mt-3 flex items-center gap-1 font-text">
            Score de qualidade da conta
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:200ms]">
        {/* Left Column: Termos de Pesquisa */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Pesquisa
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Termos que Acionaram Anúncios
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Principais termos de busca pesquisados no Google que geraram impressões dos anúncios.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-wrap gap-2 py-4">
              {[
                "decathlon sjc",
                "centauro",
                "loja de esportes sjc",
                "loja de artigos esportivos perto de mim",
                "centauro sjc",
                "kimono perto de mim",
              ].map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700/60 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-neutral-300 transition-colors hover:bg-slate-100/70"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Amber Insight Box */}
            <div className="mt-6 p-3 rounded-[8px] bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/20 flex items-start gap-2.5">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <p className="text-[11px] text-slate-755 dark:text-slate-300 font-semibold leading-normal font-text">
                Os termos mais buscados são marcas concorrentes (Decathlon, Centauro) — seus anúncios estão capturando intenção de compra de quem procura a concorrência.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Timing */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Timing
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Melhor Dia & Horário
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Intensidade de cliques e conversões por dia da semana e horário.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {/* CSS-based Heatmap Grid */}
            <div className="overflow-x-auto no-scrollbar py-2">
              <div className="min-w-[320px] space-y-1.5 font-text text-[10px]">
                {/* Hours Header Row */}
                <div className="flex items-center">
                  <div className="w-10 shrink-0 text-muted-foreground font-bold uppercase tracking-wider text-[9px]">Dia</div>
                  <div className="flex-1 grid grid-cols-7 gap-1.5 text-center text-muted-foreground font-bold">
                    {hours.map((h, idx) => (
                      <div key={idx}>{h}</div>
                    ))}
                  </div>
                </div>

                {/* Days Grid Rows */}
                {days.map((day, dayIdx) => (
                  <div key={dayIdx} className="flex items-center">
                    <div className="w-10 shrink-0 text-foreground font-semibold font-text text-[10px]">{day}</div>
                    <div className="flex-1 grid grid-cols-7 gap-1.5">
                      {hours.map((_, hourIdx) => {
                        const cellVal = heatmapData[dayIdx][hourIdx];
                        return (
                          <div
                            key={hourIdx}
                            className={`h-7 rounded-[4px] flex items-center justify-center transition-all ${getHeatmapBg(
                              cellVal
                            )}`}
                            title={`${day} às ${hours[hourIdx]}`}
                          >
                            {cellVal === 9 && (
                              <span className="text-[8px] font-bold">Pico</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timing Footnote Alert */}
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-650 dark:text-indigo-400">
              <Clock size={14} className="shrink-0" />
              <span>Pico: Ter/Qua/Sex entre 9h–15h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:250ms]">
        {/* Left Column: Dispositivos */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Dispositivos
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Tráfego por Tipo de Aparelho
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Participação de cada tipo de dispositivo no volume total de acessos.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Smartphone (100%) */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
                  <span className="flex items-center gap-1.5">
                    <Smartphone size={14} className="text-slate-500" />
                    Smartphones
                  </span>
                  <span>100%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-650 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Computadores (0%) */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                  <span className="flex items-center gap-1.5">
                    <Monitor size={14} className="text-slate-400" />
                    Computadores
                  </span>
                  <span>0%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-350 dark:bg-neutral-600 rounded-full" style={{ width: "0%" }} />
                </div>
              </div>

              {/* Tablets (0%) */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                  <span className="flex items-center gap-1.5">
                    <Tablet size={14} className="text-slate-400" />
                    Tablets
                  </span>
                  <span>0%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-350 dark:bg-neutral-600 rounded-full" style={{ width: "0%" }} />
                </div>
              </div>
            </div>

            {/* Device footnote */}
            <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-2 text-xs font-semibold text-indigo-650 dark:text-indigo-400">
              <Smartphone size={14} className="shrink-0" />
              <span>100% dos cliques via smartphone — priorize experiência mobile</span>
            </div>
          </div>
        </div>

        {/* Right Column: Investimento */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Investimento
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Orçamento & Resultados
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Total de verba consumida e impressões geradas no período.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-6 items-center">
            {/* Total Budget Card */}
            <div className="bg-slate-50/50 dark:bg-neutral-800/20 border border-slate-100 dark:border-neutral-800 p-4 rounded-[8px] space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Custo Total</span>
              <p className="text-2xl md:text-3xl font-black text-accent tracking-tight font-display">
                R$ 530
              </p>
              <span className="text-[9px] text-muted-foreground block">Verba total consumida</span>
            </div>

            {/* Impressions Card */}
            <div className="bg-slate-50/50 dark:bg-neutral-800/20 border border-slate-100 dark:border-neutral-800 p-4 rounded-[8px] space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Impressões</span>
              <p className="text-2xl md:text-3xl font-black text-foreground tracking-tight font-display">
                7,61 mil
              </p>
              <span className="text-[9px] text-muted-foreground block">Vezes que os anúncios foram exibidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
