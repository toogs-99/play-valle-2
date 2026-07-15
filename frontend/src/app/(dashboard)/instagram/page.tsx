"use client";

import React from "react";
import { BarList } from "@/components/BarList";
import { LineChart } from "@/components/LineChart";
import {
  Users,
  Eye,
  Percent,
  MessageCircle,
  Camera,
  Calendar,
  ChevronRight,
  Info
} from "lucide-react";

export default function InstagramPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="animate-fade-in-slide-down">
        <span className="text-xxs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest font-text">
          Marketing & Redes Sociais
        </span>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display mt-0.5">
          Desempenho no Instagram
        </h2>
        <p className="text-muted-foreground text-xs mt-1.5 font-text">
          Acompanhe alcance, engajamento e conversões do perfil para o funil de vendas.
        </p>
        <p className="text-muted-foreground/80 text-xxs mt-1.5 font-text font-medium">
          Última sincronização: hoje às 08:00 · @gestaodeatas
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
        {/* Seguidores */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Seguidores
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                4.827
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-3 flex items-center gap-1 font-text">
            +312 este mês (+6,9%)
          </p>
        </div>

        {/* Alcance */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Alcance (30 dias)
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                38.450
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium mt-3 flex items-center gap-1 font-text">
            Impressões e visualizações do perfil
          </p>
        </div>

        {/* Taxa de Engajamento */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Taxa de Engajamento
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                4,8%
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-3 flex items-center gap-1 font-text">
            +0,6 p.p. vs mês anterior
          </p>
        </div>

        {/* Cliques p/ WhatsApp */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Cliques p/ WhatsApp
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                214
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-3 flex items-center gap-1 font-text">
            +18% vs mês anterior
          </p>
        </div>
      </div>

      {/* Main Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:200ms]">
        
        {/* Left Side: ENGAJAMENTO / Posts com Maior Desempenho */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Engajamento
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Posts com Maior Desempenho
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Classificação das publicações mais engajadas do perfil por curtidas, comentários e salvamentos.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <BarList
              data={[
                { name: "Reel: Bastidores da entrega GREAL", value: 1240 },
                { name: "Carrossel: 5 erros em atas de preço", value: 890 },
                { name: "Reel: Cliente aprovado em 48h", value: 645 },
                { name: "Foto: Equipe no evento de Campinas", value: 310 },
                { name: "Carrossel: Como funciona a adesão", value: 195 },
              ]}
              valueFormatter={(val) => `${val} interações`}
              className="mt-2"
            />
          </div>
        </div>

        {/* Right Side: CRESCIMENTO / Evolução de Seguidores */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-2">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Crescimento
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Evolução de Seguidores
            </h3>
          </div>

          <div className="mb-4">
            <p className="text-xs text-muted-foreground font-text">
              Total acumulado de seguidores ativos:
            </p>
            <p className="text-2xl font-black text-foreground tracking-tight font-display mt-0.5">
              4.827 seguidores
            </p>
          </div>

          <div className="flex-1">
            <LineChart
              data={[
                { date: "Jan 26", followers: 3400 },
                { date: "Feb 26", followers: 3500 },
                { date: "Mar 26", followers: 3620 },
                { date: "Apr 26", followers: 3750 },
                { date: "May 26", followers: 3680 },
                { date: "Jun 26", followers: 3800 },
                { date: "Jul 26", followers: 3950 },
                { date: "Aug 26", followers: 4100 },
                { date: "Sep 26", followers: 4300 },
                { date: "Oct 26", followers: 4500 },
                { date: "Nov 26", followers: 4680 },
                { date: "Dec 26", followers: 4827 },
              ]}
              index="date"
              categories={["followers"]}
              showLegend={false}
              showYAxis={false}
              startEndOnly={true}
              className="h-48"
            />
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:250ms]">
        
        {/* Bottom Left: CONTEÚDO / Desempenho por Formato */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Conteúdo
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Desempenho por Formato
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Participação de cada formato de publicação no total de alcance do perfil.
            </p>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Reels (58%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--primary)"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="105.5"
                  className="transition-all duration-1000 ease-out"
                />
                {/* Carrossel (29%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--ring)"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="178.4"
                  className="transition-all duration-1000 ease-out"
                  transform="rotate(208.8 50 50)"
                />
                {/* Foto (13%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="oklch(0.769 0.188 70.08)"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="218.5"
                  className="transition-all duration-1000 ease-out"
                  transform="rotate(313.2 50 50)"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest font-text">Total</span>
                <span className="text-lg font-black text-foreground font-display leading-none mt-0.5">100%</span>
              </div>
            </div>

            {/* Legends */}
            <div className="space-y-3 font-text text-xs font-semibold w-full max-w-[200px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-md bg-indigo-650 shrink-0" />
                  <span className="text-slate-750 dark:text-slate-300">Reels</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">58%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-md bg-indigo-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Carrossel</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">29%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-md bg-amber-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Foto</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">13%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right: CONVERSÃO / Instagram → WhatsApp */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-2">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Conversão
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Instagram → WhatsApp
            </h3>
          </div>

          <div className="mb-4">
            <p className="text-xs text-muted-foreground font-text">
              Frequência de novos contatos iniciados:
            </p>
            <p className="text-2xl font-black text-[#E97826] tracking-tight font-display mt-0.5">
              214 conversas iniciadas este mês
            </p>
          </div>

          <div className="flex-1">
            <LineChart
              data={[
                { date: "Jan 26", clicks: 90 },
                { date: "Feb 26", clicks: 98 },
                { date: "Mar 26", clicks: 110 },
                { date: "Apr 26", clicks: 122 },
                { date: "May 26", clicks: 130 },
                { date: "Jun 26", clicks: 125 },
                { date: "Jul 26", clicks: 120 },
                { date: "Aug 26", clicks: 138 },
                { date: "Sep 26", clicks: 155 },
                { date: "Oct 26", clicks: 175 },
                { date: "Nov 26", clicks: 194 },
                { date: "Dec 26", clicks: 214 },
              ]}
              index="date"
              categories={["clicks"]}
              showLegend={false}
              showYAxis={false}
              startEndOnly={true}
              className="h-48"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
