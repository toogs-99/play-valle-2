"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  FileText,
  Send,
  UserCheck,
  Plus,
  AlertTriangle,
  AlertCircle,
  ClipboardCheck,
  Check,
  X as XIcon,
  Upload,
  Calendar,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import CityCombobox from "@/components/CityCombobox";
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

type StatusRepresentante = "waiting_letter" | "active" | "waitlist" | "expired";

interface Representante {
  id: string;
  ataId: string;
  nome: string;
  cidade: string;
  status: StatusRepresentante;
  waitingDeadline: string;
}

type StatusOficio = "pending" | "approved" | "rejected";

interface Oficio {
  id: string;
  representanteId: string;
  status: StatusOficio;
  arquivoNomeOriginal: string;
  sentAt: string;
  representante: { id: string; nome: string; cidade: string };
  autorizacao: { id: string; numero: string; dataEmissao: string } | null;
}

interface Autorizacao {
  id: string;
  numero: string;
  dataEmissao: string;
  oficio: { id: string; representante: { id: string; nome: string; cidade: string } };
}

interface MarcaAtiva {
  marcaId: string;
  marcaNome: string;
  papel: "admin" | "gestor_atas" | "financeiro" | "vendedor";
}

const PAPEIS_ESCRITA = ["admin", "gestor_atas"];

