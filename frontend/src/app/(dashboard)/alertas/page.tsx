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
  Building
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
        </div>
        
        {/* Quick Filter Info Tag */}
        <div className="flex gap-2 text-xxs font-semibold bg-card border border-border rounded-xl p-1.5 shadow-sm self-start">
          <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 rounded-lg">
            {prazosVencidos.length} Prazos Vencidos
          </span>
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg">
            {aguardandoOficio.length} Aguardando Ofício
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
        {/* Card 1: Vencidos */}
        <div className="bg-card border border-border p-5 rounded-[var(--radius)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
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
          <p className="text-[10px] text-destructive font-medium mt-3 flex items-center gap-1 font-text">
            Ação imediata recomendada
          </p>
        </div>

        {/* Card 2: Aguardando Ofício */}
        <div className="bg-card border border-border p-5 rounded-[var(--radius)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
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
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-3 flex items-center gap-1 font-text">
            Representantes em prazo regulamentar
          </p>
        </div>

        {/* Card 3: Total Atas */}
        <div className="bg-card border border-border p-5 rounded-[var(--radius)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Atas Monitoradas
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                {atas.length}
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium mt-3 font-text">
            Atas ativas em gerenciamento
          </p>
        </div>

        {/* Card 4: Total Autorizações */}
        <div className="bg-card border border-border p-5 rounded-[var(--radius)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                Adesões Aprovadas
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                {autorizacoes.length}
              </h3>
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-3 font-text">
            Histórico acumulado de adesão
          </p>
        </div>
      </div>

      {/* Main Alert Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:200ms]">
        
        {/* Left Side: Prazos Expirados List */}
        <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <h3 className="font-bold text-sm text-foreground font-display">
                Prazos Expirados (Sem Envio de Ofício)
              </h3>
            </div>
            <span className="text-[10px] bg-destructive/10 border border-destructive/20 text-destructive px-2 py-0.5 rounded-full font-semibold font-text">
              {prazosVencidos.length} Pendências
            </span>
          </div>

          <div className="divide-y divide-border flex-1">
            {prazosVencidos.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-3">
                <UserCheck size={24} className="mx-auto text-muted-foreground/60" />
                <p className="text-xs font-medium font-text">Nenhum prazo de cota vencido!</p>
              </div>
            ) : (
              prazosVencidos.map((prazo) => (
                <div
                  key={prazo.id}
                  className="p-5 flex items-start justify-between hover:bg-muted/40 transition-colors group"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground font-text">
                      {prazo.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xxs text-muted-foreground font-text">
                      <span className="text-foreground font-semibold">{prazo.ataName}</span>
                      <span>•</span>
                      <span>{prazo.region}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Calendar size={10} />
                        Limite era: {prazo.waitingDeadline}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xxs px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-semibold font-text">
                      Expirado
                    </span>
                    <button
                      onClick={() => router.push(`/atas/${prazo.ataId}`)}
                      className="text-[10px] text-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all duration-200"
                    >
                      Ver na Ata
                      <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-border bg-muted/10 text-center">
            <p className="text-[10px] text-muted-foreground font-medium font-text">
              Os prazos expiram automaticamente se o ofício não for anexado em até 10 dias úteis.
            </p>
          </div>
        </div>

        {/* Right Side: Aguardando Envio de Ofício List */}
        <div className="bg-card border border-border rounded-[var(--radius)] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-sm text-foreground font-display">
                Aguardando Envio de Ofício (Em Prazo)
              </h3>
            </div>
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold font-text">
              {aguardandoOficio.length} Em Aguardo
            </span>
          </div>

          <div className="divide-y divide-border flex-1">
            {aguardandoOficio.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-3">
                <Clock size={24} className="mx-auto text-muted-foreground/60" />
                <p className="text-xs font-medium font-text">Nenhum representante em aguardo de ofício.</p>
              </div>
            ) : (
              aguardandoOficio.map((oficio) => (
                <div
                  key={oficio.id}
                  className="p-5 flex items-start justify-between hover:bg-muted/40 transition-colors group"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground font-text">
                      {oficio.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xxs text-muted-foreground font-text">
                      <span className="text-foreground font-semibold">{oficio.ataName}</span>
                      <span>•</span>
                      <span>{oficio.region}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Send size={10} />
                        Prazo Limite: {oficio.waitingDeadline}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xxs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20 font-semibold flex items-center gap-1 font-text">
                      <Clock size={10} />
                      Em prazo
                    </span>
                    <button
                      onClick={() => router.push(`/atas/${oficio.ataId}`)}
                      className="text-[10px] text-muted-foreground hover:text-foreground font-semibold flex items-center gap-0.5 transition-colors"
                    >
                      Acessar Ata
                      <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-border bg-muted/10 text-center">
            <p className="text-[10px] text-muted-foreground font-medium font-text">
              Representantes com reservas ativas e aguardando anexação de documentos formais de adesão.
            </p>
          </div>
        </div>

      </div>

      {/* Info Notice Box */}
      <div className="p-5 rounded-[var(--radius)] bg-primary text-primary-foreground flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md relative overflow-hidden animate-fade-in-slide-up [animation-delay:300ms] group/notice">
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

