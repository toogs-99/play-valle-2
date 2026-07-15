"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAtas } from "@/hooks/useAtas";
import {
  AlertCircle,
  Clock,
  Send,
  Calendar,
  ChevronRight,
  UserCheck,
  Building,
  Info
} from "lucide-react";

export default function AlertasPage() {
  const router = useRouter();
  const { atas, representantes, oficios, autorizacoes, loading } = useAtas();

  // Filter dynamic expired items
  const prazosVencidos = representantes
    .filter((r) => r.status === "expired")
    .map((r) => {
      const parentAta = atas.find((a) => a.id === r.ataId);
      return {
        ...r,
        ataName: parentAta ? parentAta.number : "Ata não especificada",
      };
    });

  // Filter dynamic waiting items
  const aguardandoOficio = representantes
    .filter((r) => r.status === "waiting_letter")
    .map((r) => {
      const parentAta = atas.find((a) => a.id === r.ataId);
      return {
        ...r,
        ataName: parentAta ? parentAta.number : "Ata não especificada",
      };
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header Intro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-slide-down">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display">
            Central de Alertas e Prazos
          </h2>
          <p className="text-muted-foreground text-xs mt-1.5 font-text">
            Monitore prazos de reserva de cotas vencidos e o andamento de envio dos ofícios dos representantes.
          </p>
          <p className="text-muted-foreground/80 text-xxs mt-1.5 font-text font-medium">
            {atas.length} {atas.length === 1 ? "ata monitorada" : "atas monitoradas"} · {autorizacoes.length} {autorizacoes.length === 1 ? "adesão aprovada" : "adesões aprovadas"}
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl animate-fade-in-slide-down [animation-delay:100ms]">
        {/* Card 1: Vencidos */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Prazos Expirados
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                {prazosVencidos.length}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 2: Aguardando Ofício */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Aguardando Ofício
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                {aguardandoOficio.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Alert Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:200ms]">
        
        {/* Left Side: Prazos Expirados List */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300 relative">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-neutral-800 bg-muted/30 flex items-center justify-between rounded-t-[12px]">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <h3 className="font-bold text-sm text-foreground font-display">
                Prazos Expirados (Sem Envio de Ofício)
              </h3>
              <div className="relative group/tooltip flex items-center">
                <Info size={14} className="text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 text-[10px] rounded-lg shadow-md opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-center font-normal font-text leading-normal">
                  Os prazos expiram automaticamente se o ofício não for anexado em até 10 dias úteis.
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-neutral-800 flex-1">
            {prazosVencidos.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-3">
                <UserCheck size={24} className="mx-auto text-muted-foreground/60" />
                <p className="text-xs font-medium font-text">Nenhum prazo de cota vencido!</p>
              </div>
            ) : (
              prazosVencidos.map((prazo) => (
                <button
                  key={prazo.id}
                  onClick={() => router.push(`/atas/${prazo.ataId}`)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-muted/30 active:bg-muted/50 transition-colors group text-left border-0 bg-transparent cursor-pointer last:rounded-b-[12px]"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground font-text">
                      {prazo.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xxs text-muted-foreground font-text leading-relaxed">
                      <span>{prazo.ataName}</span>
                      <span>·</span>
                      <span>{prazo.region}</span>
                      <span>·</span>
                      <span className="text-destructive font-semibold flex items-center gap-0.5 whitespace-nowrap">
                        <Calendar size={10} />
                        Venceu em {prazo.waitingDeadline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-4">
                    <ChevronRight size={16} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Aguardando Envio de Ofício List */}
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300 relative">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-neutral-800 bg-muted/30 flex items-center justify-between rounded-t-[12px]">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-sm text-foreground font-display">
                Aguardando Envio de Ofício (Em Prazo)
              </h3>
              <div className="relative group/tooltip flex items-center">
                <Info size={14} className="text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 text-[10px] rounded-lg shadow-md opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-center font-normal font-text leading-normal">
                  Representantes com reservas ativas e aguardando anexação de documentos formais de adesão.
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-neutral-800 flex-1">
            {aguardandoOficio.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-3">
                <Clock size={24} className="mx-auto text-muted-foreground/60" />
                <p className="text-xs font-medium font-text">Nenhum representante em aguardo de ofício.</p>
              </div>
            ) : (
              aguardandoOficio.map((oficio) => (
                <button
                  key={oficio.id}
                  onClick={() => router.push(`/atas/${oficio.ataId}`)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-muted/30 active:bg-muted/50 transition-colors group text-left border-0 bg-transparent cursor-pointer last:rounded-b-[12px]"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground font-text">
                      {oficio.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xxs text-muted-foreground font-text leading-relaxed">
                      <span>{oficio.ataName}</span>
                      <span>·</span>
                      <span>{oficio.region}</span>
                      <span>·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5 whitespace-nowrap">
                        <Send size={10} />
                        Prazo: {oficio.waitingDeadline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-4">
                    <ChevronRight size={16} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Info Notice Box */}
      <div className="p-6 rounded-[12px] bg-primary text-primary-foreground flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md relative overflow-hidden animate-fade-in-slide-up [animation-delay:300ms] group/notice">
        <div className="absolute -right-4 -bottom-10 w-40 h-40 bg-background/10 rounded-full pointer-events-none transition-transform group-hover/notice:scale-105 duration-500" />
        <div className="space-y-1 relative z-10">
          <h4 className="text-sm font-bold flex items-center gap-1.5 font-display">
            <AlertCircle size={16} className="text-primary-foreground/80" />
            Nova regra para regiões coincidentes
          </h4>
          <p className="text-[11px] text-primary-foreground/90 max-w-2xl leading-normal font-text">
            Caso tente cadastrar um representante para uma região que já possui reserva ativa, o sistema irá alertar sobre o conflito e informar a data de espera do representante atual para o envio do ofício correspondente.
          </p>
        </div>
        <button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all font-semibold text-xs px-4 py-2 rounded-xl shrink-0 shadow-sm relative z-10 hover:scale-[1.02] active:scale-[0.98]">
          Entendi
        </button>
      </div>
    </div>
  );
}

