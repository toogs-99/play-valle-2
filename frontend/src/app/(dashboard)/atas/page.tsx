"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FolderCard from "@/components/FolderCard";
import { Plus, Search, X, AlertCircle } from "lucide-react";

interface Ata {
  id: string;
  numero: string;
  orgao: string;
  descricao: string | null;
  valorAta: string;
  createdAt: string;
}

interface MarcaAtiva {
  marcaId: string;
  marcaNome: string;
  papel: "admin" | "gestor_atas" | "financeiro" | "vendedor";
}

const PAPEIS_ESCRITA = ["admin", "gestor_atas"];

export default function AtasPage() {
  const router = useRouter();

  const [marcaAtiva, setMarcaAtiva] = useState<MarcaAtiva | null>(null);
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [numero, setNumero] = useState("");
  const [orgao, setOrgao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorAta, setValorAta] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAtas = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/atas?marcaId=${marcaId}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Falha ao carregar atas.");
    }
    const data = await res.json();
    setAtas(data.atas);
  }, []);

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
        await fetchAtas(marca.marcaId);
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
  }, [fetchAtas]);

  const handleCreateAta = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!marcaAtiva) return;
    if (!numero.trim()) {
      setFormError("O Número da Ata é obrigatório.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/atas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId: marcaAtiva.marcaId,
          numero: numero.trim(),
          orgao: orgao.trim(),
          descricao: descricao.trim() || null,
          valorAta: valorAta ? Number(valorAta) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Falha ao cadastrar ata.");
        return;
      }

      await fetchAtas(marcaAtiva.marcaId);

      setNumero("");
      setOrgao("");
      setDescricao("");
      setValorAta("");
      setIsModalOpen(false);
    } catch {
      setFormError("Erro de rede ao cadastrar ata.");
    } finally {
      setSubmitting(false);
    }
  };

  const podeEscrever = marcaAtiva ? PAPEIS_ESCRITA.includes(marcaAtiva.papel) : false;

  const filteredAtas = atas.filter(
    (ata) =>
      ata.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ata.orgao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ata.descricao ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-slide-down">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display">
            Atas de Registro de Preços
          </h2>
          <p className="text-muted-foreground text-xs mt-1.5 font-text">
            Selecione uma pasta para ver detalhes, representantes, modelos e ofícios
            {marcaAtiva ? ` — ${marcaAtiva.marcaNome}` : ""}.
          </p>
        </div>
        {podeEscrever && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl shrink-0 shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus size={16} />
            Nova Ata
          </button>
        )}
      </div>

      {/* Search and counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-gray-200 dark:border-neutral-800 p-4 rounded-[12px] animate-fade-in-slide-down [animation-delay:100ms]">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Filtrar por número, órgão ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-text"
          />
        </div>
        <div className="text-xxs font-medium text-muted-foreground font-text">
          Mostrando {filteredAtas.length} de {atas.length} atas cadastradas
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto space-y-2">
          <AlertCircle size={28} className="mx-auto text-destructive" />
          <p className="text-sm font-semibold text-foreground font-text">{error}</p>
        </div>
      ) : filteredAtas.length === 0 ? (
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto">
          <h3 className="font-bold text-sm text-foreground font-display">Nenhuma Ata Encontrada</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-text">
            {searchTerm
              ? "Nenhuma ata corresponde ao filtro de pesquisa atual."
              : "Cadastre sua primeira Ata de Registro de Preços para começar."}
          </p>
          {podeEscrever && !searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-foreground hover:opacity-90 text-background font-semibold text-xs px-4 py-2 rounded-xl transition-opacity"
            >
              Cadastrar Ata
            </button>
          )}
        </div>
      ) : (
        /* Folder Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAtas.map((ata) => (
            <div key={ata.id} className="flex flex-col items-center gap-1">
              <FolderCard
                number={ata.numero}
                organ={ata.orgao}
                onClick={() => router.push(`/atas/${ata.id}`)}
              />
              <span className="text-[10px] font-bold text-primary font-text">
                {Number(ata.valorAta).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="bg-card border border-border rounded-3xl shadow-2xl p-6 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-sm text-foreground font-display">Cadastrar Nova Ata</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAta} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                  Número da Ata *
                </label>
                <input
                  type="text"
                  placeholder="Ex: GREAL ATA 003/2026"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                  Órgão
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prefeitura de São José dos Campos"
                  value={orgao}
                  onChange={(e) => setOrgao(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                  Descrição do Objeto
                </label>
                <textarea
                  placeholder="Breve descrição dos itens cobertos pela Ata..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                  Valor da Ata (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 4500.00"
                  value={valorAta}
                  onChange={(e) => setValorAta(e.target.value)}
                  min={0}
                  step="0.01"
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                />
                <span className="text-[9px] text-muted-foreground block mt-0.5 font-text">
                  Valor fixo usado para gerar a Venda de cada adesão aprovada nesta ata.
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  {submitting ? "Criando..." : "Criar Pasta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
