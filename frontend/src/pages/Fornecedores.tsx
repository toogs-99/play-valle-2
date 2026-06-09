import { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { fornecedores, processos, atas } from '../mocks/mockData';
import { Building2, Phone, FileText } from 'lucide-react';

export function Fornecedores() {
  const [selectedId, setSelectedId] = useState<string>(fornecedores[0]?.id);

  const selectedFornecedor = fornecedores.find(f => f.id === selectedId);
  
  // Encontra as atas deste fornecedor
  const atasDoFornecedor = atas.filter(a => a.fornecedor_id === selectedId);
  const ataIds = atasDoFornecedor.map(a => a.id);
  
  // Filtra processos (pedidos) vinculados a essas atas
  const processosDoFornecedor = processos.filter(p => ataIds.includes(p.ata_id));

  return (
    <MainLayout title="Gestão de Fornecedores">
      <div className="flex h-full gap-6">
        {/* Painel Mestre: Lista de Fábricas */}
        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Fábricas Homologadas</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {fornecedores.map(fornecedor => (
              <button
                key={fornecedor.id}
                onClick={() => setSelectedId(fornecedor.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedId === fornecedor.id 
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' 
                    : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{fornecedor.nome_fabrica}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <Building2 size={12} className="mr-1" /> {fornecedor.cnpj}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Painel de Detalhes */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {selectedFornecedor ? (
            <>
              {/* Header do Fornecedor */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">{selectedFornecedor.nome_fabrica}</h2>
                <div className="flex space-x-6 mt-4 text-sm text-gray-600">
                  <div className="flex items-center"><Building2 size={16} className="mr-2 text-gray-400" /> {selectedFornecedor.cnpj}</div>
                  <div className="flex items-center"><UserIcon size={16} className="mr-2 text-gray-400" /> {selectedFornecedor.contato}</div>
                  <div className="flex items-center"><Phone size={16} className="mr-2 text-gray-400" /> {selectedFornecedor.telefone}</div>
                </div>
              </div>

              {/* Lista de Pedidos vinculados */}
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                  <FileText size={18} className="mr-2 text-blue-600" />
                  Processos e Pedidos Vinculados ({processosDoFornecedor.length})
                </h3>
                
                {processosDoFornecedor.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {processosDoFornecedor.map(proc => {
                      const ata = atasDoFornecedor.find(a => a.id === proc.ata_id);
                      return (
                        <div key={proc.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900 text-sm">{proc.municipio}</span>
                            <span className="text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Ata: {ata?.numero}</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-1">Status: <span className="font-medium text-gray-700">{proc.status}</span></div>
                          <div className="text-xs text-gray-500">Vendedor: {proc.vendedor}</div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    Nenhum pedido em andamento com esta fábrica.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Selecione um fornecedor ao lado.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Simple internal icon component since Lucide "User" was conflicting or not imported properly.
function UserIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