export default function AtaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ataId } = use(params);
  const { toast } = useToast();

  const [marcaAtiva, setMarcaAtiva] = useState<MarcaAtiva | null>(null);
  const [prazoPadrao, setPrazoPadrao] = useState(30);
  const [ata, setAta] = useState<Ata | null>(null);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [autorizacoes, setAutorizacoes] = useState<Autorizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Active tab state
  const [activeTab, setActiveTab] = useState<"representantes" | "modelo" | "oficios" | "autorizacoes">("representantes");

  // Selected representative name state for master-detail view
  const [selectedRepName, setSelectedRepName] = useState<string | null>(null);

  // Modal states
  const [isRepModalOpen, setIsRepModalOpen] = useState(false);
  const [isOficioModalOpen, setIsOficioModalOpen] = useState(false);

  // Representative registration form state
  const [repNome, setRepNome] = useState("");
  const [repCidade, setRepCidade] = useState("");
  const [repDias, setRepDias] = useState(30);
  const [repError, setRepError] = useState("");
  const [repSubmitting, setRepSubmitting] = useState(false);

  // Office upload form state
  const [uploadRepresentanteId, setUploadRepresentanteId] = useState("");
  const [isPreFilledUpload, setIsPreFilledUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileBase64, setUploadFileBase64] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSubmitting, setUploadSubmitting] = useState(false);

  // Transcription and PDF States (modelo tab)
  const [templateContent, setTemplateContent] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  // General States
  const [copied, setCopied] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappSelectedRep, setWhatsappSelectedRep] = useState("other");
  const [processingOficioId, setProcessingOficioId] = useState<string | null>(null);
  const [isEditingValor, setIsEditingValor] = useState(false);
  const [valorAtaForm, setValorAtaForm] = useState("");
  const [savingValor, setSavingValor] = useState(false);

  const fetchRepresentantes = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/representantes?marcaId=${marcaId}&ataId=${ataId}`);
    if (!res.ok) throw new Error("Falha ao carregar representantes.");
    const data = await res.json();
    setRepresentantes(data.representantes);
  }, [ataId]);

  const fetchOficios = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/oficios?marcaId=${marcaId}&ataId=${ataId}`);
    if (!res.ok) throw new Error("Falha ao carregar ofícios.");
    const data = await res.json();
    setOficios(data.oficios);
  }, [ataId]);

  const fetchAutorizacoes = useCallback(async (marcaId: string) => {
    const res = await fetch(`/api/autorizacoes?marcaId=${marcaId}&ataId=${ataId}`);
    if (!res.ok) throw new Error("Falha ao carregar autorizações.");
    const data = await res.json();
    setAutorizacoes(data.autorizacoes);
  }, [ataId]);

  const refreshAll = useCallback(
    async (marcaId: string) => {
      await Promise.all([fetchRepresentantes(marcaId), fetchOficios(marcaId), fetchAutorizacoes(marcaId)]);
    },
    [fetchRepresentantes, fetchOficios, fetchAutorizacoes]
  );

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

        const ataRes = await fetch(`/api/atas/${ataId}`);
        if (ataRes.status === 404) {
          if (!cancelled) setAta(null);
          return;
        }
        if (!ataRes.ok) throw new Error("Falha ao carregar a ata.");
        const { ata: ataData } = await ataRes.json();
        if (cancelled) return;
        setAta(ataData);

        const configRes = await fetch("/api/configuracoes");
        if (configRes.ok) {
          const { configuracao } = await configRes.json();
          if (!cancelled) {
            setPrazoPadrao(configuracao.prazoPadraoDias);
            setRepDias(configuracao.prazoPadraoDias);
          }
        }

        await refreshAll(marca.marcaId);
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
  }, [ataId]);

  // Initialize template text
  useEffect(() => {
    if (ata && !templateContent) {
      setTemplateContent(getLetterTemplate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ata, templateContent]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!ata) {
    return (
      <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4">
        <h3 className="font-bold text-sm text-foreground font-display">Ata não encontrada</h3>
        <p className="text-xs text-muted-foreground font-text">
          A Ata solicitada não existe ou você não tem acesso a ela.
        </p>
        <Link
          href="/atas"
          className="inline-block bg-foreground hover:opacity-90 text-background font-semibold text-xs px-4 py-2 rounded-xl transition-opacity"
        >
          Voltar para Atas
        </Link>
      </div>
    );
  }

  const podeEscrever = marcaAtiva ? PAPEIS_ESCRITA.includes(marcaAtiva.papel) : false;

  const handleSalvarValorAta = async () => {
    if (!marcaAtiva) return;
    const valorNumerico = Number(valorAtaForm);
    if (Number.isNaN(valorNumerico) || valorNumerico < 0) {
      toast({ description: "Informe um valor válido para a ata." });
      return;
    }

    setSavingValor(true);
    try {
      const res = await fetch(`/api/atas/${ataId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorAta: valorNumerico }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ description: data.error || "Falha ao atualizar valor da ata." });
        return;
      }
      setAta(data.ata);
      setIsEditingValor(false);
      toast({ description: "Valor da ata atualizado." });
    } catch {
      toast({ description: "Erro de rede ao atualizar valor da ata." });
    } finally {
      setSavingValor(false);
    }
  };

  // Group representatives by name
  const repsByName = representantes.reduce((acc, rep) => {
    if (!acc[rep.nome]) acc[rep.nome] = [];
    acc[rep.nome].push(rep);
    return acc;
  }, {} as Record<string, Representante[]>);

  const uniqueRepNames = Object.keys(repsByName);
  const activeRepName = selectedRepName && uniqueRepNames.includes(selectedRepName)
    ? selectedRepName
    : uniqueRepNames[0] || null;
  const activeRepReservations = activeRepName ? repsByName[activeRepName] || [] : [];

  const pendingOficios = oficios.filter((o) => o.status === "pending");

  // Handle Representative Submission
  const handleAddRep = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepError("");
    if (!marcaAtiva) return;
    if (!repNome.trim() || !repCidade.trim()) {
      setRepError("Nome e cidade são obrigatórios.");
      return;
    }

    setRepSubmitting(true);
    try {
      const res = await fetch("/api/representantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId: marcaAtiva.marcaId,
          ataId,
          nome: repNome.trim(),
          cidade: repCidade.trim(),
          waitingDays: repDias,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRepError(data.error || "Falha ao vincular representante.");
        return;
      }

      await refreshAll(marcaAtiva.marcaId);
      setSelectedRepName(repNome.trim());

      if (data.duplicado) {
        toast({
          description: `${data.representante.nome} entrou em fila de espera: já existe "${data.duplicado.nome}" ativo/pendente nesta cidade.`,
        });
      } else {
        toast({ description: `Representante ${data.representante.nome} vinculado com sucesso!` });
      }

      setRepNome("");
      setRepCidade("");
      setRepDias(prazoPadrao);
      setIsRepModalOpen(false);
    } catch {
      setRepError("Erro de rede ao vincular representante.");
    } finally {
      setRepSubmitting(false);
    }
  };

  // Convert selected file to base64 for upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Apenas arquivos PDF são aceitos.");
      return;
    }

    setUploadError("");
    setUploadFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the "data:application/pdf;base64," prefix
      const base64 = result.split(",")[1] || "";
      setUploadFileBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle Upload of Official Letter
  const handleUploadOficio = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");

    if (!marcaAtiva) return;
    if (!uploadRepresentanteId || !uploadFile || !uploadFileBase64) {
      setUploadError("Selecione o representante e o arquivo PDF.");
      return;
    }

    setUploadSubmitting(true);
    try {
      const res = await fetch("/api/oficios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId: marcaAtiva.marcaId,
          representanteId: uploadRepresentanteId,
          arquivoBase64: uploadFileBase64,
          arquivoMimeType: uploadFile.type,
          arquivoNomeOriginal: uploadFile.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Falha ao anexar ofício.");
        return;
      }

      await refreshAll(marcaAtiva.marcaId);
      toast({ description: "Ofício anexado com sucesso!" });

      setUploadRepresentanteId("");
      setUploadFile(null);
      setUploadFileBase64("");
      setIsPreFilledUpload(false);
      setIsOficioModalOpen(false);
    } catch {
      setUploadError("Erro de rede ao anexar ofício.");
    } finally {
      setUploadSubmitting(false);
    }
  };

  const handleApprove = async (oficioId: string) => {
    if (!marcaAtiva) return;
    setProcessingOficioId(oficioId);
    try {
      const res = await fetch(`/api/oficios/${oficioId}/aprovar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast({ description: data.error || "Falha ao aprovar ofício." });
        return;
      }
      await refreshAll(marcaAtiva.marcaId);
      const valorVenda = Number(data.venda?.valor ?? 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      toast({
        description: `Ofício homologado! Autorização ${data.autorizacao.numero} emitida e venda de ${valorVenda} registrada (pendente).`,
      });
    } catch {
      toast({ description: "Erro de rede ao aprovar ofício." });
    } finally {
      setProcessingOficioId(null);
    }
  };

  const handleReject = async (oficioId: string) => {
    if (!marcaAtiva) return;
    setProcessingOficioId(oficioId);
    try {
      const res = await fetch(`/api/oficios/${oficioId}/rejeitar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast({ description: data.error || "Falha ao rejeitar ofício." });
        return;
      }
      await refreshAll(marcaAtiva.marcaId);
      toast({ description: "Ofício rejeitado." });
    } catch {
      toast({ description: "Erro de rede ao rejeitar ofício." });
    } finally {
      setProcessingOficioId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "expired":
        return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      case "waitlist":
        return "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Adesão Aprovada";
      case "expired":
        return "Prazo Vencido";
      case "waitlist":
        return "Em Fila de Espera";
      default:
        return "Aguardando Ofício";
    }
  };

  // Generate Letter Template Text
  function getLetterTemplate() {
    if (!ata) return "";
    return `OFÍCIO DE ADESÃO DE COTAS Nº ____/2026

Ao Órgão Gerenciador: ${ata.orgao}
Ref: Solicitação de Adesão à ${ata.numero}

Prezados Senhores,

A empresa [Nome do Representante], inscrita no CNPJ sob o nº [CNPJ do Representante], estabelecida comercialmente na cidade de [Cidade do Representante], manifesta formalmente o interesse em aderir à Ata de Registro de Preços nº ${ata.numero}, com validade estabelecida até [Data Final da Ata].

Solicitamos autorização para contratação da cota de fornecimento correspondente aos itens acordados, conforme especificações técnicas descritas no Termo de Referência da Ata de Registro de Preços:
- Descrição da Ata: ${ata.descricao ?? "—"}

Agradecemos a atenção e nos colocamos à disposição para os trâmites subsequentes e formalização de contrato.

Atenciosamente,

___________________________________________
[Nome do Diretor / Assinatura do Representante]
Representante Autorizado`;
  }

  const displayTemplateText = templateContent || getLetterTemplate();

  const copyTemplateToClipboard = () => {
    const text = document.getElementById("oficio-template-text")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download styled PDF of the letter template (client-side, unrelated to certificate PDFs)
  const downloadTemplatePDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const lines = displayTemplateText.split("\n");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      let y = 20;
      const margin = 20;
      const pageHeight = doc.internal.pageSize.height;

      lines.forEach((line) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        const splitText = doc.splitTextToSize(line, 170);
        splitText.forEach((textLine: string) => {
          doc.text(textLine, margin, y);
          y += 6;
        });
      });

      doc.save(`Modelo_Oficio_Adesao_${ata.numero.replace(/\//g, "-")}.pdf`);
      toast({ description: "PDF gerado e baixado com sucesso!" });
      return true;
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      return false;
    }
  };

  // Simulate Transcription (unrelated to oficios flow — kept as-is)
  const handleFileTranscription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    setTimeout(() => {
      setIsTranscribing(false);
      toast({ description: `Arquivo "${file.name}" transcrito com sucesso!` });
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Toaster />
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          href="/atas"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-text"
        >
          <ArrowLeft size={14} />
          Voltar para Atas de Registro de Preços
        </Link>
      </div>

      {/* Ata Header Display Card */}
      <div className="bg-card border border-gray-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded uppercase font-text">
              Gerenciamento Ativo
            </span>
            <span className="text-xxs text-muted-foreground font-text">
              Criada em {new Date(ata.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight font-display">{ata.numero}</h2>
          <p className="text-xs text-muted-foreground font-medium font-text">{ata.orgao}</p>
          {ata.descricao && (
            <p className="text-xxs text-muted-foreground mt-2 max-w-2xl italic leading-relaxed font-text">
              &ldquo;{ata.descricao}&rdquo;
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {isEditingValor ? (
              <>
                <input
                  type="number"
                  value={valorAtaForm}
                  onChange={(e) => setValorAtaForm(e.target.value)}
                  min={0}
                  step="0.01"
                  autoFocus
                  className="w-32 px-2 py-1 bg-muted/40 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                />
                <button
                  onClick={handleSalvarValorAta}
                  disabled={savingValor}
                  className="text-[10px] font-bold text-primary hover:opacity-80 disabled:opacity-50 font-text"
                >
                  {savingValor ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => setIsEditingValor(false)}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground font-text"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-primary font-text">
                  Valor da Ata: {Number(ata.valorAta).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
                {podeEscrever && (
                  <button
                    onClick={() => {
                      setValorAtaForm(String(Number(ata.valorAta)));
                      setIsEditingValor(true);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-primary underline font-text"
                  >
                    editar
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="flex gap-3 sm:gap-6 self-start md:self-center">
          <div className="text-center bg-muted/40 border border-border p-3 rounded-xl min-w-[80px]">
            <span className="block text-xl font-bold text-foreground font-display">{representantes.length}</span>
            <span className="text-[9px] text-muted-foreground font-semibold uppercase font-text">Vendedores</span>
          </div>
          <div className="text-center bg-muted/40 border border-border p-3 rounded-xl min-w-[80px]">
            <span className="block text-xl font-bold text-amber-600 dark:text-amber-400 font-display">
              {representantes.filter((r) => r.status === "waiting_letter").length}
            </span>
            <span className="text-[9px] text-muted-foreground font-semibold uppercase font-text">Em Espera</span>
          </div>
          <div className="text-center bg-muted/40 border border-border p-3 rounded-xl min-w-[80px]">
            <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400 font-display">
              {autorizacoes.length}
            </span>
            <span className="text-[9px] text-muted-foreground font-semibold uppercase font-text">Aprovados</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Tab Navigation */}
      <div className="bg-muted/40 p-1.5 rounded-2xl border border-border flex flex-wrap gap-1 mt-6">
        <button
          onClick={() => setActiveTab("representantes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all font-text ${
            activeTab === "representantes"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Users size={14} className={activeTab === "representantes" ? "text-primary" : "text-muted-foreground"} />
          Representantes
        </button>

        <button
          onClick={() => setActiveTab("modelo")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all font-text ${
            activeTab === "modelo"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <FileText size={14} className={activeTab === "modelo" ? "text-primary" : "text-muted-foreground"} />
          Modelo de Ofício
        </button>

        <button
          onClick={() => setActiveTab("oficios")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all relative font-text ${
            activeTab === "oficios"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Send size={14} className={activeTab === "oficios" ? "text-primary" : "text-muted-foreground"} />
          Ofícios Recebidos
          {pendingOficios.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("autorizacoes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all font-text ${
            activeTab === "autorizacoes"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <UserCheck size={14} className={activeTab === "autorizacoes" ? "text-primary" : "text-muted-foreground"} />
          Autorização de Adesão
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {/* Tab 1: REPRESENTANTES */}
        {activeTab === "representantes" && (
          <div>
            {representantes.length === 0 ? (
              <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-12 text-center text-muted-foreground space-y-4">
                <Users size={32} className="mx-auto text-muted-foreground/60" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground font-text">Nenhum vendedor cadastrado</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto font-text">
                    Não há nenhum representante vinculado a esta Ata de Registro de Preços ainda.
                  </p>
                </div>
                {podeEscrever && (
                  <button
                    onClick={() => setIsRepModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-foreground hover:opacity-90 text-background font-semibold text-xs px-4 py-2.5 rounded-xl transition-opacity shadow-sm"
                  >
                    <Plus size={14} /> Vincular Primeiro Vendedor
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Left Column: Unique Representatives List */}
                <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden md:col-span-1">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div>
                      <h3 className="font-bold text-xs text-foreground font-text">Vendedores</h3>
                      <p className="text-[10px] text-muted-foreground font-medium font-text">{uniqueRepNames.length} no total</p>
                    </div>
                    {podeEscrever && (
                      <button
                        onClick={() => setIsRepModalOpen(true)}
                        className="flex items-center gap-1 bg-foreground hover:opacity-90 text-background font-semibold text-[10px] px-2.5 py-1.5 rounded-lg transition-opacity"
                      >
                        <Plus size={12} /> Novo Vendedor
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-border max-h-[450px] overflow-y-auto">
                    {uniqueRepNames.map((nome) => {
                      const reservations = repsByName[nome] || [];
                      const isSelected = nome === activeRepName;

                      const hasActive = reservations.some((r) => r.status === "active");
                      const hasExpired = reservations.some((r) => r.status === "expired");
                      const hasWaitlist = reservations.some((r) => r.status === "waitlist");
                      const hasWaiting = reservations.some((r) => r.status === "waiting_letter");

                      let statusColor = "bg-muted-foreground/40";
                      if (hasActive) statusColor = "bg-emerald-500";
                      else if (hasWaiting) statusColor = "bg-amber-500";
                      else if (hasWaitlist) statusColor = "bg-orange-500";
                      else if (hasExpired) statusColor = "bg-rose-500";

                      return (
                        <button
                          key={nome}
                          onClick={() => setSelectedRepName(nome)}
                          className={`w-full text-left p-4 transition-all flex items-start justify-between gap-3 ${
                            isSelected ? "bg-primary/5 border-l-4 border-primary" : "hover:bg-muted/40"
                          }`}
                        >
                          <div className="space-y-1 min-w-0">
                            <p className={`text-xs font-bold truncate font-text ${isSelected ? "text-primary" : "text-foreground"}`}>
                              {nome}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium font-text">
                              {reservations.length} {reservations.length === 1 ? "cidade" : "cidades"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                            <span className={`h-2 w-2 rounded-full ${statusColor}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Detailed Cities and Reservations */}
                <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden md:col-span-2">
                  {activeRepName ? (
                    <div>
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block font-text">
                            Cidades Reservadas por:
                          </span>
                          <h3 className="font-bold text-sm text-foreground mt-0.5 font-text">{activeRepName}</h3>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl flex items-center gap-1 text-[10px] text-primary font-semibold font-text">
                          <Users size={12} />
                          <span>{activeRepReservations.length} {activeRepReservations.length === 1 ? "Cidade" : "Cidades"}</span>
                        </div>
                      </div>

                      {/* Grid of City Cards */}
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto bg-muted/10">
                        {activeRepReservations.map((rep) => {
                          const pendingOficio = oficios.find(
                            (o) => o.representanteId === rep.id && o.status === "pending"
                          );
                          const approvedOficio = oficios.find(
                            (o) => o.representanteId === rep.id && o.status === "approved"
                          );

                          let cardBorder = "border-border";
                          let statusColorClass = "text-muted-foreground bg-muted/40 border-border";
                          let statusLabel = getStatusLabel(rep.status);

                          if (rep.status === "active") {
                            cardBorder = "border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-300";
                            statusColorClass = "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
                          } else if (rep.status === "waiting_letter") {
                            if (pendingOficio) {
                              cardBorder = "border-primary/30 hover:border-primary/50 ring-1 ring-primary/10";
                              statusColorClass = "text-primary bg-primary/10 border-primary/20";
                              statusLabel = "Ofício Recebido (Pendente)";
                            } else {
                              cardBorder = "border-amber-200 dark:border-amber-500/30 hover:border-amber-300";
                              statusColorClass = "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
                            }
                          } else if (rep.status === "waitlist") {
                            statusColorClass = "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
                          } else if (rep.status === "expired") {
                            cardBorder = "border-rose-200 dark:border-rose-500/30 hover:border-rose-300";
                            statusColorClass = "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
                          }

                          return (
                            <div
                              key={rep.id}
                              className={`bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 group ${cardBorder}`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5">
                                    <h4 className="font-extrabold text-sm text-foreground tracking-tight font-text">{rep.cidade}</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 font-text">
                                      <Calendar size={11} />
                                      Prazo: {new Date(rep.waitingDeadline).toLocaleDateString("pt-BR")}
                                    </p>
                                  </div>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border font-text ${statusColorClass}`}>
                                    {statusLabel}
                                  </span>
                                </div>

                                {pendingOficio && (
                                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5 flex items-start gap-1.5 text-[10px] text-foreground leading-tight font-text">
                                    <FileText size={12} className="text-primary shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                      <p className="font-semibold truncate max-w-[160px]">{pendingOficio.arquivoNomeOriginal}</p>
                                      <p className="text-[9px] text-muted-foreground">
                                        Recebido em {new Date(pendingOficio.sentAt).toLocaleDateString("pt-BR")}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="pt-3 border-t border-border flex flex-col gap-1.5 mt-auto">
                                {rep.status === "active" && approvedOficio && (
                                  <button
                                    onClick={() => window.open(`/api/autorizacoes/${approvedOficio.id}/pdf`, "_blank")}
                                    className="w-full flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold text-[10px] py-1.5 rounded-lg transition-all cursor-pointer"
                                  >
                                    <Download size={12} />
                                    Baixar Certificado
                                  </button>
                                )}

                                {podeEscrever && rep.status === "waiting_letter" && !pendingOficio && (
                                  <button
                                    onClick={() => {
                                      setUploadRepresentanteId(rep.id);
                                      setIsPreFilledUpload(true);
                                      setUploadFile(null);
                                      setUploadFileBase64("");
                                      setUploadError("");
                                      setIsOficioModalOpen(true);
                                    }}
                                    className="flex items-center justify-center gap-1 bg-foreground hover:opacity-90 text-background font-bold text-[10px] py-1.5 rounded-lg transition-opacity cursor-pointer"
                                  >
                                    <Upload size={12} />
                                    Anexar Ofício
                                  </button>
                                )}

                                {podeEscrever && rep.status === "waiting_letter" && pendingOficio && (
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                      onClick={() => handleApprove(pendingOficio.id)}
                                      disabled={processingOficioId === pendingOficio.id}
                                      className="flex items-center justify-center gap-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-bold text-[10px] py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                                    >
                                      <Check size={12} className="stroke-[3]" />
                                      Homologar
                                    </button>
                                    <button
                                      onClick={() => handleReject(pendingOficio.id)}
                                      disabled={processingOficioId === pendingOficio.id}
                                      className="flex items-center justify-center gap-1 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-bold text-[10px] py-1.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <XIcon size={12} className="stroke-[3]" />
                                      Rejeitar
                                    </button>
                                  </div>
                                )}

                                {rep.status === "waitlist" && (
                                  <div className="text-[10px] text-muted-foreground font-medium bg-muted/40 border border-border rounded-lg p-2 text-center leading-normal font-text">
                                    Em Fila: Aguardando liberação de cota.
                                  </div>
                                )}

                                {rep.status === "expired" && (
                                  <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg p-2 text-center leading-normal flex items-center justify-center gap-1 font-text">
                                    <AlertTriangle size={12} />
                                    Prazo para envio expirado.
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      <p className="text-xs font-text">Selecione um vendedor na lista ao lado para ver suas cidades reservadas.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: MODELO DE OFÍCIO */}
        {activeTab === "modelo" && (
          <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="font-bold text-sm text-foreground font-display">Modelo Oficial para Adesão</h3>
                <p className="text-muted-foreground text-[10px] mt-0.5 font-text">
                  Copie o texto base abaixo ou envie um documento para transcrever automaticamente o ofício.
                </p>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="file"
                  id="transcription-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileTranscription}
                  disabled={isTranscribing}
                />
                <label
                  htmlFor="transcription-upload"
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <Upload size={14} />
                  Transcrever Arquivo
                </label>

                <button
                  onClick={copyTemplateToClipboard}
                  className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs px-3.5 py-2 rounded-xl transition-all border border-primary/20 shadow-sm cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <ClipboardCheck size={14} />}
                  {copied ? "Copiado!" : "Copiar Modelo"}
                </button>

                <button
                  onClick={() => setIsWhatsappModalOpen(true)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>

                <button
                  onClick={downloadTemplatePDF}
                  className="flex items-center gap-1.5 bg-foreground hover:opacity-90 text-background font-semibold text-xs px-3.5 py-2 rounded-xl transition-opacity shadow-sm cursor-pointer"
                >
                  <Download size={14} />
                  Baixar PDF
                </button>
              </div>
            </div>

            <div className="p-6 bg-muted/30 rounded-2xl border border-border font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap select-all relative group overflow-hidden">
              {isTranscribing ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center animate-pulse">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-foreground font-text">Lendo e Transcrevendo Ofício...</p>
                    <p className="text-[10px] text-muted-foreground font-text">A IA está extraindo as informações societárias e preenchendo o modelo.</p>
                  </div>
                </div>
              ) : (
                <pre id="oficio-template-text" className="font-sans leading-loose text-foreground">
                  {displayTemplateText}
                </pre>
              )}
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-xxs text-foreground flex gap-3 items-start">
              <FileText size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-bold font-text">Como funciona a formalização?</p>
                <p className="text-muted-foreground leading-relaxed mt-0.5 font-text">
                  O vendedor deve copiar o texto base acima, preencher com seus dados societários e da cidade reservada, assinar digitalmente e nos enviar (enviar arquivo em PDF). Após o recebimento, anexe o documento na aba <strong>Ofícios Recebidos</strong> para homologar a cota e emitir a Autorização de Adesão.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: OFÍCIOS RECEBIDOS */}
        {activeTab === "oficios" && (
          <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/20">
              <div>
                <span className="text-xs font-bold text-foreground block font-text">Histórico de Ofícios Recebidos</span>
                <span className="text-[10px] text-muted-foreground font-medium font-text">Aguardando aprovação</span>
              </div>
              {podeEscrever && (
                <button
                  onClick={() => {
                    setUploadRepresentanteId("");
                    setIsPreFilledUpload(false);
                    setUploadFile(null);
                    setUploadFileBase64("");
                    setUploadError("");
                    setIsOficioModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-foreground hover:opacity-90 text-background font-semibold text-[10px] px-3 py-2 rounded-lg transition-opacity"
                >
                  <Upload size={14} /> Anexar Ofício
                </button>
              )}
            </div>

            {oficios.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground space-y-2">
                <Send size={24} className="mx-auto text-muted-foreground/60" />
                <p className="text-xs font-text">Nenhum documento de ofício recebido nesta Ata.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase font-text">
                      <th className="p-4">Remetente</th>
                      <th className="p-4">Cidade</th>
                      <th className="p-4">Arquivo</th>
                      <th className="p-4">Enviado Em</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {oficios.map((oficio) => (
                      <tr key={oficio.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-semibold text-foreground font-text">{oficio.representante.nome}</td>
                        <td className="p-4 text-muted-foreground font-text">{oficio.representante.cidade}</td>
                        <td className="p-4 text-primary font-medium">
                          <button
                            onClick={() => window.open(`/api/oficios/${oficio.id}/pdf`, "_blank")}
                            className="flex items-center gap-1 underline cursor-pointer"
                          >
                            <FileSpreadsheet size={14} className="text-muted-foreground" />
                            <span className="truncate max-w-[160px]">{oficio.arquivoNomeOriginal}</span>
                          </button>
                        </td>
                        <td className="p-4 text-muted-foreground font-text">
                          {new Date(oficio.sentAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-4 text-right">
                          {oficio.status === "pending" ? (
                            podeEscrever ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleApprove(oficio.id)}
                                  disabled={processingOficioId === oficio.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-[10px] px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                                >
                                  Homologar/Aprovar
                                </button>
                                <button
                                  onClick={() => handleReject(oficio.id)}
                                  disabled={processingOficioId === oficio.id}
                                  className="bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-semibold text-[10px] px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 font-text">
                                Pendente
                              </span>
                            )
                          ) : oficio.status === "approved" ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-text">
                              Aprovado
                            </span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 font-text">
                              Rejeitado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: AUTORIZAÇÃO DE ADESÃO */}
        {activeTab === "autorizacoes" && (
          <div className="bg-card border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-foreground font-display">Autorizações Emitidas</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-text">Certificados formais gerados após aprovação do ofício.</p>
              </div>
              <span className="text-[10px] text-muted-foreground font-bold bg-muted/40 px-2 py-1 rounded-lg font-text">
                {autorizacoes.length} Documentos
              </span>
            </div>

            {autorizacoes.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <UserCheck size={28} className="mx-auto text-muted-foreground/60" />
                <p className="text-xs font-text">Nenhum certificado de autorização emitido até o momento.</p>
                <p className="text-[10px] text-muted-foreground max-w-sm mx-auto font-text">
                  Aprove um ofício anexado para gerar de forma automatizada o certificado de homologação da cota de adesão.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase font-text">
                      <th className="p-4">Nº do Certificado</th>
                      <th className="p-4">Representante Autorizado</th>
                      <th className="p-4">Cidade Autorizada</th>
                      <th className="p-4">Data de Emissão</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {autorizacoes.map((aut) => (
                      <tr key={aut.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-mono font-bold text-primary">{aut.numero}</td>
                        <td className="p-4 font-semibold text-foreground font-text">{aut.oficio.representante.nome}</td>
                        <td className="p-4 text-muted-foreground font-text">{aut.oficio.representante.cidade}</td>
                        <td className="p-4 text-muted-foreground flex items-center gap-1 font-text">
                          <Calendar size={12} />
                          {new Date(aut.dataEmissao).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => window.open(`/api/autorizacoes/${aut.oficio.id}/pdf`, "_blank")}
                            className="text-[10px] text-primary hover:opacity-80 font-bold underline flex items-center gap-0.5 justify-end ml-auto"
                          >
                            <Download size={11} /> Baixar Certificado
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {isRepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsRepModalOpen(false)} />
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider font-display">
                Vincular Novo Vendedor
              </h3>
              <button onClick={() => setIsRepModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
                <XIcon size={16} />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleAddRep} className="space-y-4">
                {repError && (
                  <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
                    <AlertCircle size={14} />
                    <span>{repError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Nome do Representante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva Representações"
                    value={repNome}
                    onChange={(e) => setRepNome(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Cidade Pretendida de Venda
                  </label>
                  <CityCombobox value={repCidade} onChange={setRepCidade} placeholder="Busque a cidade (ex: São Paulo)" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Dias de Espera para o Ofício
                  </label>
                  <input
                    type="number"
                    value={repDias}
                    onChange={(e) => setRepDias(Number(e.target.value))}
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
                  disabled={repSubmitting}
                  className="w-full flex items-center justify-center gap-1.5 bg-foreground hover:opacity-90 disabled:opacity-50 text-background font-semibold text-xs py-2 rounded-xl transition-opacity mt-2"
                >
                  <Plus size={14} />
                  {repSubmitting ? "Cadastrando..." : "Cadastrar Vendedor"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isOficioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsOficioModalOpen(false)} />
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
                <Upload size={14} className="text-primary" /> Anexar Ofício
              </h3>
              <button onClick={() => setIsOficioModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
                <XIcon size={16} />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleUploadOficio} className="space-y-4">
                {uploadError && (
                  <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xxs font-medium flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
                    <AlertCircle size={14} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {isPreFilledUpload ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                      Representante Remetente
                    </label>
                    <input
                      type="text"
                      value={(() => {
                        const rep = representantes.find((r) => r.id === uploadRepresentanteId);
                        return rep ? `${rep.nome} (${rep.cidade})` : "";
                      })()}
                      disabled
                      className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs text-muted-foreground cursor-not-allowed font-medium font-text"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                      Representante Remetente
                    </label>
                    <select
                      value={uploadRepresentanteId}
                      onChange={(e) => setUploadRepresentanteId(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                      required
                    >
                      <option value="">Selecione o vendedor...</option>
                      {representantes
                        .filter((r) => r.status === "waiting_letter" || r.status === "expired")
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nome} ({r.cidade})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Upload do Ofício (PDF)
                  </label>
                  <div className="border-2 border-dashed border-border hover:border-primary rounded-xl p-5 transition-all text-center cursor-pointer bg-muted/20 hover:bg-primary/5 relative group flex flex-col items-center justify-center min-h-[90px]">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      required={!uploadFile}
                    />
                    <Upload size={18} className="text-muted-foreground group-hover:text-primary transition-colors mb-1.5" />
                    <p className="text-xxs font-bold text-foreground font-text">
                      {uploadFile ? uploadFile.name : "Clique para selecionar o arquivo"}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 font-text">Apenas arquivos PDF</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploadSubmitting}
                  className="w-full flex items-center justify-center gap-1.5 bg-foreground hover:opacity-90 disabled:opacity-50 text-background font-semibold text-xs py-2.5 rounded-xl transition-opacity mt-2"
                >
                  <Upload size={14} />
                  {uploadSubmitting ? "Enviando..." : "Anexar e Processar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/*
        Modal "Enviar via WhatsApp": deep-link manual (wa.me) + download do PDF do
        modelo de ofício. NÃO faz parte da integração com a WhatsApp Business Cloud
        API (essa é a página /whatsapp) — mantido intencionalmente intocado na fase
        de implementação do dashboard de métricas do WhatsApp.
      */}
      {isWhatsappModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsWhatsappModalOpen(false)} />
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-emerald-600">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar via WhatsApp
              </h3>
              <button onClick={() => setIsWhatsappModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
                <XIcon size={16} />
              </button>
            </div>

            <div className="p-5">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  let cleanPhone = whatsappPhone.replace(/\D/g, "");
                  if (cleanPhone.length > 0) {
                    if (cleanPhone.length <= 11) cleanPhone = "55" + cleanPhone;

                    await downloadTemplatePDF();

                    const text = `Olá! Segue em anexo o PDF do Ofício de Adesão formalizado para a cota da ata ${ata.numero}. (Por favor, anexe o arquivo PDF que acabou de ser baixado nesta conversa).`;
                    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
                    window.open(url, "_blank");
                    setIsWhatsappModalOpen(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Vendedor Destinatário
                  </label>
                  <select
                    value={whatsappSelectedRep}
                    onChange={(e) => setWhatsappSelectedRep(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                    required
                  >
                    <option value="other">Outro número (Digitar manualmente)</option>
                    {uniqueRepNames.map((nome) => (
                      <option key={nome} value={nome}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-text">
                    Número do WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 11999999999"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text"
                    required
                  />
                  <span className="text-[9px] text-muted-foreground block mt-0.5 font-text">
                    Digite apenas números com DDD (ex: 11999999999). O DDI (+55) será adicionado se não inserido.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors mt-4 shadow-sm"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Iniciar Conversa e Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
