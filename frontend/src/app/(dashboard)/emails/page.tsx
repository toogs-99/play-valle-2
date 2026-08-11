"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/Toaster";
import { useToast } from "@/lib/useToast";
import {
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  AlertCircle,
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
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUsuario: string | null;
  smtpSeguro: boolean;
  emailRemetente: string | null;
  nomeRemetente: string | null;
  ativo: boolean;
  ultimaSincronizacao: string | null;
  ultimoErro: string | null;
}

interface EmailEnviado {
  id: string;
  destinatario: string;
  assunto: string;
  corpo: string;
  status: "enviado" | "falhou";
  erro: string | null;
  enviadoEm: string;
  contexto: string | null;
}

const PAPEIS_CONFIGURAR = ["admin"];
const PAPEIS_ENVIAR = ["admin", "gestor_atas"];

export default function EmailsPage() {
  const { toast } = useToast();

  const [marcaAtiva, setMarcaAtiva] = useState<MarcaAtiva | null>(null);
  const [integracao, setIntegracao] = useState<IntegracaoStatus | null>(null);
  const [emails, setEmails] = useState<EmailEnviado[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailEnviado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showConfigForm, setShowConfigForm] = useState(false);
  const [formHost, setFormHost] = useState("");
  const [formPort, setFormPort] = useState("587");
  const [formUsuario, setFormUsuario] = useState("");
  const [formSenha, setFormSenha] = useState("");
  const [formSeguro, setFormSeguro] = useState(true);
  const [formRemetente, setFormRemetente] = useState("");
  const [formNomeRemetente, setFormNomeRemetente] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [testeDestinatario, setTesteDestinatario] = useState("");
  const [testando, setTestando] = useState(false);

  const [composeDestinatario, setComposeDestinatario] = useState("");
  const [composeAssunto, setComposeAssunto] = useState("");
  const [composeCorpo, setComposeCorpo] = useState("");
  const [enviandoManual, setEnviandoManual] = useState(false);

  const fetchIntegracao = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/integracoes/email?marcaId=${marcaId}`);
    if (!res.ok) throw new Error("Falha ao carregar status da integração.");
    const data = await res.json();
    setIntegracao(data.integracao);
    return data.integracao as IntegracaoStatus;
  }, []);

  const fetchEmails = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/emails?marcaId=${marcaId}`);
    if (!res.ok) throw new Error("Falha ao carregar histórico de e-mails.");
    const data = await res.json();
    setEmails(data.emails);
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

        if (integracaoAtual.configurada) {
          await fetchEmails(marca.marcaId);
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
  }, [fetchIntegracao, fetchEmails]);

  const podeConfigurar = marcaAtiva ? PAPEIS_CONFIGURAR.includes(marcaAtiva.papel) : false;
  const podeEnviar = marcaAtiva ? PAPEIS_ENVIAR.includes(marcaAtiva.papel) : false;

  const handleSalvarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!marcaAtiva) return;
    if (!formHost.trim() || !formPort.trim() || !formUsuario.trim() || !formRemetente.trim()) {
      setFormError("Preencha host, porta, usuário e e-mail remetente.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/integracoes/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId: marcaAtiva.marcaId,
          smtpHost: formHost.trim(),
          smtpPort: Number(formPort),
          smtpUsuario: formUsuario.trim(),
          ...(formSenha.trim() && { smtpSenha: formSenha.trim() }),
          smtpSeguro: formSeguro,
          emailRemetente: formRemetente.trim(),
          nomeRemetente: formNomeRemetente.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Falha ao salvar integração.");
        return;
      }

      setIntegracao(data.integracao);
      setFormSenha("");
      toast({ description: "Configuração SMTP salva! Envie um e-mail de teste para validar." });
    } catch {
      setFormError("Erro de rede ao salvar integração.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marcaAtiva || !testeDestinatario.trim()) return;

    setTestando(true);
    try {
      const res = await fetch("/api/integracoes/email/testar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marcaId: marcaAtiva.marcaId, destinatario: testeDestinatario.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ description: data.error || "Falha ao enviar e-mail de teste." });
        await fetchIntegracao(marcaAtiva.marcaId);
        return;
      }
      toast({ description: `E-mail de teste enviado para ${testeDestinatario.trim()}!` });
      await Promise.all([fetchIntegracao(marcaAtiva.marcaId), fetchEmails(marcaAtiva.marcaId)]);
      setShowConfigForm(false);
    } catch {
      toast({ description: "Erro de rede ao enviar e-mail de teste." });
    } finally {
      setTestando(false);
    }
  };

  const handleEnviarManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marcaAtiva) return;
    if (!composeDestinatario.trim() || !composeAssunto.trim() || !composeCorpo.trim()) {
      toast({ description: "Preencha destinatário, assunto e corpo da mensagem." });
      return;
    }

    setEnviandoManual(true);
    try {
      const res = await fetch("/api/emails/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId: marcaAtiva.marcaId,
          destinatario: composeDestinatario.trim(),
          assunto: composeAssunto.trim(),
          corpo: composeCorpo.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ description: data.error || "Falha ao enviar e-mail." });
        return;
      }
      toast({ description: "E-mail enviado com sucesso!" });
      setComposeDestinatario("");
      setComposeAssunto("");
      setComposeCorpo("");
      await fetchEmails(marcaAtiva.marcaId);
    } catch {
      toast({ description: "Erro de rede ao enviar e-mail." });
    } finally {
      setEnviandoManual(false);
    }
  };

  const totalEnviados = emails.filter((e) => e.status === "enviado").length;
  const totalFalhas = emails.filter((e) => e.status === "falhou").length;
  const taxaFalha = emails.length > 0 ? Math.round((totalFalhas / emails.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-fade-in-slide-down">
        <div>
          <span className="text-xxs font-bold text-primary uppercase tracking-widest font-text">
            Comunicações Corporativas
          </span>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display mt-0.5">
            Central de E-mails
          </h2>
          <p className="text-muted-foreground text-xs mt-1.5 font-text">
            Envio real via SMTP e histórico de comunicados, alertas e testes
            {marcaAtiva ? ` — ${marcaAtiva.marcaNome}` : ""}.
          </p>
        </div>

        {podeConfigurar && (
          <button
            onClick={() => {
              setFormHost(integracao?.smtpHost ?? "");
              setFormPort(String(integracao?.smtpPort ?? 587));
              setFormUsuario(integracao?.smtpUsuario ?? "");
              setFormSenha("");
              setFormSeguro(integracao?.smtpSeguro ?? true);
              setFormRemetente(integracao?.emailRemetente ?? "");
              setFormNomeRemetente(integracao?.nomeRemetente ?? "");
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
                <h3 className="font-bold text-sm text-foreground font-display">Configuração SMTP</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-text">
                  Use qualquer provedor SMTP (Gmail com senha de app, SendGrid, Amazon SES, etc). A senha é criptografada antes de ser salva e nunca é exibida novamente.
                </p>
              </div>

              <form onSubmit={handleSalvarConfig} className="space-y-3 max-w-lg">
                {formError && (
                  <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
                    <AlertCircle size={14} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                      Host SMTP
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      value={formHost}
                      onChange={(e) => setFormHost(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                      Porta
                    </label>
                    <input
                      type="number"
                      placeholder="587"
                      value={formPort}
                      onChange={(e) => setFormPort(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Usuário SMTP
                  </label>
                  <input
                    type="text"
                    placeholder="seuemail@gmail.com"
                    value={formUsuario}
                    onChange={(e) => setFormUsuario(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Senha SMTP
                  </label>
                  <input
                    type="password"
                    placeholder={integracao?.configurada ? "•••••••••••••• (deixe em branco para manter a atual)" : "Senha ou senha de app"}
                    value={formSenha}
                    onChange={(e) => setFormSenha(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-foreground font-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSeguro}
                    onChange={(e) => setFormSeguro(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-[var(--primary)]"
                  />
                  Conexão segura (TLS/SSL)
                </label>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    E-mail Remetente
                  </label>
                  <input
                    type="email"
                    placeholder="comunicados@suaempresa.com.br"
                    value={formRemetente}
                    onChange={(e) => setFormRemetente(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Nome do Remetente (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Equipe LicitFlow"
                    value={formNomeRemetente}
                    onChange={(e) => setFormNomeRemetente(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
                  >
                    {saving ? "Salvando..." : "Salvar Configuração"}
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

              {integracao?.configurada && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-bold text-foreground font-text mb-2">Enviar E-mail de Teste</h4>
                  <form onSubmit={handleTestar} className="flex gap-2 max-w-lg">
                    <input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={testeDestinatario}
                      onChange={(e) => setTesteDestinatario(e.target.value)}
                      required
                      className="flex-1 px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                    />
                    <button
                      type="submit"
                      disabled={testando}
                      className="flex items-center gap-1.5 bg-foreground hover:opacity-90 disabled:opacity-50 text-background font-semibold text-xs px-4 py-2 rounded-xl transition-opacity whitespace-nowrap"
                    >
                      <RefreshCw size={13} className={testando ? "animate-spin" : ""} />
                      {testando ? "Enviando..." : "Enviar Teste"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {integracao?.ultimoErro && (
            <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
              <AlertCircle size={14} className="shrink-0" />
              <span>Último envio falhou: {integracao.ultimoErro}</span>
            </div>
          )}

          {/* State 1: not configured */}
          {!integracao?.configurada ? (
            <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto space-y-3">
              <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mx-auto border border-border">
                <Mail size={22} />
              </div>
              <h3 className="font-bold text-sm text-foreground font-display">Integração não configurada</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-text">
                Ainda não há um servidor SMTP configurado para esta marca.
                {podeConfigurar
                  ? " Clique em \"Configurar Integração\" acima e informe os dados do seu provedor SMTP."
                  : " Peça a um administrador da marca para configurar em \"Configurar Integração\"."}
              </p>
              {!podeConfigurar && (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground font-text bg-muted/40 border border-border rounded-lg px-3 py-1.5">
                  <Lock size={12} />
                  Somente administradores podem configurar esta integração.
                </div>
              )}
            </div>
          ) : emails.length === 0 ? (
            /* State 2: configured, no sends yet */
            <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] p-12 text-center max-w-2xl mx-auto space-y-3">
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto border border-amber-200 dark:border-amber-500/20">
                <Clock size={22} />
              </div>
              <h3 className="font-bold text-sm text-foreground font-display">Nenhum e-mail enviado ainda</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-text">
                A integração SMTP está configurada, mas ainda não há histórico de envios.
                {podeConfigurar
                  ? " Envie um e-mail de teste em \"Configurar Integração\" para validar."
                  : " Envie um comunicado ou aguarde um alerta automático."}
              </p>
            </div>
          ) : (
            /* State 3: has history */
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-slide-down [animation-delay:100ms]">
                <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm">
                  <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
                    <Send size={12} className="text-primary" /> Enviados com Sucesso
                  </span>
                  <h3 className="text-3xl font-black text-foreground mt-1.5 tracking-tight font-display">{totalEnviados}</h3>
                </div>
                <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm">
                  <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
                    <XCircle size={12} className="text-destructive" /> Falhas
                  </span>
                  <h3 className="text-3xl font-black text-foreground mt-1.5 tracking-tight font-display">{totalFalhas}</h3>
                </div>
                <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-[12px] shadow-sm">
                  <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text flex items-center gap-1">
                    <AlertCircle size={12} className="text-amber-500" /> Taxa de Falha
                  </span>
                  <h3 className="text-3xl font-black text-foreground mt-1.5 tracking-tight font-display">{taxaFalha}%</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-slide-up [animation-delay:200ms]">
                {/* Compose manual email */}
                {podeEnviar && (
                  <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm p-6 flex flex-col">
                    <div className="flex flex-col mb-5 border-b border-gray-200 dark:border-neutral-800 pb-4">
                      <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                        Envio Manual
                      </span>
                      <h3 className="font-bold text-sm text-foreground font-display mt-0.5">Compor E-mail</h3>
                    </div>

                    <form onSubmit={handleEnviarManual} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider font-text">
                          Destinatário
                        </label>
                        <input
                          type="email"
                          value={composeDestinatario}
                          onChange={(e) => setComposeDestinatario(e.target.value)}
                          placeholder="destinatario@exemplo.com"
                          className="w-full bg-muted/40 border border-border px-3 py-2 rounded-lg text-xs font-text text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider font-text">
                          Assunto
                        </label>
                        <input
                          type="text"
                          value={composeAssunto}
                          onChange={(e) => setComposeAssunto(e.target.value)}
                          className="w-full bg-muted/40 border border-border px-3 py-2 rounded-lg text-xs font-text text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xxs font-bold text-muted-foreground uppercase tracking-wider font-text">
                          Corpo da Mensagem
                        </label>
                        <textarea
                          rows={5}
                          value={composeCorpo}
                          onChange={(e) => setComposeCorpo(e.target.value)}
                          className="w-full bg-muted/40 border border-border px-3 py-2 rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text leading-relaxed"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={enviandoManual}
                        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Send size={14} />
                        {enviandoManual ? "Enviando..." : "Enviar Agora"}
                      </button>
                    </form>
                  </div>
                )}

                {/* History */}
                <div className={`bg-card border border-gray-200 dark:border-neutral-800 rounded-[12px] shadow-sm flex flex-col ${!podeEnviar ? "lg:col-span-2" : ""}`}>
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-800 bg-muted/30 rounded-t-[12px]">
                    <span className="text-xxs font-semibold text-muted-foreground uppercase tracking-wider font-text">
                      Histórico
                    </span>
                    <h3 className="font-bold text-sm text-foreground font-display mt-0.5">Últimos Envios</h3>
                  </div>

                  <div className="divide-y divide-gray-200 dark:divide-neutral-800 flex-1 max-h-[480px] overflow-y-auto">
                    {emails.map((mail) => (
                      <button
                        key={mail.id}
                        onClick={() => setSelectedEmail(mail)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 active:bg-muted/50 transition-colors group cursor-pointer text-left border-0 bg-transparent"
                      >
                        <div className="space-y-1 min-w-0 pr-4">
                          <h4 className="font-semibold text-xs text-foreground font-text truncate">{mail.assunto}</h4>
                          <div className="flex items-center gap-2 text-xxs text-muted-foreground font-text">
                            <span className="truncate max-w-[160px]">{mail.destinatario}</span>
                            {mail.contexto && (
                              <>
                                <span>·</span>
                                <span className="text-primary/80">{mail.contexto}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {mail.status === "enviado" ? (
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <XCircle size={14} className="text-destructive" />
                          )}
                          <span className="text-xxs text-muted-foreground font-medium font-text">
                            {new Date(mail.enviadoEm).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Email detail modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setSelectedEmail(null)} />
          <div className="bg-card border border-border rounded-[12px] shadow-xl w-full max-w-xl relative z-10 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                  selectedEmail.status === "enviado"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                }`}>
                  {selectedEmail.status === "enviado" ? "Enviado com Sucesso" : "Falhou"}
                </span>
                <h3 className="text-base font-extrabold text-foreground tracking-tight leading-snug font-display">
                  {selectedEmail.assunto}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="py-4 space-y-1 text-xxs text-muted-foreground font-text border-b border-border">
              <p>Para: <span className="font-semibold text-foreground">{selectedEmail.destinatario}</span></p>
              <p>Enviado em: <span className="font-semibold text-foreground">{new Date(selectedEmail.enviadoEm).toLocaleString("pt-BR")}</span></p>
              {selectedEmail.contexto && (
                <p>Origem: <span className="font-semibold text-foreground">{selectedEmail.contexto}</span></p>
              )}
              {selectedEmail.erro && (
                <p className="text-destructive">Erro: <span className="font-semibold">{selectedEmail.erro}</span></p>
              )}
            </div>

            <div className="py-4 max-h-[300px] overflow-y-auto">
              <p className="text-xs text-foreground leading-relaxed font-text whitespace-pre-wrap">
                {selectedEmail.corpo}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
