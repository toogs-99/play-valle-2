"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FolderCard from "@/components/FolderCard";
import {
  Plus,
  Search,
  X,
  AlertCircle,
  MoreVertical,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Toaster } from "@/components/Toaster";
import { useToast } from "@/lib/useToast";

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
  const { toast } = useToast();

  const [marcaAtiva, setMarcaAtiva] = useState<MarcaAtiva | null>(null);
  const [atas, setAtas] = useState<Ata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // iOS-style Delete Mode state
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ataParaExcluir, setAtaParaExcluir] = useState<Ata | null>(null);
  const [excluindoAta, setExcluindoAta] = useState(false);
  const [excluirErro, setExcluirErro] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Form state
  const [numero, setNumero] = useState("");
  const [orgao, setOrgao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorAta, setValorAta] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (ataParaExcluir) {
          setAtaParaExcluir(null);
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
        } else if (isDeleteMode) {
          setIsDeleteMode(false);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ataParaExcluir, isMenuOpen, isDeleteMode]);

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
      toast({
        description: "Ata cadastrada com sucesso!",
      });
    } catch {
      setFormError("Erro de rede ao cadastrar ata.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAta = async () => {
    if (!ataParaExcluir) return;
    setExcluindoAta(true);
    setExcluirErro("");

    try {
      const res = await fetch(`/api/atas/${ataParaExcluir.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setExcluirErro(data.error || "Falha ao excluir a ata.");
        return;
      }

      const numeroRemovido = ataParaExcluir.numero;
      setAtas((prev) => prev.filter((a) => a.id !== ataParaExcluir.id));
      toast({
        description: `Ata "${numeroRemovido}" excluída com sucesso.`,
      });
      setAtaParaExcluir(null);

      if (atas.length <= 1) {
        setIsDeleteMode(false);
      }
    } catch {
      setExcluirErro("Erro de rede ao tentar excluir a ata.");
    } finally {
      setExcluindoAta(false);
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
      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-slide-down">
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
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isDeleteMode ? (
              <button
                onClick={() => setIsDeleteMode(false)}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
              >
                <Check size={16} />
                Concluir
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl shrink-0 shadow-sm transition-colors"
                >
                  <Plus size={16} />
                  Nova Ata
                </button>

                {/* 3 Pontinhos */}
                <div className="relative z-40" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    aria-label="Mais opções"
                    className="p-2.5 bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm transition-colors cursor-pointer"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-gray-200 dark:border-neutral-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsDeleteMode(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                      >
                        <Trash2 size={15} />
                        Excluir atas
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete mode notice banner */}
      {isDeleteMode && (
        <div className="relative z-20 flex items-center justify-between p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-text animate-fade-in-slide-down">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>
              <strong>Modo de exclusão ativado:</strong> Clique no <strong>X</strong> no topo de cada pasta para removê-la.
            </span>
          </div>
          <button
            onClick={() => setIsDeleteMode(false)}
            className="font-bold underline hover:opacity-80 text-xs ml-4 cursor-pointer"
          >
            Concluir
          </button>
        </div>
      )}

      {/* Search and counters */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-gray-200 dark:border-neutral-800 p-4 rounded-[12px] animate-fade-in-slide-down [animation-delay:100ms]">
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
          {filteredAtas.map((ata, index) => (
            <div key={ata.id} className="flex flex-col items-center gap-1">
              <FolderCard
                number={ata.numero}
                organ={ata.orgao}
                onClick={() => router.push(`/atas/${ata.id}`)}
                isDeleteMode={isDeleteMode}
                onDeleteClick={() => {
                  setExcluirErro("");
                  setAtaParaExcluir(ata);
                }}
                index={index}
              />
              <span className="text-[10px] font-bold text-primary font-text">
                {Number(ata.valorAta).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {ataParaExcluir && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => !excluindoAta && setAtaParaExcluir(null)} />
          <div className="bg-card border border-border rounded-3xl shadow-2xl p-6 w-full max-w-md relative z-[101] animate-scale-in">
            {/* Red Alert Icon */}
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/20">
              <Trash2 size={24} />
            </div>

            <h3 className="font-bold text-base text-foreground font-display text-center">
              Excluir Pasta da Ata?
            </h3>

            <p className="text-xs text-muted-foreground text-center mt-1.5 font-text">
              Você está prestes a excluir a ata <strong className="text-foreground">{ataParaExcluir.numero}</strong>.
            </p>

            {/* Details Box */}
            <div className="mt-4 p-3.5 bg-muted/40 border border-border rounded-xl space-y-1.5 font-text text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Número:</span>
                <span className="font-semibold text-foreground">{ataParaExcluir.numero}</span>
              </div>
              {ataParaExcluir.orgao && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Órgão:</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]" title={ataParaExcluir.orgao}>
                    {ataParaExcluir.orgao}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor fixo da Ata:</span>
                <span className="font-bold text-primary">
                  {Number(ataParaExcluir.valorAta).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>

            {/* Warning Callout */}
            <div className="mt-3.5 p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs flex items-start gap-2 border border-rose-200 dark:border-rose-500/20">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>
                <strong>Atenção:</strong> Esta ação é irreversível. Todos os representantes, ofícios e vendas vinculados a esta ata serão permanentemente excluídos.
              </span>
            </div>

            {excluirErro && (
              <div className="mt-3 p-3 bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xxs flex items-center gap-1.5 border border-rose-300 dark:border-rose-900">
                <AlertCircle size={14} className="shrink-0" />
                <span>{excluirErro}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-5 mt-5 border-t border-border">
              <button
                type="button"
                disabled={excluindoAta}
                onClick={() => setAtaParaExcluir(null)}
                className="flex-1 px-4 py-2.5 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindoAta}
                onClick={handleDeleteAta}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {excluindoAta ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Sim, Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="bg-card border border-border rounded-3xl shadow-2xl p-6 w-full max-w-md relative z-[101] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-sm text-foreground font-display">Cadastrar Nova Ata</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                  className="flex-1 px-4 py-2 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {submitting ? "Criando..." : "Criar Pasta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
