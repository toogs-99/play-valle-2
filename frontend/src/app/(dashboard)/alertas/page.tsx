"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Clock,
  Send,
  Calendar,
  ChevronRight,
  UserCheck,
  Info,
  Plus,
  X,
  Trash2,
  Megaphone,
} from "lucide-react";
import { Toaster } from "@/components/Toaster";
import { useToast } from "@/lib/useToast";

interface MarcaAtiva {
  marcaId: string;
  marcaNome: string;
  papel: "admin" | "gestor_atas" | "financeiro" | "vendedor";
}

interface RepresentanteAlerta {
  id: string;
  nome: string;
  cidade: string;
  waitingDeadline: string;
  ataId: string;
  ataNumero: string;
}

interface Aviso {
  id: string;
  titulo: string;
  mensagem: string;
  createdAt: string;
  criadoPor: { id: string; nome: string } | null;
}

const DISMISSED_KEY = "licitflow_avisos_dispensados";
const PAPEIS_ESCRITA = ["admin", "gestor_atas"];

export default function AlertasPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [marcaAtiva, setMarcaAtiva] = useState<MarcaAtiva | null>(null);
  const [prazosVencidos, setPrazosVencidos] = useState<RepresentanteAlerta[]>([]);
  const [aguardandoOficio, setAguardandoOficio] = useState<RepresentanteAlerta[]>([]);
  const [totalAtas, setTotalAtas] = useState(0);
  const [totalAutorizacoes, setTotalAutorizacoes] = useState(0);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAvisoModalOpen, setIsAvisoModalOpen] = useState(false);
  const [avisoTitulo, setAvisoTitulo] = useState("");
  const [avisoMensagem, setAvisoMensagem] = useState("");
  const [avisoError, setAvisoError] = useState("");
  const [savingAviso, setSavingAviso] = useState(false);
  const [deletingAvisoId, setDeletingAvisoId] = useState<string | null>(null);

  const fetchAlertas = useCallback(async (marcaId: string) => {
    const [expiradosRes, aguardandoRes, atasRes, autorizacoesRes, avisosRes] = await Promise.all([
      fetch(`/api/representantes?marcaId=${marcaId}&status=expired`),
      fetch(`/api/representantes?marcaId=${marcaId}&status=waiting_letter`),
      fetch(`/api/atas?marcaId=${marcaId}`),
      fetch(`/api/autorizacoes?marcaId=${marcaId}`),
      fetch(`/api/avisos?marcaId=${marcaId}`),
    ]);

    if (!expiradosRes.ok || !aguardandoRes.ok) throw new Error("Falha ao carregar alertas.");

    const mapRep = (r: any): RepresentanteAlerta => ({
      id: r.id,
      nome: r.nome,
      cidade: r.cidade,
      waitingDeadline: r.waitingDeadline,
      ataId: r.ata.id,
      ataNumero: r.ata.numero,
    });

    const { representantes: expirados } = await expiradosRes.json();
    const { representantes: aguardando } = await aguardandoRes.json();
    setPrazosVencidos(expirados.map(mapRep));
    setAguardandoOficio(aguardando.map(mapRep));

    if (atasRes.ok) {
      const { atas } = await atasRes.json();
      setTotalAtas(atas.length);
    }
    if (autorizacoesRes.ok) {
      const { autorizacoes } = await autorizacoesRes.json();
      setTotalAutorizacoes(autorizacoes.length);
    }
    if (avisosRes.ok) {
      const { avisos: avisosData } = await avisosRes.json();
      setAvisos(avisosData);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    try {
      const stored = sessionStorage.getItem(DISMISSED_KEY);
      if (stored) setDismissedIds(JSON.parse(stored));
    } catch {
      // sessionStorage indisponível — segue sem persistência de dispensa
    }

    async function init() {
      setLoading(true);
      setError("");
      try {
        const marcaRes = await fetch("/api/marca-ativa");
        if (!marcaRes.ok) throw new Error("Não foi possível identificar a marca ativa.");
        const { marcaAtiva: marca } = await marcaRes.json();
        if (cancelled) return;
        setMarcaAtiva(marca);

        await fetchAlertas(marca.marcaId);
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
  }, [fetchAlertas]);

  const podeEscrever = marcaAtiva ? PAPEIS_ESCRITA.includes(marcaAtiva.papel) : false;

  const dispensarAviso = (avisoId: string) => {
    const atualizado = [...dismissedIds, avisoId];
    setDismissedIds(atualizado);
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(atualizado));
    } catch {
      // ignora se sessionStorage não estiver disponível
    }
  };

  const avisosVisiveis = avisos.filter((a) => !dismissedIds.includes(a.id));

  const handleCriarAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvisoError("");
    if (!marcaAtiva) return;
    if (!avisoTitulo.trim() || !avisoMensagem.trim()) {
      setAvisoError("Título e mensagem são obrigatórios.");
      return;
    }

    setSavingAviso(true);
    try {
      const res = await fetch("/api/avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId: marcaAtiva.marcaId,
          titulo: avisoTitulo.trim(),
          mensagem: avisoMensagem.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAvisoError(data.error || "Falha ao criar aviso.");
        return;
      }

      setAvisos((prev) => [data.aviso, ...prev]);
      setAvisoTitulo("");
      setAvisoMensagem("");
      setIsAvisoModalOpen(false);
      toast({ description: "Aviso publicado com sucesso!" });
    } catch {
      setAvisoError("Erro de rede ao criar aviso.");
    } finally {
      setSavingAviso(false);
    }
  };

  const handleExcluirAviso = async (avisoId: string) => {
    setDeletingAvisoId(avisoId);
    try {
      const res = await fetch(`/api/avisos/${avisoId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ description: data.error || "Falha ao excluir aviso." });
        return;
      }
      setAvisos((prev) => prev.filter((a) => a.id !== avisoId));
      toast({ description: "Aviso excluído." });
    } catch {
      toast({ description: "Erro de rede ao excluir aviso." });
    } finally {
      setDeletingAvisoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto space-y-2">
        <AlertCircle size={28} className="mx-auto text-destructive" />
        <p className="text-sm font-semibold text-foreground font-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Toaster />

      {/* Page Header Intro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-slide-down">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display">
            Central de Alertas e Prazos
          </h2>
          <p className="text-muted-foreground text-xs mt-1.5 font-text">
            Monitore prazos de reserva de cotas vencidos, o andamento de envio dos ofícios e avisos da equipe
            {marcaAtiva ? ` — ${marcaAtiva.marcaNome}` : ""}.
          </p>
          <p className="text-muted-foreground/80 text-xxs mt-1.5 font-text font-medium">
            {totalAtas} {totalAtas === 1 ? "ata monitorada" : "atas monitoradas"} · {totalAutorizacoes} {totalAutorizacoes === 1 ? "adesão aprovada" : "adesões aprovadas"}
          </p>
        </div>

        {podeEscrever && (
          <button
            onClick={() => {
              setAvisoTitulo("");
              setAvisoMensagem("");
              setAvisoError("");
              setIsAvisoModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl shrink-0 shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus size={16} />
            Novo Aviso
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl animate-fade-in-slide-down [animation-delay:100ms]">
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
                  Prazos vencidos automaticamente por falta de anexação do ofício.
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
                    <h4 className="font-semibold text-sm text-foreground font-text">{prazo.nome}</h4>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xxs text-muted-foreground font-text leading-relaxed">
                      <span>{prazo.ataNumero}</span>
                      <span>·</span>
                      <span>{prazo.cidade}</span>
                      <span>·</span>
                      <span className="text-destructive font-semibold flex items-center gap-0.5 whitespace-nowrap">
                        <Calendar size={10} />
                        Venceu em {new Date(prazo.waitingDeadline).toLocaleDateString("pt-BR")}
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
              aguardandoOficio.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/atas/${item.ataId}`)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-muted/30 active:bg-muted/50 transition-colors group text-left border-0 bg-transparent cursor-pointer last:rounded-b-[12px]"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground font-text">{item.nome}</h4>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xxs text-muted-foreground font-text leading-relaxed">
                      <span>{item.ataNumero}</span>
                      <span>·</span>
                      <span>{item.cidade}</span>
                      <span>·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5 whitespace-nowrap">
                        <Send size={10} />
                        Prazo: {new Date(item.waitingDeadline).toLocaleDateString("pt-BR")}
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

      {/* Avisos (custom, criados manualmente) */}
      {avisosVisiveis.length > 0 && (
        <div className="space-y-4 animate-fade-in-slide-up [animation-delay:300ms]">
          {avisosVisiveis.map((aviso) => (
            <div
              key={aviso.id}
              className="p-6 rounded-[12px] bg-primary text-primary-foreground flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md relative overflow-hidden group/notice"
            >
              <div className="absolute -right-4 -bottom-10 w-40 h-40 bg-background/10 rounded-full pointer-events-none transition-transform group-hover/notice:scale-105 duration-500" />
              <div className="space-y-1 relative z-10">
                <h4 className="text-sm font-bold flex items-center gap-1.5 font-display">
                  <Megaphone size={16} className="text-primary-foreground/80" />
                  {aviso.titulo}
                </h4>
                <p className="text-[11px] text-primary-foreground/90 max-w-2xl leading-normal font-text">
                  {aviso.mensagem}
                </p>
                <p className="text-[10px] text-primary-foreground/70 font-text">
                  {aviso.criadoPor ? `Publicado por ${aviso.criadoPor.nome} em ` : "Publicado em "}
                  {new Date(aviso.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-2 relative z-10 shrink-0">
                {podeEscrever && (
                  <button
                    onClick={() => handleExcluirAviso(aviso.id)}
                    disabled={deletingAvisoId === aviso.id}
                    title="Excluir aviso para todos"
                    className="p-2 rounded-xl text-primary-foreground/70 hover:text-primary-foreground hover:bg-background/10 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => dispensarAviso(aviso.id)}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all font-semibold text-xs px-4 py-2 rounded-xl shrink-0 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aviso creation modal */}
      {isAvisoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsAvisoModalOpen(false)} />
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider font-display">
                Novo Aviso
              </h3>
              <button
                onClick={() => setIsAvisoModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleCriarAviso} className="space-y-4">
                {avisoError && (
                  <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
                    <AlertCircle size={14} />
                    <span>{avisoError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Título
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Nova regra para regiões coincidentes"
                    value={avisoTitulo}
                    onChange={(e) => setAvisoTitulo(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Mensagem
                  </label>
                  <textarea
                    placeholder="Escreva o aviso que a equipe deve ver na Central de Alertas..."
                    value={avisoMensagem}
                    onChange={(e) => setAvisoMensagem(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingAviso}
                  className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-semibold text-xs py-2.5 rounded-xl transition-colors mt-2 cursor-pointer"
                >
                  <Plus size={14} />
                  {savingAviso ? "Publicando..." : "Publicar Aviso"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
