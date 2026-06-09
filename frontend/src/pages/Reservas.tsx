import { useState, useMemo } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { mockReservasMural, type Reserva } from '../mocks/reservasData';
import { Clock, AlertCircle, CheckCircle2, Search, MapPin } from 'lucide-react';

export function Reservas() {
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica de cálculo de dias (30 dias)
  const getStatus = (dataReserva: string) => {
    const reserveDate = new Date(dataReserva);
    // Simulação: para testes, estamos usando o ano 2026. 
    // Para ver o efeito visual de 'expirado', vamos forçar a data atual para '2026-06-08'
    // Se fosse real, usaria: const now = new Date(); const diffDays = ...
    const mockedNow = new Date('2026-06-08'); 
    const diffDays = Math.ceil((mockedNow.getTime() - reserveDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      return { 
        status: 'expired',
        label: 'Disponível (Expirou)', 
        color: 'bg-red-50 border-red-200 shadow-sm', 
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-700',
        icon: <AlertCircle size={14} className="mr-1" />
      };
    }
    if (diffDays >= 25) {
      return { 
        status: 'warning',
        label: 'Vence em breve', 
        color: 'bg-yellow-50 border-yellow-300 shadow-md', 
        textColor: 'text-yellow-800',
        badgeColor: 'bg-yellow-200 text-yellow-800',
        icon: <Clock size={14} className="mr-1" /> 
      };
    }
    return { 
      status: 'active',
      label: 'Ativa', 
      color: 'bg-white border-gray-200 shadow-sm', 
      textColor: 'text-gray-800',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      icon: <CheckCircle2 size={14} className="mr-1" /> 
    };
  };

  const formatData = (dataStr: string) => {
    const [y, m, d] = dataStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Filtragem pela busca e agrupamento por representante
  const colunas = useMemo(() => {
    const filtered = mockReservasMural.filter(reserva => {
      const termo = searchTerm.toLowerCase();
      return reserva.municipio.toLowerCase().includes(termo) || 
             reserva.estado.toLowerCase().includes(termo) ||
             reserva.representante.toLowerCase().includes(termo);
    });

    const groups: Record<string, Reserva[]> = {};
    
    // Pegar todos os representantes únicos da lista original para manter as colunas mesmo vazias
    const todosRepresentantes = Array.from(new Set(mockReservasMural.map(r => r.representante)));
    
    todosRepresentantes.forEach(rep => {
      groups[rep] = [];
    });

    filtered.forEach(reserva => {
      if (groups[reserva.representante]) {
        groups[reserva.representante].push(reserva);
      }
    });

    return groups;
  }, [searchTerm]);

  return (
    <MainLayout title="Mural de Reservas de Municípios">
      
      {/* Barra de Pesquisa */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Pesquisar por município, estado ou representante..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <AlertCircle size={16} className="text-red-500" />
          <span>Municípios vermelhos já passaram dos 30 dias (Disponíveis)</span>
        </div>
      </div>

      {/* Board Kanban */}
      <div className="flex overflow-x-auto pb-6 space-x-6 min-h-[60vh] custom-scrollbar items-start">
        {Object.entries(colunas).map(([representante, reservas]) => (
          <div key={representante} className="flex-shrink-0 w-80 bg-gray-100/50 rounded-2xl p-4 border border-gray-200/60 flex flex-col max-h-full">
            
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wide">{representante}</h3>
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                {reservas.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {reservas.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                  Nenhuma reserva encontrada
                </div>
              ) : (
                reservas.map(reserva => {
                  const statusInfo = getStatus(reserva.dataReserva);
                  
                  return (
                    <div 
                      key={reserva.id} 
                      className={`p-4 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg ${statusInfo.color}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start space-x-2">
                          <MapPin size={16} className={`mt-0.5 ${statusInfo.textColor}`} />
                          <div>
                            <h4 className={`font-semibold text-[15px] leading-tight ${statusInfo.textColor}`}>
                              {reserva.municipio}
                            </h4>
                            <span className="text-xs font-medium text-gray-500">{reserva.estado}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          {formatData(reserva.dataReserva)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusInfo.badgeColor}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

    </MainLayout>
  );
}
