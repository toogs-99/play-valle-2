"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useAtas } from "@/hooks/useAtas";
import {
  ArrowLeft,
  Users,
  FileText,
  Send,
  UserCheck,
  Plus,
  AlertTriangle,
  ClipboardCheck,
  Check,
  Upload,
  Calendar,
  FileSpreadsheet,
  Download,
  X
} from "lucide-react";
import CityCombobox from "@/components/CityCombobox";

export default function AtaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ataId } = use(params);
  const {
    atas,
    representantes,
    oficios,
    autorizacoes,
    loading,
    addRepresentante,
    uploadOficio,
    approveOficio,
  } = useAtas();

  // Active tab state
  const [activeTab, setActiveTab] = useState<"representantes" | "modelo" | "oficios" | "autorizacoes">("representantes");

  // Selected representative name state for master-detail view
  const [selectedRepName, setSelectedRepName] = useState<string | null>(null);

  // Modal states
  const [isRepModalOpen, setIsRepModalOpen] = useState(false);
  const [isOficioModalOpen, setIsOficioModalOpen] = useState(false);

  // Representative registration form state
  const [repName, setRepName] = useState("");
  const [repRegion, setRepRegion] = useState("");
  const [repDays, setRepDays] = useState(30);
  const [repSuccess, setRepSuccess] = useState(false);

  // Office upload form state
  const [uploadRepName, setUploadRepName] = useState("");
  const [uploadRegion, setUploadRegion] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // General States
  const [copied, setCopied] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappSelectedRep, setWhatsappSelectedRep] = useState("other");

  const activeAta = atas.find((a) => a.id === ataId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650" />
      </div>
    );
  }

  if (!activeAta) {
    return (
      <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4">
        <h3 className="font-bold text-sm text-slate-800">Ata não encontrada</h3>
        <p className="text-xs text-slate-400">
          A Ata solicitada não existe ou foi excluída do sistema.
        </p>
        <Link
          href="/atas"
          className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
        >
          Voltar para Atas
        </Link>
      </div>
    );
  }

  // Filter items matching current Ata
  const filteredReps = representantes.filter((r) => r.ataId === ataId);
  const filteredOficios = oficios.filter((o) => o.ataId === ataId);
  const filteredAutorizacoes = autorizacoes.filter((a) => a.ataId === ataId);

  // Group representatives by name
  const repsByName = filteredReps.reduce((acc, rep) => {
    if (!acc[rep.name]) {
      acc[rep.name] = [];
    }
    acc[rep.name].push(rep);
    return acc;
  }, {} as Record<string, typeof filteredReps>);

  const uniqueRepNames = Object.keys(repsByName);
  const activeRepName = (selectedRepName && uniqueRepNames.includes(selectedRepName))
    ? selectedRepName
    : (uniqueRepNames[0] || null);
  const activeRepReservations = activeRepName ? repsByName[activeRepName] || [] : [];

  // Handle Representative Submission
  const handleAddRep = (e: React.FormEvent) => {
    e.preventDefault();
    setRepSuccess(false);

    if (!repName.trim() || !repRegion.trim()) return;

    // Process Addition
    addRepresentante(ataId, repName.trim(), repRegion.trim(), repDays);
    setSelectedRepName(repName.trim());
    setRepName("");
    setRepRegion("");
    setRepDays(30);
    setRepSuccess(true);
    setTimeout(() => {
      setRepSuccess(false);
      setIsRepModalOpen(false);
    }, 2000);
  };

  // Handle Upload of Official Letter
  const handleUploadOficio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadRepName || !uploadRegion || !uploadFileName.trim()) return;

    uploadOficio(ataId, uploadRepName, uploadRegion, uploadFileName.trim());
    setUploadRepName("");
    setUploadRegion("");
    setUploadFileName("");
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsOficioModalOpen(false);
    }, 2000);
  };

  // Copy Template
  const copyTemplateToClipboard = () => {
    const text = document.getElementById("oficio-template-text")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "expired":
        return "bg-rose-50 text-rose-700 border border-rose-100";
      case "waitlist":
        return "bg-amber-100 text-amber-800 border border-amber-300"; // A stronger yellow
      default:
        return "bg-amber-50 text-amber-700 border border-amber-100";
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
  const getLetterTemplate = () => {
    return `OFÍCIO DE ADESÃO DE COTAS Nº ____/2026

Ao Órgão Gerenciador: ${activeAta.organ}
Ref: Solicitação de Adesão à ${activeAta.number}

Prezados Senhores,

A empresa [Nome do Representante], inscrita no CNPJ sob o nº [CNPJ do Representante], estabelecida comercialmente na cidade de [Cidade do Representante], manifesta formalmente o interesse em aderir à Ata de Registro de Preços nº ${activeAta.number}, com validade estabelecida até [Data Final da Ata].

Solicitamos autorização para contratação da cota de fornecimento correspondente aos itens acordados, conforme especificações técnicas descritas no Termo de Referência da Ata de Registro de Preços:
- Descrição da Ata: ${activeAta.description}

Agradecemos a atenção e nos colocamos à disposição para os trâmites subsequentes e formalização de contrato.

Atenciosamente,

___________________________________________
[Nome do Diretor / Assinatura do Representante]
Representante Autorizado`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          href="/atas"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar para Atas de Registro de Preços
        </Link>
      </div>

      {/* Ata Header Display Card */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
              Gerenciamento Ativo
            </span>
            <span className="text-xxs text-slate-400">Criada em {activeAta.createdAt}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {activeAta.number}
          </h2>
          <p className="text-xs text-slate-500 font-medium">{activeAta.organ}</p>
          <p className="text-xxs text-slate-400 mt-2 max-w-2xl italic leading-relaxed">
            "{activeAta.description}"
          </p>
        </div>

        {/* Overview Stats */}
        <div className="flex gap-3 sm:gap-6 self-start md:self-center">
          <div className="text-center bg-slate-50 border border-slate-100 p-3 rounded-xl min-w-[80px]">
            <span className="block text-xl font-bold text-slate-800">{filteredReps.length}</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Vendedores</span>
          </div>
          <div className="text-center bg-slate-50 border border-slate-100 p-3 rounded-xl min-w-[80px]">
            <span className="block text-xl font-bold text-amber-600">
              {filteredReps.filter((r) => r.status === "waiting_letter").length}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Em Espera</span>
          </div>
          <div className="text-center bg-slate-50 border border-slate-100 p-3 rounded-xl min-w-[80px]">
            <span className="block text-xl font-bold text-emerald-600">
              {filteredAutorizacoes.length}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase">Aprovados</span>
          </div>
        </div>
      </div>

      {/* Top Tab Navigation */}
      <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60 flex flex-wrap gap-1 mt-6">
        <button
          onClick={() => setActiveTab("representantes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === "representantes"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200/40"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/30"
          }`}
        >
          <Users size={14} className={activeTab === "representantes" ? "text-indigo-650" : "text-slate-400"} />
          Representantes
        </button>

        <button
          onClick={() => setActiveTab("modelo")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === "modelo"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200/40"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/30"
          }`}
        >
          <FileText size={14} className={activeTab === "modelo" ? "text-indigo-650" : "text-slate-400"} />
          Modelo de Ofício
        </button>

        <button
          onClick={() => setActiveTab("oficios")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all relative ${
            activeTab === "oficios"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200/40"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/30"
          }`}
        >
          <Send size={14} className={activeTab === "oficios" ? "text-indigo-650" : "text-slate-400"} />
          Ofícios Recebidos
          {filteredOficios.filter((o) => o.status === "pending").length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("autorizacoes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
            activeTab === "autorizacoes"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200/40"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/30"
          }`}
        >
          <UserCheck size={14} className={activeTab === "autorizacoes" ? "text-indigo-650" : "text-slate-400"} />
          Autorização de Adesão
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        
        {/* Tab 1: REPRESENTANTES */}
        {activeTab === "representantes" && (
          <div>
            {filteredReps.length === 0 ? (
              <div className="bg-white border border-slate-155 rounded-2xl shadow-sm p-12 text-center text-slate-400 space-y-4">
                <Users size={32} className="mx-auto text-slate-300" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">Nenhum vendedor cadastrado</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Não há nenhum representante vinculado a esta Ata de Registro de Preços ainda.
                  </p>
                </div>
                <button
                  onClick={() => setIsRepModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Plus size={14} /> Vincular Primeiro Vendedor
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Left Column: Unique Representatives List */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden md:col-span-1">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-xs text-slate-800">Vendedores</h3>
                      <p className="text-[10px] text-slate-400 font-medium">{uniqueRepNames.length} no total</p>
                    </div>
                    <button
                      onClick={() => setIsRepModalOpen(true)}
                      className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus size={12} /> Novo Vendedor
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto">
                    {uniqueRepNames.map((name) => {
                      const reservations = repsByName[name] || [];
                      const isSelected = name === activeRepName;
                      
                      const hasActive = reservations.some(r => r.status === "active");
                      const hasExpired = reservations.some(r => r.status === "expired");
                      const hasWaitlist = reservations.some(r => r.status === "waitlist");
                      const hasWaiting = reservations.some(r => r.status === "waiting_letter");

                      let statusColor = "bg-slate-300";
                      if (hasActive) statusColor = "bg-emerald-500";
                      else if (hasWaiting) statusColor = "bg-amber-500";
                      else if (hasWaitlist) statusColor = "bg-amber-500";
                      else if (hasExpired) statusColor = "bg-rose-500";

                      return (
                        <button
                          key={name}
                          onClick={() => setSelectedRepName(name)}
                          className={`w-full text-left p-4 transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? "bg-indigo-50/60 border-l-4 border-indigo-600"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="space-y-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${
                              isSelected ? "text-indigo-900" : "text-slate-800"
                            }`}>
                              {name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
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
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden md:col-span-2">
                  {activeRepName ? (
                    <div>
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                            Cidades Reservadas por:
                          </span>
                          <h3 className="font-bold text-sm text-slate-800 mt-0.5">{activeRepName}</h3>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl flex items-center gap-1 text-[10px] text-indigo-800 font-semibold">
                          <Users size={12} className="text-indigo-650" />
                          <span>{activeRepReservations.length} {activeRepReservations.length === 1 ? "Cidade" : "Cidades"}</span>
                        </div>
                      </div>

                      {/* List/Table of Cities */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/20 text-[10px] font-bold text-slate-400 uppercase">
                              <th className="p-4">Cidade / Região</th>
                              <th className="p-4">Prazo de Envio do Ofício</th>
                              <th className="p-4 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {activeRepReservations.map((rep) => (
                              <tr key={rep.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="p-4 font-semibold text-slate-800">{rep.region}</td>
                                <td className="p-4 text-slate-500">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar size={12} className="text-slate-400" />
                                    <span>{rep.waitingDeadline}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${getStatusBadge(rep.status)}`}>
                                    {getStatusLabel(rep.status)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Informational Footer */}
                      <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-xxs text-slate-400 flex items-center gap-2">
                        <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                        <span>
                          Para alterar o status de uma cota de adesão, anexe o ofício recebido na aba correspondente acima.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400">
                      <p className="text-xs">Selecione um vendedor na lista ao lado para ver suas cidades reservadas.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: MODELO DE OFÍCIO */}
        {activeTab === "modelo" && (
          <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Modelo Oficial para Adesão</h3>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Copie o texto base abaixo para que o representante envie a formalização de cota.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyTemplateToClipboard}
                  className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all border border-indigo-150 shadow-sm"
                >
                  {copied ? <Check size={14} className="text-indigo-650" /> : <ClipboardCheck size={14} />}
                  {copied ? "Copiado!" : "Copiar Modelo"}
                </button>
                <button
                  onClick={() => setIsWhatsappModalOpen(true)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([getLetterTemplate()], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `Modelo_Oficio_Adesao_${activeAta.number.replace(/\//g, "-")}.txt`;
                    link.click();
                  }}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  <Download size={14} />
                  Baixar .TXT
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-150 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-all relative group">
              <pre id="oficio-template-text" className="font-sans leading-loose text-slate-650">
                {getLetterTemplate()}
              </pre>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-xxs text-indigo-955 flex gap-3 items-start">
              <FileText size={16} className="text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Como funciona a formalização?</p>
                <p className="text-indigo-750/80 leading-relaxed mt-0.5">
                  O vendedor deve copiar o texto base acima, preencher com seus dados societários e da cidade reservada, assinar digitalmente e nos enviar (enviar arquivo em PDF). Após o recebimento, anexe o documento na aba <strong>Ofícios Recebidos</strong> para homologar a cota e emitir a Autorização de Adesão.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: OFÍCIOS RECEBIDOS */}
        {activeTab === "oficios" && (
          <div className="bg-white border border-slate-155 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/10">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Histórico de Ofícios Recebidos</span>
                <span className="text-[10px] text-slate-400 font-medium">Aguardando aprovação</span>
              </div>
              <button
                onClick={() => setIsOficioModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] px-3 py-2 rounded-lg transition-colors"
              >
                <Upload size={14} /> Anexar Ofício
              </button>
            </div>

            {filteredOficios.length === 0 ? (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <Send size={24} className="mx-auto text-slate-300" />
                <p className="text-xs">Nenhum documento de ofício recebido nesta Ata.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-455 uppercase">
                      <th className="p-4">Remetente</th>
                      <th className="p-4">Cidade</th>
                      <th className="p-4">Arquivo</th>
                      <th className="p-4">Enviado Em</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOficios.map((oficio) => (
                      <tr key={oficio.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 font-semibold text-slate-850">{oficio.representanteName}</td>
                        <td className="p-4 text-slate-500">{oficio.region}</td>
                        <td className="p-4 text-indigo-600 font-medium flex items-center gap-1">
                          <FileSpreadsheet size={14} className="text-slate-400" />
                          <span className="underline cursor-pointer">{oficio.fileName}</span>
                        </td>
                        <td className="p-4 text-slate-450">{oficio.sentAt}</td>
                        <td className="p-4 text-right">
                          {oficio.status === "pending" ? (
                            <button
                              onClick={() => approveOficio(oficio.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                            >
                              Homologar/Aprovar
                            </button>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Aprovado
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
          <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Autorizações Emitidas</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Certificados formais gerados após aprovação do ofício.</p>
              </div>
              <span className="text-[10px] text-slate-450 font-bold bg-slate-100 px-2 py-1 rounded-lg">
                {filteredAutorizacoes.length} Documentos
              </span>
            </div>

            {filteredAutorizacoes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <UserCheck size={28} className="mx-auto text-slate-300" />
                <p className="text-xs">Nenhum certificado de autorização emitido até o momento.</p>
                <p className="text-[10px] text-slate-450 max-w-sm mx-auto">
                  Aprove um ofício anexado para gerar de forma automatizada o certificado de homologação da cota de adesão.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-450 uppercase">
                      <th className="p-4">Nº do Certificado</th>
                      <th className="p-4">Representante Autorizado</th>
                      <th className="p-4">Cidade Autorizada</th>
                      <th className="p-4">Data de Emissão</th>
                      <th className="p-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAutorizacoes.map((aut) => (
                      <tr key={aut.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-700">{aut.documentNumber}</td>
                        <td className="p-4 font-semibold text-slate-800">{aut.representanteName}</td>
                        <td className="p-4 text-slate-500">{aut.region}</td>
                        <td className="p-4 text-slate-450 flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {aut.issuedAt}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              alert(`MOCK DOWNLOAD: Baixando arquivo ${aut.documentNumber}.pdf para formalização.`);
                            }}
                            className="text-[10px] text-indigo-650 hover:text-indigo-850 font-bold underline flex items-center gap-0.5 justify-end"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                Vincular Novo Vendedor
              </h3>
              <button onClick={() => setIsRepModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5">
              <form onSubmit={handleAddRep} className="space-y-4">
                {repSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xxs font-medium flex items-center gap-1">
                    <Check size={14} />
                    <span>Representante vinculado com sucesso!</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nome do Representante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva Representações"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cidade Pretendida de Venda
                  </label>
                  <CityCombobox
                    value={repRegion}
                    onChange={setRepRegion}
                    placeholder="Busque a cidade (ex: São Paulo)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Dias de Espera para o Ofício
                  </label>
                  <input
                    type="number"
                    value={repDays}
                    onChange={(e) => setRepDays(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Prazo em dias corridos para o envio formal do ofício.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-xl transition-colors mt-2"
                >
                  <Plus size={14} />
                  Cadastrar Vendedor
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isOficioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Upload size={14} className="text-indigo-650" /> Anexar Ofício
              </h3>
              <button onClick={() => setIsOficioModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5">
              <form onSubmit={handleUploadOficio} className="space-y-4">
                {uploadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xxs font-medium flex items-center gap-1">
                    <Check size={14} />
                    <span>Ofício anexado com sucesso!</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Representante Remetente
                  </label>
                  <select
                    value={uploadRepName}
                    onChange={(e) => {
                      setUploadRepName(e.target.value);
                      const matched = filteredReps.find((r) => r.name === e.target.value);
                      if (matched) setUploadRegion(matched.region);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Selecione o vendedor...</option>
                    {filteredReps
                      .filter((r) => r.status === "waiting_letter" || r.status === "expired")
                      .map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.region})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cidade Automática
                  </label>
                  <input
                    type="text"
                    value={uploadRegion}
                    disabled
                    placeholder="Selecione o representante acima..."
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-450 focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nome do Arquivo PDF
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: oficio_assinado_sul_minas.pdf"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors mt-2"
                >
                  <Upload size={14} />
                  Anexar e Processar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isWhatsappModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-emerald-600">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar via WhatsApp
              </h3>
              <button onClick={() => setIsWhatsappModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  let cleanPhone = whatsappPhone.replace(/\D/g, "");
                  if (cleanPhone.length > 0) {
                    if (cleanPhone.length <= 11) {
                      cleanPhone = "55" + cleanPhone;
                    }
                    const text = getLetterTemplate();
                    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
                    window.open(url, "_blank");
                    setIsWhatsappModalOpen(false);
                  }
                }} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Vendedor Destinatário
                  </label>
                  <select
                    value={whatsappSelectedRep}
                    onChange={(e) => {
                      setWhatsappSelectedRep(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="other">Outro número (Digitar manualmente)</option>
                    {uniqueRepNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Número do WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 11999999999"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Digite apenas números com DDD (ex: 11999999999). O DDI (+55) será adicionado se não inserido.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors mt-4 shadow-sm"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
