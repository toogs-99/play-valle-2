import { processos, type Processo, type ProcessoStatus } from '../mocks/mockData';
import { MainLayout } from '../layouts/MainLayout';
import { AlertCircle, Clock, CheckCircle2, User, Building } from 'lucide-react';
import { useMemo } from 'react';

const COLUMNS: ProcessoStatus[] = [
  'Reserva',
  'Aguardando Ofício',
  'Aguardando Anuência',
  'Lançamento Interno',
  'Aguardando Contrato',
  'Aguardando Empenho',
  'Empenhado'
];

export function Kanban() {
  const processesByStatus = useMemo(() => {
    const grouped = {} as Record<ProcessoStatus, Processo[]>;
    COLUMNS.forEach(status => grouped[status] = []);
    
    processos.forEach(p => {
      if (grouped[p.status]) {
        grouped[p.status].push(p);
      }
    });
    
    return grouped;
  }, []);

  return (
    <MainLayout title="Esteira Kanban">
      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn 
            key={status} 
            title={status} 
            items={processesByStatus[status]} 
          />
        ))}
      </div>
    </MainLayout>
  );
}

function KanbanColumn({ title, items }: { title: string, items: Processo[] }) {
  return (
    <div className="flex flex-col w-80 shrink-0 bg-gray-100 rounded-xl max-h-full">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="bg-white text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
          {items.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {items.map(item => (
          <KanbanCard key={item.id} processo={item} />
        ))}
        {items.length === 0 && (
          <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
            Nenhum processo nesta etapa
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ processo }: { processo: Processo }) {
  const isExpiredSoon = useMemo(() => {
    if (processo.status === 'Empenhado' || !processo.data_reserva) return false; 
    
    const reserveDate = new Date(processo.data_reserva);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reserveDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 25; 
  }, [processo]);

  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md cursor-pointer ${isExpiredSoon ? 'border-red-500' : 'border-blue-500'}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">
          {processo.municipio}
        </h4>
        {isExpiredSoon && (
          <div className="text-red-500 flex items-center shrink-0 ml-2" title="Prazo de reserva próximo do fim (30 dias)">
            <AlertCircle size={16} />
          </div>
        )}
      </div>
      
      <div className="space-y-2 mt-4">
        <div className="flex items-center text-xs text-gray-600">
          <User size={14} className="mr-2 text-gray-400" />
          {processo.vendedor}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Building size={14} className="mr-2 text-gray-400" />
          {processo.origem}
        </div>
        
        {processo.data_reserva && processo.status !== 'Empenhado' && (
          <div className={`flex items-center text-xs font-medium mt-2 ${isExpiredSoon ? 'text-red-600 bg-red-50 p-1.5 rounded-md' : 'text-gray-500'}`}>
            <Clock size={14} className="mr-2" />
            {isExpiredSoon ? 'Atenção: Prazo expirando' : 'Prazo de reserva ativo'}
          </div>
        )}

        {processo.status === 'Empenhado' && (
          <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 p-1.5 rounded-md mt-2">
            <CheckCircle2 size={14} className="mr-2" />
            Empenho {processo.empenho_tipo || 'Integral'}
          </div>
        )}
      </div>
    </div>
  );
}
