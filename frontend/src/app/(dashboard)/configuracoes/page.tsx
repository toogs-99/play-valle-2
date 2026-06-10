"use client";

import React from "react";
import { Settings } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Configurações
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Gerencie as diretrizes gerais do LicitFlow, prazos padrão e usuários.
        </p>
      </div>

      <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center max-w-2xl mx-auto">
        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-100">
          <Settings size={22} />
        </div>
        <h3 className="font-bold text-sm text-slate-800">Definições do Sistema</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Gerencie configurações padrão para tempo máximo de reserva antes do vencimento do ofício, limites de cota e alertas de e-mail.
        </p>
      </div>
    </div>
  );
}
