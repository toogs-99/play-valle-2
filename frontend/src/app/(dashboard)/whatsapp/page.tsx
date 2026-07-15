"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  TrendingUp,
  Clock,
  Plus,
  Send,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Play
} from "lucide-react";

export default function WhatsAppPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("lembrete_prazo_oficio");
  
  // Custom badge styling helper
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "rejected":
        return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovado";
      case "pending":
        return "Em análise";
      case "rejected":
        return "Rejeitado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="animate-fade-in-slide-down">
        <span className="text-xxs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest font-text">
          Comunicações API Meta
        </span>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display mt-0.5">
          Templates e Disparos WhatsApp
        </h2>
        <p className="text-muted-foreground text-xs mt-1.5 font-text">
          Crie templates na API oficial da Meta e dispare campanhas para seus representantes.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
        {/* Templates Aprovados */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
            Templates Aprovados
          </span>
          <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
            8
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium mt-3 font-text">
            Biblioteca ativa na Meta
          </p>
        </div>

        {/* Disparos este mês */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
            Disparos este mês
          </span>
          <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
            1.240
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium mt-3 font-text">
            Total de mensagens encaminhadas
          </p>
        </div>

        {/* Taxa de Leitura */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
            Taxa de Leitura
          </span>
          <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
            87%
          </h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-3 flex items-center gap-1 font-text">
            +4% vs mês anterior
          </p>
        </div>
      </div>

      {/* Main Two Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:200ms]">
        
        {/* Left Column: TEMPLATES / Biblioteca */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-neutral-800 bg-muted/30 flex items-center justify-between rounded-t-[12px]">
            <div className="flex flex-col">
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Templates
              </span>
              <h3 className="font-bold text-sm text-foreground font-display mt-0.5">
                Biblioteca de Mensagens
              </h3>
            </div>
            
            <button className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all">
              <Plus size={14} />
              Novo Template
            </button>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-neutral-800 flex-1">
            {[
              { id: "t-1", name: "lembrete_prazo_oficio", category: "Utilidade", status: "approved" },
              { id: "t-2", name: "confirmacao_adesao", category: "Utilidade", status: "approved" },
              { id: "t-3", name: "nova_ata_disponivel", category: "Marketing", status: "approved" },
              { id: "t-4", name: "pesquisa_satisfacao", category: "Marketing", status: "pending" },
              { id: "t-5", name: "alerta_vencimento_v2", category: "Utilidade", status: "rejected" },
            ].map((tpl) => (
              <div
                key={tpl.id}
                className="px-6 py-5 flex items-center justify-between hover:bg-muted/10 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-foreground font-text">
                    {tpl.name}
                  </h4>
                  <p className="text-xxs text-muted-foreground font-text">
                    Categoria: <span className="font-medium text-foreground">{tpl.category}</span>
                  </p>
                </div>

                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold font-text ${getBadgeStyle(tpl.status)}`}>
                  {getStatusText(tpl.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: NOVO DISPARO / Criar Campanha */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-5 border-b border-gray-200 dark:border-neutral-800 pb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Novo Disparo
            </span>
            <h3 className="font-bold text-sm text-foreground font-display mt-0.5">
              Criar Campanha de Mensagens
            </h3>
          </div>

          <form className="space-y-4 flex-1 flex flex-col" onSubmit={(e) => e.preventDefault()}>
            {/* Select Template */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-500 uppercase tracking-wider">
                Selecionar Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full bg-card border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all"
              >
                <option value="lembrete_prazo_oficio">lembrete_prazo_oficio (Aprovado)</option>
                <option value="confirmacao_adesao">confirmacao_adesao (Aprovado)</option>
                <option value="nova_ata_disponivel">nova_ata_disponivel (Aprovado)</option>
              </select>
            </div>

            {/* Select Audience */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-500 uppercase tracking-wider">
                Audiência Alvo
              </label>
              <select
                className="w-full bg-card border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all"
              >
                <option>Representantes com prazo em 5 dias — 12 contatos</option>
                <option>Todos os representantes ativos — 15 contatos</option>
                <option>Apenas representantes da região Sudeste — 8 contatos</option>
              </select>
            </div>

            {/* Preview da Mensagem (WhatsApp Style) */}
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-xxs font-bold text-slate-500 uppercase tracking-wider">
                Visualização do Disparo
              </label>
              <div className="bg-slate-100 dark:bg-neutral-900 rounded-xl p-4 flex-1 flex flex-col justify-center items-center min-h-[140px] border border-gray-200/50 dark:border-neutral-850">
                {/* WhatsApp Chat Bubble */}
                <div className="bg-[#d9fdd3] dark:bg-emerald-950/45 text-slate-800 dark:text-slate-100 p-3.5 rounded-lg shadow-sm text-xs font-text max-w-sm relative self-start border border-emerald-100/50 dark:border-emerald-900/20">
                  <p className="leading-relaxed">
                    Olá, <span className="font-extrabold text-emerald-800 dark:text-emerald-400">{"{{nome}}"}</span>! Lembramos que o prazo limite para o envio do ofício de adesão correspondente à <span className="font-extrabold text-emerald-800 dark:text-emerald-400">{"{{numero_ata}}"}</span> expira em breve. Evite o cancelamento da sua cota.
                  </p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1.5">08:00</span>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-indigo-650 text-white hover:bg-indigo-750 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              <Send size={14} />
              Agendar Disparo
            </button>
          </form>
        </div>

      </div>

      {/* Historical logs Section */}
      <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 hover:shadow-md transition-shadow duration-300 animate-fade-in-slide-up [animation-delay:250ms]">
        <div className="flex flex-col mb-4">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
            Histórico
          </span>
          <h3 className="font-bold text-sm text-foreground font-display mt-0.5">
            Últimos Disparos de Campanhas
          </h3>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto -mx-6">
          <table className="w-full border-collapse text-left text-xs font-text">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-800 bg-muted/20 text-slate-500 font-bold">
                <th className="px-6 py-3.5">Campanha</th>
                <th className="px-6 py-3.5">Template</th>
                <th className="px-6 py-3.5 text-center">Contatos</th>
                <th className="px-6 py-3.5 text-center">Entregues</th>
                <th className="px-6 py-3.5 text-center">Lidos</th>
                <th className="px-6 py-3.5 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
              {[
                { name: "Lembrete prazos junho", template: "lembrete_prazo_oficio", contacts: 12, delivered: 12, read: 11, date: "10/06/2026" },
                { name: "Divulgação GREAL 002", template: "nova_ata_disponivel", contacts: 45, delivered: 44, read: 38, date: "05/06/2026" },
                { name: "Confirmações maio", template: "confirmacao_adesao", contacts: 8, delivered: 8, read: 7, date: "28/05/2026" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/10 transition-colors font-medium">
                  <td className="px-6 py-3.5 text-foreground font-semibold">{row.name}</td>
                  <td className="px-6 py-3.5 text-slate-500 font-mono text-[10px]">{row.template}</td>
                  <td className="px-6 py-3.5 text-center">{row.contacts}</td>
                  <td className="px-6 py-3.5 text-center text-emerald-600 font-bold">{row.delivered}</td>
                  <td className="px-6 py-3.5 text-center text-indigo-650 font-bold">{row.read}</td>
                  <td className="px-6 py-3.5 text-right text-slate-500">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden space-y-3">
          {[
            { name: "Lembrete prazos junho", template: "lembrete_prazo_oficio", contacts: 12, delivered: 12, read: 11, date: "10/06/2026" },
            { name: "Divulgação GREAL 002", template: "nova_ata_disponivel", contacts: 45, delivered: 44, read: 38, date: "05/06/2026" },
            { name: "Confirmações maio", template: "confirmacao_adesao", contacts: 8, delivered: 8, read: 7, date: "28/05/2026" },
          ].map((row, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl border border-gray-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-900/20 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{row.name}</span>
                <span className="text-[10px] text-slate-450 font-medium">{row.date}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Template: <span className="font-mono text-slate-700 dark:text-slate-300">{row.template}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100 dark:border-neutral-850">
                <span>{row.contacts} contatos</span>
                <span>·</span>
                <span className="text-emerald-600">{row.delivered} entregues</span>
                <span>·</span>
                <span className="text-[#1F2A5A] dark:text-indigo-400">{row.read} lidos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
