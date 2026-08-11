"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  X,
  AlertCircle,
  Calendar,
  FileText,
  MapPin,
} from "lucide-react";
import CityCombobox from "@/components/CityCombobox";
import { Toaster } from "@/components/Toaster";
import { useToast } from "@/lib/useToast";

interface Ata {
  id: string;
  numero: string;
  orgao: string;
}

type StatusRepresentante = "waiting_letter" | "active" | "waitlist" | "expired";

interface Representante {
  id: string;
  ataId: string;
  nome: string;
  cidade: string;
  status: StatusRepresentante;
  waitingDeadline: string;
  ata: Ata;
}

interface MarcaAtiva {
  marcaId: string;
  marcaNome: string;
  papel: "admin" | "gestor_atas" | "financeiro" | "vendedor";
}

const STATUS_CONFIG: Record<StatusRepresentante, { label: string; className: string; dot: string }> = {
  active: {
    label: "Adesão Aprovada",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  waiting_letter: {
    label: "Aguardando Ofício",
    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    dot: "bg-amber-500",
  },
  waitlist: {
    label: "Em Fila de Espera",
    className: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
    dot: "bg-orange-500",
  },
  expired: {
    label: "Prazo Vencido",
    className: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    dot: "bg-rose-500",
  },
};

const PAPEIS_ESCRITA = ["admin", "gestor_atas"];

export default function RepresentantesPage() {
  const { toast } = useToast();

  const [marcaAtiva, setMarcaAtiva] = useState<MarcaAtiva | null>(null);
  const [prazoPadrao, setPrazoPadrao] = useState(30);
  const [atas, setAtas] = useState<Ata[]>([]);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filtroAtaId, setFiltroAtaId] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusRepresentante | "">("");

  // Modal / form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formAtaId, setFormAtaId] = useState("");
  const [formCidade, setFormCidade] = useState("");
  const [formDias, setFormDias] = useState(30);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRepresentantes = useCallback(
    async (marcaId: string) => {
      const params = new URLSearchParams({ marcaId });
      if (filtroAtaId) params.set("ataId", filtroAtaId);
      if (filtroCidade) params.set("cidade", filtroCidade);
      if (filtroStatus) params.set("status", filtroStatus);

      const res = await fetch(`/api/representantes?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao carregar representantes.");
      }
      const data = await res.json();
      setRepresentantes(data.representantes);
    },
    [filtroAtaId, filtroCidade, filtroStatus]
  );

  // Initial load: resolve active brand, then atas + representantes
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

        const atasRes = await fetch(`/api/atas?marcaId=${marca.marcaId}`);
        if (!atasRes.ok) throw new Error("Falha ao carregar atas.");
        const { atas: atasData } = await atasRes.json();
        if (cancelled) return;
        setAtas(atasData);

        const configRes = await fetch("/api/configuracoes");
        if (configRes.ok) {
          const { configuracao } = await configRes.json();
          if (!cancelled) {
            setPrazoPadrao(configuracao.prazoPadraoDias);
            setFormDias(configuracao.prazoPadraoDias);
          }
        }

        await fetchRepresentantes(marca.marcaId);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch representantes whenever filters change (after initial load)
  useEffect(() => {
    if (!marcaAtiva) return;
    fetchRepresentantes(marcaAtiva.marcaId).catch((err) =>
      setError(err instanceof Error ? err.message : "Erro ao filtrar.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroAtaId, filtroCidade, filtroStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!marcaAtiva) return;
    if (!formNome.trim() || !formAtaId || !formCidade.trim()) {
      setFormError("Nome, ata e cidade são obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/representantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId: marcaAtiva.marcaId,
          ataId: formAtaId,
          nome: formNome.trim(),
          cidade: formCidade.trim(),
          waitingDays: formDias,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Falha ao cadastrar representante.");
        return;
      }

      await fetchRepresentantes(marcaAtiva.marcaId);

      if (data.duplicado) {
        toast({
          description: `${data.representante.nome} entrou em fila de espera: já existe "${data.duplicado.nome}" ativo/pendente nesta cidade+ata.`,
        });
      } else {
        toast({ description: `Representante ${data.representante.nome} cadastrado com sucesso.` });
      }

      setFormNome("");
      setFormAtaId("");
      setFormCidade("");
      setFormDias(prazoPadrao);
      setIsModalOpen(false);
    } catch {
      setFormError("Erro de rede ao cadastrar representante.");
    } finally {
      setSubmitting(false);
    }
  };

  const podeEscrever = marcaAtiva ? PAPEIS_ESCRITA.includes(marcaAtiva.papel) : false;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-slide-down">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display">
            Representantes
          </h2>
          <p className="text-muted-foreground text-xs mt-1.5 font-text">
            Gerencie os representantes cadastrados e suas respectivas cidades de venda
            {marcaAtiva ? ` — ${marcaAtiva.marcaNome}` : ""}.
          </p>
        </div>
        {podeEscrever && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl shrink-0 shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus size={16} />
            Novo Representante
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-gray-200 dark:border-neutral-800 p-4 rounded-[12px] animate-fade-in-slide-down [animation-delay:100ms]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Filtrar por cidade..."
            value={filtroCidade}
            onChange={(e) => setFiltroCidade(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-text"
          />
        </div>

        <select
          value={filtroAtaId}
          onChange={(e) => setFiltroAtaId(e.target.value)}
          className="px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
        >
          <option value="">Todas as atas</option>
          {atas.map((ata) => (
            <option key={ata.id} value={ata.id}>
              {ata.numero}
            </option>
          ))}
        </select>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as StatusRepresentante | "")}
          className="px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
            <option key={value} value={value}>
              {cfg.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto space-y-2">
          <AlertCircle size={28} className="mx-auto text-destructive" />
          <p className="text-sm font-semibold text-foreground font-text">{error}</p>
        </div>
      ) : representantes.length === 0 ? (
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto animate-fade-in-slide-up [animation-delay:150ms]">
          <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mx-auto mb-4 border border-border">
            <Users size={22} />
          </div>
          <h3 className="font-bold text-sm text-foreground font-display">Nenhum Representante</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-text">
            {filtroAtaId || filtroCidade || filtroStatus
              ? "Nenhum representante corresponde aos filtros atuais."
              : "Adicione representantes de vendas e associe-os a cidades para gerenciar suas cotas de atas."}
          </p>
          {podeEscrever && !filtroAtaId && !filtroCidade && !filtroStatus && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-foreground hover:opacity-90 text-background font-semibold text-xs px-4 py-2 rounded-xl transition-opacity"
            >
              Cadastrar Representante
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm overflow-hidden animate-fade-in-slide-up [animation-delay:150ms]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-800 bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase font-text">
                  <th className="p-4">Representante</th>
                  <th className="p-4">Ata</th>
                  <th className="p-4">Cidade</th>
                  <th className="p-4">Prazo do Ofício</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {representantes.map((rep) => {
                  const cfg = STATUS_CONFIG[rep.status];
                  return (
                    <tr key={rep.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-semibold text-foreground font-text">{rep.nome}</td>
                      <td className="p-4 text-muted-foreground font-text">
                        <div className="flex items-center gap-1.5">
                          <FileText size={12} className="text-muted-foreground/70" />
                          <span>{rep.ata.numero}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-text">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-muted-foreground/70" />
                          <span>{rep.cidade}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-text">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-muted-foreground/70" />
                          <span>{new Date(rep.waitingDeadline).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold ${cfg.className}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider font-display">
                Novo Representante
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleCreate} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
                    <AlertCircle size={14} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Nome do Representante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva Representações"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Ata de Registro de Preços
                  </label>
                  <select
                    value={formAtaId}
                    onChange={(e) => setFormAtaId(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                    required
                  >
                    <option value="">Selecione a ata...</option>
                    {atas.map((ata) => (
                      <option key={ata.id} value={ata.id}>
                        {ata.numero}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Cidade Pretendida de Venda
                  </label>
                  <CityCombobox
                    value={formCidade}
                    onChange={setFormCidade}
                    placeholder="Busque a cidade (ex: São Paulo)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Dias de Espera para o Ofício
                  </label>
                  <input
                    type="number"
                    value={formDias}
                    onChange={(e) => setFormDias(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                    required
                  />
                  <span className="text-[9px] text-muted-foreground block mt-0.5 font-text">
                    Prazo em dias corridos para o envio formal do ofício.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-semibold text-xs py-2.5 rounded-xl transition-colors mt-2"
                >
                  <Plus size={14} />
                  {submitting ? "Cadastrando..." : "Cadastrar Representante"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
