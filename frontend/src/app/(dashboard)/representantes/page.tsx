"use client";

import React from "react";
import { Users, Plus } from "lucide-react";

export default function RepresentantesPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Representantes
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Gerencie os representantes cadastrados e suas respectivas regiões de vendas.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shrink-0 shadow-md shadow-indigo-100 transition-colors self-start sm:self-auto">
          <Plus size={16} />
          Novo Representante
        </button>
      </div>

      {/* Empty State / Base Layout */}
      <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center max-w-2xl mx-auto">
        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-100">
          <Users size={22} />
        </div>
        <h3 className="font-bold text-sm text-slate-800">Nenhum Representante</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Adicione representantes de vendas e associe-os a regiões para gerenciar suas cotas de atas.
        </p>
        <button className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors">
          Cadastrar Representante
        </button>
      </div>
    </div>
  );
}
