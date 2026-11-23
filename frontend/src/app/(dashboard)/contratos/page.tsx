"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/lib/useToast";

interface Ata {
  id: string;
  numero: string;
  orgao: string;
}

interface ItemSaldo {
  id: string;
  descricao: string;
  unidade: string;
  valorUnitario: number;
  quantidade: number;
  quantidadeContratada: number;
  saldoQuantidade: number;
  saldoValor: number;
}

interface Empenho {
  id: string;
  tipo: "nota_empenho" | "ordem_compra";
  numero: string;
  valor: string;
  emitidoEm: string;
}

interface Contrato {
  id: string;
  ataId: string;
  numero: string;
  municipio: string | null;
  assinadoEm: string;
  observacao: string | null;
  valorContratado: string;
  valorEmpenhado: number;
  ata: Ata;
  empenhos: Empenho[];
  itens: {
    id: string;
    quantidade: number;
    valorUnitario: string;
    itemAta: { descricao: string; unidade: string };
  }[];
}

interface MarcaAtiva {
  marcaId: string;
  papel: "admin" | "gestor_atas" | "financeiro" | "vendedor";
}

const PAPEIS_ESCRITA = ["admin", "gestor_atas"];
const PAPEIS_LEITURA = ["admin", "gestor_atas", "financeiro"];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const inputCls =
  "w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-text";
const labelCls = "text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 font-text";

