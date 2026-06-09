import { MainLayout } from '../layouts/MainLayout';
import { atas, fornecedores } from '../mocks/mockData';
import { useNavigate } from 'react-router-dom';

export function SaldosAtas() {
  const navigate = useNavigate();

  return (
    <MainLayout title="Gestão de Saldos das Atas">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Ata (Número)</th>
              <th className="px-6 py-4 font-semibold">Fornecedor</th>
              <th className="px-6 py-4 font-semibold">Objeto</th>
              <th className="px-6 py-4 font-semibold text-right">Qtd Total</th>
              <th className="px-6 py-4 font-semibold text-right">Faturada</th>
              <th className="px-6 py-4 font-semibold text-right">Saldo</th>
              <th className="px-6 py-4 font-semibold w-48">Consumo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {atas.map((ata) => {
              const fornecedor = fornecedores.find(f => f.id === ata.fornecedor_id);
              const saldo = ata.quantidade_total - ata.quantidade_faturada;
              const percentual = Math.round((ata.quantidade_faturada / ata.quantidade_total) * 100);
              
              // Cores da barra de progresso baseadas no consumo
              let progressColor = 'bg-blue-500';
              if (percentual > 85) progressColor = 'bg-red-500';
              else if (percentual > 70) progressColor = 'bg-yellow-500';

              return (
                <tr 
                  key={ata.id} 
                  className="hover:bg-blue-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/saldos-atas/${ata.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{ata.numero}</td>
                  <td className="px-6 py-4 text-xs">{fornecedor?.nome_fabrica || 'Desconhecido'}</td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate" title={ata.objeto}>{ata.objeto}</td>
                  <td className="px-6 py-4 text-right font-medium">{ata.quantidade_total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{ata.quantidade_faturada.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{saldo.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${progressColor} transition-all duration-500`} 
                          style={{ width: `${percentual}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 w-8">{percentual}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
