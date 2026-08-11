"use client";

import React, { useCallback, useEffect, useState } from "react";
import { LineChart } from "@/components/LineChart";
import { Toaster } from "@/components/Toaster";
import { useToast } from "@/lib/useToast";
import {
  MessageSquare,
  Send,
  CheckCircle,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";

interface MarcaAtiva {
  marcaId: string;
  marcaNome: string;
  papel: "admin" | "gestor_atas" | "financeiro" | "vendedor";
}

interface IntegracaoStatus {
  configurada: boolean;
  wabaId: string | null;
  phoneNumberId: string | null;
  ativo: boolean;
  ultimaSincronizacao: string | null;
  ultimoErro: string | null;
}

interface WhatsappMetrica {
  id: string;
  capturadoEm: string;
  conversasIniciadas: number;
  mensagensEnviadas: number;
  mensagensEntregues: number;
  mensagensLidas: number;
}

type StatusTemplate = "aprovado" | "pendente" | "rejeitado";

interface WhatsappTemplate {
  id: string;
  nome: string;
  status: StatusTemplate;
  categoria: string;
  atualizadoEm: string;
}

// Só admin pode mexer em qualquer nível da integração (configurar ou sincronizar).
const PAPEIS_CONFIGURAR = ["admin"];
const PAPEIS_SINCRONIZAR = ["admin"];

const TEMPLATE_BADGE: Record<StatusTemplate, string> = {
  aprovado: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  pendente: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  rejeitado: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
};

const TEMPLATE_LABEL: Record<StatusTemplate, string> = {
  aprovado: "Aprovado",
  pendente: "Em análise",
  rejeitado: "Rejeitado",
};

export default function WhatsAppPage() {
  const { toast } = useToast();

  const [marcaAtiva, setMarcaAtiva] = useState<MarcaAtiva | null>(null);
  const [integracao, setIntegracao] = useState<IntegracaoStatus | null>(null);
  const [metricas, setMetricas] = useState<WhatsappMetrica[]>([]);
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const [showConfigForm, setShowConfigForm] = useState(false);
  const [formWabaId, setFormWabaId] = useState("");
  const [formPhoneNumberId, setFormPhoneNumberId] = useState("");
  const [formToken, setFormToken] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchIntegracao = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/integracoes/whatsapp?marcaId=${marcaId}`);
    if (!res.ok) throw new Error("Falha ao carregar status da integração.");
    const data = await res.json();
    setIntegracao(data.integracao);
    return data.integracao as IntegracaoStatus;
  }, []);

  const fetchMetricas = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/metricas/whatsapp?marcaId=${marcaId}`);
    if (!res.ok) throw new Error("Falha ao carregar métricas.");
    const data = await res.json();
    setMetricas(data.metricas);
  }, []);

  const fetchTemplates = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/templates/whatsapp?marcaId=${marcaId}`);
    if (!res.ok) throw new Error("Falha ao carregar templates.");
    const data = await res.json();
    setTemplates(data.templates);
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

        const integracaoAtual = await fetchIntegracao(marca.marcaId);
        if (cancelled) return;

        if (integracaoAtual.configurada && integracaoAtual.ultimaSincronizacao) {
          await Promise.all([fetchMetricas(marca.marcaId), fetchTemplates(marca.marcaId)]);
        }
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
  }, [fetchIntegracao, fetchMetricas, fetchTemplates]);

  const podeConfigurar = marcaAtiva ? PAPEIS_CONFIGURAR.includes(marcaAtiva.papel) : false;
  const podeSincronizar = marcaAtiva ? PAPEIS_SINCRONIZAR.includes(marcaAtiva.papel) : false;

  const handleSincronizar = async () => {
    if (!marcaAtiva) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/integracoes/whatsapp/sincronizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marcaId: marcaAtiva.marcaId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ description: data.error || "Falha ao sincronizar." });
        await fetchIntegracao(marcaAtiva.marcaId);
        return;
      }
      toast({ description: "Sincronização concluída!" });
      await Promise.all([
        fetchIntegracao(marcaAtiva.marcaId),
        fetchMetricas(marcaAtiva.marcaId),
        fetchTemplates(marcaAtiva.marcaId),
      ]);
    } catch {
      toast({ description: "Erro de rede ao sincronizar." });
    } finally {
      setSyncing(false);
    }
  };

  const handleSalvarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!marcaAtiva) return;
    if (!formWabaId.trim() || !formPhoneNumberId.trim() || !formToken.trim()) {
      setFormError("Preencha o WABA ID, o Phone Number ID e o Access Token.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/integracoes/whatsapp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId: marcaAtiva.marcaId,
          wabaId: formWabaId.trim(),
          phoneNumberId: formPhoneNumberId.trim(),
          accessToken: formToken.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Falha ao salvar integração.");
        return;
      }

      setIntegracao(data.integracao);
      setFormToken("");
      setShowConfigForm(false);
      toast({ description: "Integração configurada! Clique em \"Sincronizar agora\" para testar." });
    } catch {
      setFormError("Erro de rede ao salvar integração.");
    } finally {
      setSaving(false);
    }
  };

  const ultimaMetrica = metricas[metricas.length - 1] ?? null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-fade-in-slide-down">
        <div>
          <span className="text-xxs font-bold text-primary uppercase tracking-widest font-text">
            Comunicações API Meta
          </span>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display mt-0.5">
            Métricas do WhatsApp
          </h2>
          <p className="text-muted-foreground text-xs mt-1.5 font-text">
            Conversas e templates reais via WhatsApp Business Cloud API, sincronizados por marca.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {podeSincronizar && integracao?.configurada && (
            <button
              onClick={handleSincronizar}
              disabled={syncing}
              className="flex items-center gap-1.5 bg-foreground hover:opacity-90 disabled:opacity-50 text-background font-semibold text-xs px-3.5 py-2 rounded-xl transition-opacity"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Sincronizando..." : "Sincronizar agora"}
            </button>
          )}
          {podeConfigurar && (
            <button
              onClick={() => {
                setFormWabaId(integracao?.wabaId ?? "");
                setFormPhoneNumberId(integracao?.phoneNumberId ?? "");
                setFormToken("");
                setFormError("");
                setShowConfigForm((v) => !v);
              }}
              className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors border border-primary/20"
            >
              <Settings size={14} />
              Configurar Integração
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center space-y-2">
          <AlertCircle size={28} className="mx-auto text-destructive" />
          <p className="text-sm font-semibold text-foreground font-text">{error}</p>
        </div>
      ) : (
        <>
          {/* Config form (admin only) */}
          {showConfigForm && podeConfigurar && (
            <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div>
                <h3 className="font-bold text-sm text-foreground font-display">Credenciais da WhatsApp Business Cloud API</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-text">
                  Obtenha o WhatsApp Business Account ID, o Phone Number ID e um Access Token de sistema no Meta for Developers. O token é criptografado antes de ser salvo e nunca é exibido novamente depois de salvo.
                </p>
              </div>

              <form onSubmit={handleSalvarConfig} className="space-y-3 max-w-lg">
                {formError && (
                  <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
                    <AlertCircle size={14} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    WhatsApp Business Account ID (WABA)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 102900000000000"
                    value={formWabaId}
                    onChange={(e) => setFormWabaId(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 109900000000000"
                    value={formPhoneNumberId}
                    onChange={(e) => setFormPhoneNumberId(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Access Token
                  </label>
                  <input
                    type="password"
                    placeholder={integracao?.configurada ? "•••••••••••••• (deixe em branco para manter o atual)" : "Token de sistema"}
                    value={formToken}
                    onChange={(e) => setFormToken(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
                  >
                    {saving ? "Salvando..." : "Salvar Credenciais"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfigForm(false)}
                    className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {integracao?.ultimoErro && (
            <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
              <AlertCircle size={14} className="shrink-0" />
              <span>Última sincronização falhou: {integracao.ultimoErro}</span>
            </div>
          )}

          {/* State 1: not configured */}
          {!integracao?.configurada ? (
            <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto space-y-3">
              <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mx-auto border border-border">
                <MessageSquare size={22} />
              </div>
              <h3 className="font-bold text-sm text-foreground font-display">Integração não configurada</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-text">
                Ainda não há uma conta do WhatsApp Business conectada a esta marca via Cloud API.
                {podeConfigurar
                  ? " Clique em \"Configurar Integração\" acima e informe o WABA ID, o Phone Number ID e o Access Token."
                  : " Peça a um administrador da marca para configurar em \"Configurar Integração\"."}
              </p>
              {!podeConfigurar && (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground font-text bg-muted/40 border border-border rounded-lg px-3 py-1.5">
                  <Lock size={12} />
                  Somente administradores podem configurar esta integração.
                </div>
              )}
            </div>
          ) : !integracao.ultimaSincronizacao ? (
            /* State 2: configured, never synced */
            <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto space-y-3">
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto border border-amber-200 dark:border-amber-500/20">
                <Clock size={22} />
              </div>
              <h3 className="font-bold text-sm text-foreground font-display">Aguardando primeira sincronização</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-text">
                A integração está configurada (Phone Number ID <span className="font-mono">{integracao.phoneNumberId}</span>), mas ainda não sincronizamos nenhum dado.
                {podeSincronizar
                  ? " Clique em \"Sincronizar agora\" para buscar as métricas e templates pela primeira vez."
                  : " Peça a um administrador da marca para disparar a primeira sincronização."}
              </p>
            </div>
          ) : (
            /* State 3: has data */
            <>
              <div className="flex items-center gap-1.5 text-xxs text-muted-foreground font-text">
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                Última sincronização: {new Date(integracao.ultimaSincronizacao).toLocaleString("pt-BR")}
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
                <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm">
                  <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
                    <MessageSquare size={12} /> Conversas Iniciadas
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                    {ultimaMetrica?.conversasIniciadas.toLocaleString("pt-BR") ?? "—"}
                  </h3>
                </div>
                <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm">
                  <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
                    <Send size={12} /> Enviadas
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                    {ultimaMetrica?.mensagensEnviadas.toLocaleString("pt-BR") ?? "—"}
                  </h3>
                </div>
                <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm">
                  <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
                    <CheckCircle size={12} /> Entregues
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                    {ultimaMetrica?.mensagensEntregues.toLocaleString("pt-BR") ?? "—"}
                  </h3>
                </div>
                <div className="bg-card border border-gray-200 dark:border-neutral-800 p-4 md:p-6 rounded-[12px] shadow-sm">
                  <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
                    <CheckCircle2 size={12} /> Lidas
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground mt-1 tracking-tight font-display">
                    {ultimaMetrica?.mensagensLidas.toLocaleString("pt-BR") ?? "—"}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:200ms]">
                {/* Historical chart */}
                <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col">
                  <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">Conversas</span>
                  <h3 className="font-extrabold text-lg text-foreground font-display mt-0.5">Conversas Iniciadas ao Longo do Tempo</h3>
                  <div className="flex-1 mt-4">
                    <LineChart
                      data={metricas.map((m) => ({
                        date: new Date(m.capturadoEm).toLocaleDateString("pt-BR"),
                        conversas: m.conversasIniciadas,
                      }))}
                      index="date"
                      categories={["conversas"]}
                      showLegend={false}
                      showYAxis={false}
                      startEndOnly={true}
                      className="h-[220px] md:h-80"
                    />
                  </div>
                </div>

                {/* Templates list */}
                <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm flex flex-col">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-neutral-800 bg-muted/30 rounded-t-[12px]">
                    <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                      Templates
                    </span>
                    <h3 className="font-bold text-sm text-foreground font-display mt-0.5">
                      Status Real na Conta WhatsApp
                    </h3>
                  </div>

                  {templates.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground">
                      <p className="text-xs font-text">Nenhum template retornado pela última sincronização.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-neutral-800 flex-1 max-h-80 overflow-y-auto">
                      {templates.map((tpl) => (
                        <div key={tpl.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-sm text-foreground font-text">{tpl.nome}</h4>
                            <p className="text-xxs text-muted-foreground font-text">
                              Categoria: <span className="font-medium text-foreground">{tpl.categoria}</span>
                            </p>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold font-text ${TEMPLATE_BADGE[tpl.status]}`}>
                            {TEMPLATE_LABEL[tpl.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
