"use client";

import React, { useEffect, useState } from "react";
import { Settings, Calendar, Users, Mail, AlertCircle, Lock } from "lucide-react";
import { Toaster } from "@/components/Toaster";
import { useToast } from "@/lib/useToast";

interface Configuracao {
  prazoPadraoDias: number;
  limiteRepresentantesPorRegiao: number | null;
  alertasEmailAtivo: boolean;
  alertasEmailDestinatarios: string[];
}

export default function ConfiguracoesPage() {
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [configuracao, setConfiguracao] = useState<Configuracao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Form state
  const [prazoPadraoDias, setPrazoPadraoDias] = useState(30);
  const [temLimite, setTemLimite] = useState(false);
  const [limiteRepresentantesPorRegiao, setLimiteRepresentantesPorRegiao] = useState(1);
  const [alertasEmailAtivo, setAlertasEmailAtivo] = useState(false);
  const [destinatariosTexto, setDestinatariosTexto] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError("");
      try {
        const [configRes, sessionRes] = await Promise.all([
          fetch("/api/configuracoes"),
          fetch("/api/auth/session"),
        ]);

        if (!configRes.ok) throw new Error("Falha ao carregar configurações.");
        const { configuracao: config } = await configRes.json();
        if (cancelled) return;

        setConfiguracao(config);
        setPrazoPadraoDias(config.prazoPadraoDias);
        setTemLimite(config.limiteRepresentantesPorRegiao !== null);
        setLimiteRepresentantesPorRegiao(config.limiteRepresentantesPorRegiao ?? 1);
        setAlertasEmailAtivo(config.alertasEmailAtivo);
        setDestinatariosTexto(config.alertasEmailDestinatarios.join(", "));

        const session = await sessionRes.json().catch(() => null);
        const marcas: { papel: string }[] = session?.user?.marcas ?? [];
        if (!cancelled) setIsAdmin(marcas.some((m) => m.papel === "admin"));
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
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setSaving(true);
    try {
      const destinatarios = destinatariosTexto
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);

      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prazoPadraoDias,
          limiteRepresentantesPorRegiao: temLimite ? limiteRepresentantesPorRegiao : null,
          alertasEmailAtivo,
          alertasEmailDestinatarios: destinatarios,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ description: data.error || "Falha ao salvar configurações." });
        return;
      }

      setConfiguracao(data.configuracao);
      toast({ description: "Configurações salvas com sucesso!" });
    } catch {
      toast({ description: "Erro de rede ao salvar configurações." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Toaster />

      <div>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display">
          Configurações
        </h2>
        <p className="text-muted-foreground text-xs mt-1.5 font-text">
          Gerencie as diretrizes gerais do LicitFlow, prazos padrão e alertas.
        </p>
      </div>

      {!loading && !isAdmin && (
        <div className="p-3 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-amber-200 dark:border-amber-500/20">
          <Lock size={14} />
          <span>Você não é administrador em nenhuma marca — os campos abaixo são somente leitura.</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error || !configuracao ? (
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl p-12 text-center space-y-2">
          <AlertCircle size={28} className="mx-auto text-destructive" />
          <p className="text-sm font-semibold text-foreground font-text">{error || "Configuração indisponível."}</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Card: Prazo padrão */}
          <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Calendar size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground font-display">Prazo Padrão de Espera</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-text">
                  Número de dias corridos usado como padrão quando um novo representante é vinculado a uma ata, caso o prazo não seja informado manualmente.
                </p>
              </div>
            </div>

            <div className="pl-[52px] space-y-1 max-w-xs">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                Dias corridos
              </label>
              <input
                type="number"
                value={prazoPadraoDias}
                onChange={(e) => setPrazoPadraoDias(Number(e.target.value))}
                min={1}
                max={365}
                disabled={!isAdmin}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Card: Limite de cota */}
          <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground font-display">Limite de Cota por Região</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-text">
                  Quantidade máxima de representantes ativos/pendentes permitidos na mesma cidade dentro de uma mesma ata. Deixe desativado para não aplicar limite.
                </p>
              </div>
            </div>

            <div className="pl-[52px] space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground font-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={temLimite}
                  onChange={(e) => setTemLimite(e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 rounded border-border accent-[var(--primary)] disabled:cursor-not-allowed"
                />
                Aplicar limite de cota
              </label>

              {temLimite && (
                <div className="space-y-1 max-w-xs animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Máximo de representantes por cidade
                  </label>
                  <input
                    type="number"
                    value={limiteRepresentantesPorRegiao}
                    onChange={(e) => setLimiteRepresentantesPorRegiao(Number(e.target.value))}
                    min={1}
                    disabled={!isAdmin}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card: Alertas de e-mail */}
          <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground font-display">Alertas por E-mail</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-text">
                  Armazena a preferência e a lista de destinatários. O envio real de e-mail é uma integração futura — aqui só guardamos a configuração.
                </p>
              </div>
            </div>

            <div className="pl-[52px] space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground font-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertasEmailAtivo}
                  onChange={(e) => setAlertasEmailAtivo(e.target.checked)}
                  disabled={!isAdmin}
                  className="h-4 w-4 rounded border-border accent-[var(--primary)] disabled:cursor-not-allowed"
                />
                Ativar alertas por e-mail
              </label>

              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                  Destinatários (separados por vírgula)
                </label>
                <textarea
                  value={destinatariosTexto}
                  onChange={(e) => setDestinatariosTexto(e.target.value)}
                  rows={2}
                  placeholder="financeiro@empresa.com, gestor@empresa.com"
                  disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              <Settings size={14} />
              {saving ? "Salvando..." : "Salvar Configurações"}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