export default function ContratosPage() {
  const { toast } = useToast();

  const [marca, setMarca] = useState<MarcaAtiva | null>(null);
  const [atas, setAtas] = useState<Ata[]>([]);
  const [ataId, setAtaId] = useState("");
  const [itens, setItens] = useState<ItemSaldo[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form: novo produto
  const [pDesc, setPDesc] = useState("");
  const [pUn, setPUn] = useState("un");
  const [pValor, setPValor] = useState("");
  const [pQtd, setPQtd] = useState("");

  // Form: novo contrato/empenho
  const [cNumero, setCNumero] = useState("");
  const [cMunicipio, setCMunicipio] = useState("");
  const [cData, setCData] = useState(() => new Date().toISOString().slice(0, 10));
  const [cObs, setCObs] = useState("");
  // Form: novo empenho (por contrato aberto)
  const [eContratoId, setEContratoId] = useState<string | null>(null);
  const [eTipo, setETipo] = useState<"nota_empenho" | "ordem_compra">("nota_empenho");
  const [eNumero, setENumero] = useState("");
  const [eValor, setEValor] = useState("");
  const [cQtds, setCQtds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const podeEscrever = !!marca && PAPEIS_ESCRITA.includes(marca.papel);

  const carregarAta = useCallback(async (marcaId: string, id: string) => {
    const [itensRes, contratosRes] = await Promise.all([
      fetch(`/api/atas/${id}/itens`),
      fetch(`/api/contratos?marcaId=${marcaId}&ataId=${id}`),
    ]);
    if (!itensRes.ok || !contratosRes.ok) throw new Error("Falha ao carregar dados da ata.");
    setItens((await itensRes.json()).itens);
    setContratos((await contratosRes.json()).contratos);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const marcaRes = await fetch("/api/marca-ativa");
        if (!marcaRes.ok) throw new Error("Não foi possível identificar a marca ativa.");
        const { marcaAtiva } = await marcaRes.json();
        if (cancelled) return;
        if (!PAPEIS_LEITURA.includes(marcaAtiva.papel)) {
          throw new Error("Seu papel não tem acesso a contratos e empenhos.");
        }
        setMarca(marcaAtiva);
        const atasRes = await fetch(`/api/atas?marcaId=${marcaAtiva.marcaId}`);
        if (!atasRes.ok) throw new Error("Falha ao carregar atas.");
        const lista: Ata[] = (await atasRes.json()).atas;
        if (cancelled) return;
        setAtas(lista);
        if (lista[0]) setAtaId(lista[0].id);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro inesperado.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!marca || !ataId) return;
    (async () => {
      try {
        await carregarAta(marca.marcaId, ataId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro inesperado.");
      }
    })();
  }, [marca, ataId, carregarAta]);

  const totais = useMemo(
    () => ({
      contratado: itens.reduce((a, i) => a + i.valorUnitario * i.quantidadeContratada, 0),
      saldo: itens.reduce((a, i) => a + i.saldoValor, 0),
    }),
    [itens]
  );

  async function enviar(url: string, body: unknown, okMsg: string) {
    setSaving(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ description: data.error || "Falha ao salvar." });
        return false;
      }
      toast({ description: okMsg });
      if (marca) await carregarAta(marca.marcaId, ataId);
      return true;
    } catch {
      toast({ description: "Erro de rede." });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function adicionarProduto(e: React.FormEvent) {
    e.preventDefault();
    const ok = await enviar(
      `/api/atas/${ataId}/itens`,
      { descricao: pDesc, unidade: pUn, valorUnitario: Number(pValor), quantidade: Number(pQtd) },
      "Produto adicionado à ata."
    );
    if (ok) {
      setPDesc("");
      setPValor("");
      setPQtd("");
    }
  }

  async function lancarContrato(e: React.FormEvent) {
    e.preventDefault();
    const linhas = Object.entries(cQtds)
      .filter(([, q]) => Number(q) > 0)
      .map(([itemAtaId, q]) => ({ itemAtaId, quantidade: Number(q) }));
    const ok = await enviar(
      "/api/contratos",
      { ataId, numero: cNumero, municipio: cMunicipio, data: cData, observacao: cObs, itens: linhas },
      "Contrato registrado e abatido da ata."
    );
    if (ok) {
      setCNumero("");
      setCMunicipio("");
      setCObs("");
      setCQtds({});
    }
  }

  async function lancarEmpenho(e: React.FormEvent) {
    e.preventDefault();
    if (!eContratoId) return;
    const ok = await enviar(
      `/api/contratos/${eContratoId}/empenhos`,
      { tipo: eTipo, numero: eNumero, valor: Number(eValor) },
      "Empenho registrado."
    );
    if (ok) {
      setEContratoId(null);
      setENumero("");
      setEValor("");
    }
  }

  async function remover(url: string, confirmMsg: string) {
    if (!window.confirm(confirmMsg) || !marca) return;
    const res = await fetch(url, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast({ description: data.error || "Falha ao remover." });
      return;
    }
    await carregarAta(marca.marcaId, ataId);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-[12px] p-12 text-center max-w-2xl mx-auto space-y-2">
        <AlertCircle size={28} className="mx-auto text-destructive" />
        <p className="text-sm font-semibold text-foreground font-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight font-display">
            Contratos e Empenhos
          </h2>
          <p className="text-muted-foreground text-xs mt-1.5 font-text">
            Registre o que cada município comprou para abater os itens e valores da ata.
          </p>
        </div>
        <div className="sm:w-80">
          <label className={labelCls}>Ata</label>
          <select value={ataId} onChange={(e) => {
              setAtaId(e.target.value);
              setCQtds({});
            }} className={inputCls}>
            {atas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.numero} — {a.orgao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {atas.length === 0 ? (
        <p className="text-xs text-muted-foreground font-text">Cadastre uma ata primeiro.</p>
      ) : (
        <>
          {/* Saldo por produto */}
          <section className="bg-card border border-border rounded-[12px] overflow-hidden">
            <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-foreground font-display">Produtos da ata e saldo</h3>
              <span className="text-[10px] text-muted-foreground font-text">
                Contratado: <b>{brl(totais.contratado)}</b> · Saldo: <b>{brl(totais.saldo)}</b>
              </span>
            </div>
            {itens.length === 0 ? (
              <p className="p-6 text-xs text-muted-foreground font-text">
                Nenhum produto cadastrado nesta ata.
                {podeEscrever && " Cadastre abaixo para poder lançar contratos e vendas por produto."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase">
                      <th className="p-3">Produto</th>
                      <th className="p-3 text-right">Valor unit.</th>
                      <th className="p-3 text-right">Registrado</th>
                      <th className="p-3 text-right">Contratado</th>
                      <th className="p-3 text-right">Saldo (qtd)</th>
                      <th className="p-3 text-right">Saldo (R$)</th>
                      {podeEscrever && <th className="p-3" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {itens.map((i) => (
                      <tr key={i.id}>
                        <td className="p-3 font-semibold text-foreground">{i.descricao}</td>
                        <td className="p-3 text-right">{brl(i.valorUnitario)}</td>
                        <td className="p-3 text-right">{i.quantidade} {i.unidade}</td>
                        <td className="p-3 text-right">{i.quantidadeContratada}</td>
                        <td className={`p-3 text-right font-bold ${i.saldoQuantidade <= 0 ? "text-rose-600" : ""}`}>
                          {i.saldoQuantidade}
                        </td>
                        <td className="p-3 text-right">{brl(i.saldoValor)}</td>
                        {podeEscrever && (
                          <td className="p-3 text-right">
                            <button
                              onClick={() => remover(`/api/itens-ata/${i.id}`, `Remover "${i.descricao}" da ata?`)}
                              className="text-muted-foreground hover:text-rose-600"
                              aria-label="Remover produto"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {podeEscrever && (
              <form onSubmit={adicionarProduto} className="p-4 border-t border-border grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div className="col-span-2">
                  <label className={labelCls}>Produto *</label>
                  <input className={inputCls} value={pDesc} onChange={(e) => setPDesc(e.target.value)} required />
                </div>
                <div>
                  <label className={labelCls}>Valor unit. (R$) *</label>
                  <input className={inputCls} type="number" min={0} step="0.01" value={pValor} onChange={(e) => setPValor(e.target.value)} required />
                </div>
                <div>
                  <label className={labelCls}>Qtd. registrada *</label>
                  <input className={inputCls} type="number" min={1} step={1} value={pQtd} onChange={(e) => setPQtd(e.target.value)} required />
                </div>
                <button disabled={saving} className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-semibold text-xs px-4 py-2 rounded-xl">
                  <Plus size={14} /> Adicionar
                </button>
              </form>
            )}
          </section>

          {/* Novo lançamento */}
          {podeEscrever && itens.length > 0 && (
            <form onSubmit={lancarContrato} className="bg-card border border-border rounded-[12px] p-4 space-y-4">
              <h3 className="font-bold text-sm text-foreground font-display">Novo contrato</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Número *</label>
                  <input className={inputCls} value={cNumero} onChange={(e) => setCNumero(e.target.value)} required />
                </div>
                <div>
                  <label className={labelCls}>Município *</label>
                  <input className={inputCls} value={cMunicipio} onChange={(e) => setCMunicipio(e.target.value)} required />
                </div>
                <div>
                  <label className={labelCls}>Data de assinatura *</label>
                  <input className={inputCls} type="date" value={cData} onChange={(e) => setCData(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Quantidade comprada por produto</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {itens.map((i) => (
                    <div key={i.id} className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2">
                      <span className="flex-1 text-xs text-foreground font-text">
                        {i.descricao}
                        <span className="block text-[10px] text-muted-foreground">
                          saldo {i.saldoQuantidade} · {brl(i.valorUnitario)}
                        </span>
                      </span>
                      <input
                        className="w-24 px-2 py-1.5 bg-background border border-border rounded-lg text-xs"
                        type="number"
                        min={0}
                        max={i.saldoQuantidade}
                        step={1}
                        placeholder="0"
                        value={cQtds[i.id] ?? ""}
                        onChange={(e) => setCQtds((q) => ({ ...q, [i.id]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Observação</label>
                <input className={inputCls} value={cObs} onChange={(e) => setCObs(e.target.value)} />
              </div>
              <button disabled={saving} className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl">
                {saving ? "Salvando..." : "Lançar e abater da ata"}
              </button>
            </form>
          )}

          {/* Histórico */}
          <section className="bg-card border border-border rounded-[12px] overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-sm text-foreground font-display">Contratos desta ata</h3>
            </div>
            {contratos.length === 0 ? (
              <p className="p-6 text-xs text-muted-foreground font-text">Nenhum contrato registrado.</p>
            ) : (
              <div className="divide-y divide-border">
                {contratos.map((c) => (
                  <div key={c.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground font-text">
                          Contrato {c.numero}{c.municipio ? ` — ${c.municipio}` : ""}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-text">
                          {new Date(c.assinadoEm).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                          {c.observacao ? ` · ${c.observacao}` : ""}
                        </p>
                        <ul className="text-[11px] text-foreground font-text">
                          {c.itens.map((i) => (
                            <li key={i.id}>
                              {i.quantidade} {i.itemAta.unidade} × {i.itemAta.descricao} ({brl(Number(i.valorUnitario))})
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-foreground font-text">{brl(Number(c.valorContratado))}</p>
                        <p className="text-[10px] text-muted-foreground font-text">
                          empenhado {brl(c.valorEmpenhado)}
                        </p>
                        {podeEscrever && (
                          <button
                            onClick={() => remover(`/api/contratos/${c.id}`, "Excluir este contrato? Os itens voltam ao saldo da ata e os empenhos são removidos.")}
                            className="mt-1 text-[10px] text-rose-600 hover:underline"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                    {c.empenhos.length > 0 && (
                      <ul className="text-[11px] text-foreground font-text bg-muted/30 rounded-xl divide-y divide-border">
                        {c.empenhos.map((e) => (
                          <li key={e.id} className="flex items-center justify-between px-3 py-1.5">
                            <span>
                              {e.tipo === "nota_empenho" ? "Nota de empenho" : "Ordem de compra"} {e.numero}
                            </span>
                            <span className="flex items-center gap-3">
                              <b>{brl(Number(e.valor))}</b>
                              {podeEscrever && (
                                <button
                                  onClick={() => remover(`/api/empenhos/${e.id}`, "Excluir este empenho?")}
                                  className="text-muted-foreground hover:text-rose-600"
                                  aria-label="Excluir empenho"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {podeEscrever &&
                      (eContratoId === c.id ? (
                        <form onSubmit={lancarEmpenho} className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                          <select className={inputCls} value={eTipo} onChange={(e) => setETipo(e.target.value as typeof eTipo)}>
                            <option value="nota_empenho">Nota de empenho</option>
                            <option value="ordem_compra">Ordem de compra</option>
                          </select>
                          <input className={inputCls} placeholder="Número" value={eNumero} onChange={(e) => setENumero(e.target.value)} required />
                          <input className={inputCls} type="number" min={0.01} step="0.01" placeholder="Valor (R$)" value={eValor} onChange={(e) => setEValor(e.target.value)} required />
                          <div className="flex gap-2">
                            <button disabled={saving} className="flex-1 bg-primary text-primary-foreground font-semibold text-xs px-3 py-2 rounded-xl disabled:opacity-50">Salvar</button>
                            <button type="button" onClick={() => setEContratoId(null)} className="px-3 py-2 border border-border rounded-xl text-xs">Cancelar</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setEContratoId(c.id)} className="text-[11px] font-semibold text-primary hover:underline">
                          + Lançar empenho / ordem de compra
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
