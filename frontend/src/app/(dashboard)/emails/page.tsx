"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Calendar,
  Users,
  Eye,
  MousePointer,
  ChevronRight,
  X,
  Info
} from "lucide-react";

interface EmailItem {
  subject: string;
  dest: string;
  open: string;
  date: string;
  fullDate: string;
  body: string;
}

export default function EmailsPage() {
  const [selectedMail, setSelectedMail] = useState<EmailItem | null>(null);

  const mockEmails: EmailItem[] = [
    {
      subject: "Ofício GREAL 001 — prazo final",
      dest: "Representantes ativos — 12 contatos",
      open: "75% abertura",
      date: "08/06",
      fullDate: "08/06/2026 às 14:30",
      body: `Prezado representante,

Relembramos que o prazo limite para o envio do ofício de adesão correspondente à GREAL ATA 001/2026 está se esgotando. 

Por favor, acesse a plataforma e anexe o documento devidamente assinado o quanto antes para garantir a homologação de sua reserva de cota.

Atenciosamente,
Equipe Gestão de Atas.`
    },
    {
      subject: "Nova ata disponível para adesão",
      dest: "Todos os representantes — 45 contatos",
      open: "58% abertura",
      date: "03/06",
      fullDate: "03/06/2026 às 09:15",
      body: `Olá equipe de vendas,

Temos o prazer de comunicar que uma nova Ata de Registro de Preços foi cadastrada no sistema e já está disponível para solicitações de adesão:

• Ata: GREAL ATA 002/2026 (Playgrounds modulares)
• Órgão: Secretaria Estadual de Educação - SP

Acesse o painel geral para solicitar as reservas de cotas para as suas respectivas regiões de interesse.

Boas vendas!
Gestão de Atas.`
    },
    {
      subject: "Atualização de regras regionais",
      dest: "Todos os representantes — 45 contatos",
      open: "52% abertura",
      date: "25/05",
      fullDate: "25/05/2026 às 16:45",
      body: `Aos representantes,

Informamos que foram atualizadas as diretrizes para cadastro e reservas em regiões coincidentes no sistema Gestão de Atas.

Caso tente cadastrar um representante para uma região que já possui reserva ativa de outro vendedor, o sistema agora gerencia uma fila de espera ordenada automaticamente com base no prazo de envio de ofício do atual detentor.

As novas regras detalhadas podem ser consultadas na Central de Ajuda.

Atenciosamente,
Administração de Contratos.`
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="animate-fade-in-slide-down">
        <span className="text-xxs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest font-text">
          Comunicações Corporativas
        </span>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display mt-0.5">
          Central de E-mails
        </h2>
        <p className="text-muted-foreground text-xs mt-1.5 font-text">
          Dispare comunicados e ofícios por e-mail para representantes e órgãos.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
        {/* Enviados este mês */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <Send size={12} className="text-primary" /> Enviados este mês
          </span>
          <h3 className="text-3xl font-black text-foreground mt-1.5 tracking-tight font-display">
            342
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium mt-2 font-text">
            Total de comunicados disparados
          </p>
        </div>

        {/* Taxa de Abertura */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <Eye size={12} className="text-primary" /> Taxa de Abertura
          </span>
          <h3 className="text-3xl font-black text-foreground mt-1.5 tracking-tight font-display">
            61%
          </h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-2 font-text">
            Média de engajamento do funil
          </p>
        </div>

        {/* Cliques */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
            <MousePointer size={12} className="text-primary" /> Cliques
          </span>
          <h3 className="text-3xl font-black text-foreground mt-1.5 tracking-tight font-display">
            23%
          </h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-2 font-text">
            Taxa de cliques em links de ofícios
          </p>
        </div>
      </div>

      {/* Main Two Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:200ms]">
        
        {/* Left Column: NOVA CAMPANHA / Compor E-mail */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col mb-5 border-b border-gray-200 dark:border-neutral-800 pb-4">
            <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
              Nova Campanha
            </span>
            <h3 className="font-bold text-sm text-foreground font-display mt-0.5">
              Compor E-mail Corporativo
            </h3>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-500 uppercase tracking-wider">
                Assunto do E-mail
              </label>
              <input
                type="text"
                defaultValue="Ofício de adesão — GREAL ATA 002/2026"
                className="w-full bg-card border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all"
              />
            </div>

            {/* Recipients */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-500 uppercase tracking-wider">
                Destinatários
              </label>
              <select
                className="w-full bg-card border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all"
              >
                <option>Representantes ativos — 5 contatos</option>
                <option>Todos os representantes — 15 contatos</option>
                <option>Órgãos gerenciadores de atas — 4 contatos</option>
              </select>
            </div>

            {/* Email Body */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-500 uppercase tracking-wider">
                Corpo da Mensagem
              </label>
              <textarea
                rows={5}
                defaultValue={`Prezado representante,

Solicitamos o envio do ofício devidamente assinado para dar andamento ao processo de adesão da ata correspondente.

Atenciosamente,
Equipe Gestão de Atas.`}
                className="w-full bg-card border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all font-text leading-relaxed"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-650 text-white hover:bg-indigo-750 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
              >
                <Send size={14} />
                Enviar Agora
              </button>
              <button
                type="button"
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-slate-200 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 dark:border-neutral-800 transition-all"
              >
                <Calendar size={14} />
                Agendar
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: HISTÓRICO / Últimos Envios */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-neutral-800 bg-muted/30 flex items-center justify-between rounded-t-[12px]">
            <div className="flex flex-col">
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Histórico
              </span>
              <h3 className="font-bold text-sm text-foreground font-display mt-0.5">
                Últimos Envios Realizados
              </h3>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-neutral-800 flex-1">
            {mockEmails.map((mail, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMail(mail)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 active:bg-muted/50 transition-colors group cursor-pointer text-left border-0 bg-transparent last:rounded-b-[12px]"
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <h4 className="font-semibold text-xs text-foreground font-text truncate">
                    {mail.subject}
                  </h4>
                  <div className="flex items-center gap-2 text-xxs text-muted-foreground font-text">
                    <span className="flex items-center gap-0.5 text-slate-500 font-medium">
                      <Users size={10} />
                      {mail.dest.split(" — ")[0]}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-600 font-semibold">{mail.open}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xxs text-slate-450 font-medium font-text">
                    {mail.date}
                  </span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Modal - E-mail Reader Demonstration */}
      {selectedMail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:bg-slate-900/40 md:backdrop-blur-sm md:p-4">
          <div 
            className="hidden md:block fixed inset-0" 
            onClick={() => setSelectedMail(null)} 
          />
          <div className="bg-card w-full h-full md:h-auto md:max-w-xl md:rounded-[12px] md:border md:border-gray-200 md:dark:border-neutral-800 p-6 flex flex-col justify-between shadow-lg relative animate-in slide-in-from-right md:slide-in-from-none md:zoom-in-95 duration-300 z-10">
            <div>
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedMail(null)}
                className="md:hidden flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold text-xs mb-6 bg-transparent border-0 cursor-pointer self-start"
              >
                &larr; Voltar
              </button>

              {/* Desktop Close Button */}
              <button
                onClick={() => setSelectedMail(null)}
                className="hidden md:block absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-neutral-800 p-1.5 rounded-lg transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Header / Meta */}
              <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-indigo-650 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                  Visualização do Comunicado
                </span>
                <h3 className="text-base font-extrabold text-foreground tracking-tight leading-snug">
                  {selectedMail.subject}
                </h3>
                
                <div className="space-y-1 text-xxs text-muted-foreground font-text">
                  <p>
                    De: <span className="font-semibold text-foreground">Gestão de Atas &lt;comunicados@licitflow.com.br&gt;</span>
                  </p>
                  <p>
                    Para: <span className="font-semibold text-foreground">{selectedMail.dest}</span>
                  </p>
                  <p>
                    Data de envio: <span className="font-semibold text-foreground">{selectedMail.fullDate}</span>
                  </p>
                </div>
              </div>

              {/* Email Body */}
              <div className="py-5 max-h-[60vh] md:max-h-[300px] overflow-y-auto">
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-text whitespace-pre-wrap">
                  {selectedMail.body}
                </p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between text-xxs text-muted-foreground font-text font-medium mt-auto">
              <span className="flex items-center gap-1">
                <Eye size={12} className="text-emerald-600" />
                Status: {selectedMail.open}
              </span>
              <span>Demonstração de Leitura</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
