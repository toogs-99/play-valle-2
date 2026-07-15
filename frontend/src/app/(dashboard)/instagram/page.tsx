"use client";

import React, { useState } from "react";
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
  Info,
  Zap,
  TrendingUp
} from "lucide-react";

export default function InstagramPage() {
  const [activeAccount, setActiveAccount] = useState("all");

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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
        {/* Seguidores */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Seguidores
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                4.827
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-3 flex items-center gap-1 font-text">
            +312 (+6,9%)
          </p>
        </div>

        {/* Alcance */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Alcance (30d)
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                38.450
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium mt-3 flex items-center gap-1 font-text truncate">
            Visualizações do perfil
          </p>
        </div>

        {/* Qualidade do Engajamento */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group col-span-2 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Qualidade do Engajamento
              </span>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight font-display leading-none">
                  13,6%
                </h3>
                <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-full font-semibold font-text shrink-0">
                  5,4x acima da média do setor
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-foreground mb-0.5">
                <span>Esporte Valle</span>
                <span>13,6%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-650 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground mb-0.5">
                <span>Média lojas esportivas</span>
                <span>2,5%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 dark:bg-neutral-600 rounded-full" style={{ width: "18.38%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground mb-0.5">
                <span>Média Instagram</span>
                <span>1,2%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 dark:bg-neutral-700 rounded-full" style={{ width: "8.82%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Cliques p/ WhatsApp */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Cliques WhatsApp
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                214
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-3 flex items-center gap-1 font-text">
            +18% vs anterior
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

          <div className="flex-1 flex flex-col justify-center space-y-2.5">
            {[
              { name: "Loja de camisas", type: "Reel", date: "10/06", value: 257 },
              { name: "Camisa da Seleção Brasil", type: "Reel", date: "28/05", value: 208 },
              { name: "Dia de Brasil em Campo — Copa 2026", type: "Post", date: "23/06", value: 36 },
              { name: "Junho é Mês de Gol", type: "Post", date: "03/06", value: 33 },
            ].map((item, index, arr) => {
              const maxValue = Math.max(...arr.map((d) => d.value), 1);
              const percentage = (item.value / maxValue) * 100;
              return (
                <div
                  key={index}
                  className="group relative w-full rounded-md flex items-center justify-between text-left focus:outline-none transition-all duration-200 overflow-hidden"
                  style={{ minHeight: "36px" }}
                >
                  {/* Background progress bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-primary/10 group-hover:bg-primary/15 rounded-md transition-all duration-500 ease-out pointer-events-none"
                    style={{ width: `${percentage}%` }}
                  />

                  {/* Overlaid text content */}
                  <div className="relative z-10 w-full flex items-center justify-between px-3 py-2 text-xs font-semibold">
                    <div className="flex items-center gap-2 truncate mr-4">
                      {/* Badge for Type */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border ${
                        item.type === "Reel"
                          ? "bg-indigo-55/60 text-indigo-700 border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
                          : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-foreground font-text truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal shrink-0">
                        {item.date}
                      </span>
                    </div>
                    <span className="text-muted-foreground font-text font-bold shrink-0">
                      {item.value} views
                    </span>
                  </div>
                </div>
              );
            })}
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
              className="h-[220px] md:h-80"
            />
          </div>
        </div>

      </div>

      {/* Alcance & Audiência Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:220ms]">
        
        {/* Left Column: ALCANCE / Seguidores x Não-Seguidores */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Alcance
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Seguidores x Não-Seguidores
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Divisão de usuários alcançados no período pelo perfil.
            </p>
          </div>

          <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut Chart for Followers vs Non-Followers */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Não-seguidores (80.2%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--primary)"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="49.7"
                  className="transition-all duration-1000 ease-out"
                />
                {/* Seguidores (19.8%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--primary-light)"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="201.5"
                  className="transition-all duration-1000 ease-out"
                  transform="rotate(288.7 50 50)"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest font-text">Não-Seg.</span>
                <span className="text-lg font-black text-foreground font-display leading-none mt-0.5">80,2%</span>
              </div>
            </div>

            {/* Legends */}
            <div className="space-y-3 font-text text-xs font-semibold w-full md:max-w-[200px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-md bg-indigo-650 shrink-0" />
                  <span className="text-slate-755 dark:text-slate-300">Não-Seguidores</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">80,2%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-md bg-indigo-200 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Seguidores</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">19,8%</span>
              </div>
              
              <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 text-[10px] text-indigo-650 dark:text-indigo-400 font-medium leading-normal">
                Alto alcance orgânico além da base de seguidores.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AUDIÊNCIA / Perfil Demográfico */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Audiência
            </span>
            <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">
              Perfil Demográfico
            </h3>
            <p className="text-[11px] text-muted-foreground font-text mt-1">
              Distribuição de faixa etária e principais cidades do público-alvo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* Age groups (horizontal bars) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Faixa Etária</span>
              {[
                { label: "45-54", value: "35,4%" },
                { label: "35-44", value: "26,3%" },
                { label: "55-64", value: "18,3%" },
                { label: "25-34", value: "12,3%" },
                { label: "+65", value: "6,4%" },
                { label: "18-24", value: "1,3%" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold">
                  <span className="w-10 text-muted-foreground shrink-0">{item.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-650 rounded-full" style={{ width: item.value }} />
                  </div>
                  <span className="w-10 text-right text-foreground font-bold shrink-0">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Top Cities */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Cidades Principais</span>
                <div className="space-y-2 font-text text-xs font-semibold">
                  {[
                    { city: "São José dos Campos", value: "75,6%" },
                    { city: "Jacareí", value: "8,3%" },
                    { city: "São Paulo", value: "5,2%" },
                    { city: "Taubaté", value: "2,9%" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-neutral-800/40">
                      <span className="text-slate-700 dark:text-slate-300">{item.city}</span>
                      <span className="text-slate-900 dark:text-white font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

          <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-6 py-4">
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
            <div className="space-y-3 font-text text-xs font-semibold w-full md:max-w-[200px]">
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

          {/* Highlighted Insight Box */}
          <div className="mt-4 p-3 rounded-[8px] bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 flex items-start gap-2.5">
            <Zap size={16} className="text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-750 dark:text-slate-300 font-semibold leading-normal font-text">
              Reels são o principal motor de alcance — <span className="text-indigo-650 dark:text-indigo-400 font-bold">63,1% das views</span> e <span className="text-indigo-650 dark:text-indigo-400 font-bold">+1.116% de crescimento</span> no período.
            </p>
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
              className="h-[220px] md:h-80"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
