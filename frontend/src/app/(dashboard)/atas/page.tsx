"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAtas } from "@/hooks/useAtas";
import FolderCard from "@/components/FolderCard";
import { Plus, Search, X, AlertCircle } from "lucide-react";

export default function AtasPage() {
  const router = useRouter();
  const { atas, loading, addAta } = useAtas();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [number, setNumber] = useState("");
  const [organ, setOrgan] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleCreateAta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim()) {
      setError("O Número da Ata é obrigatório.");
      return;
    }
    
    // Add the Ata
    const newAta = addAta(number, organ, description);
    
    // Reset form and close modal
    setNumber("");
    setOrgan("");
    setDescription("");
    setError("");
    setIsModalOpen(false);

    // Dynamic redirect to the newly created Ata details page
    router.push(`/atas/${newAta.id}`);
  };

  const filteredAtas = atas.filter(
    (ata) =>
      ata.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ata.organ.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ata.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Atas de Registro de Preços
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Selecione uma pasta para ver detalhes, representantes, modelos e ofícios.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shrink-0 shadow-md shadow-indigo-150 transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          Nova Ata
        </button>
      </div>

      {/* Search and counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 border border-slate-205/60 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Filtrar por número, órgão ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="text-xxs font-medium text-slate-500">
          Mostrando {filteredAtas.length} de {atas.length} atas cadastradas
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650" />
        </div>
      ) : filteredAtas.length === 0 ? (
        <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center max-w-2xl mx-auto">
          <h3 className="font-bold text-sm text-slate-800">Nenhuma Ata Encontrada</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm ? "Nenhuma ata corresponde ao filtro de pesquisa atual." : "Cadastre sua primeira Ata de Registro de Preços para começar."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Cadastrar Ata
            </button>
          )}
        </div>
      ) : (
        /* Folder Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAtas.map((ata) => (
            <FolderCard
              key={ata.id}
              number={ata.number}
              organ={ata.organ}
              onClick={() => router.push(`/atas/${ata.id}`)}
            />
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl p-6 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">
                Cadastrar Nova Ata
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAta} className="mt-4 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xxs flex items-center gap-1.5 border border-rose-100">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Número da Ata *
                </label>
                <input
                  type="text"
                  placeholder="Ex: GREAL ATA 003/2026"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>



              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Descrição do Objeto
                </label>
                <textarea
                  placeholder="Breve descrição dos itens cobertos pela Ata..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Criar Pastas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
