import { MainLayout } from '../layouts/MainLayout';
import { mockPedidosAdesao } from '../mocks/adesoesData';
import type { AdesaoStatus } from '../mocks/adesoesData';
import { CheckCircle2, Clock } from 'lucide-react';

export function PedidosAdesao() {
  const totalValorAdesao = mockPedidosAdesao.reduce((acc, pedido) => acc + pedido.valorAdesao, 0);
  const totalValorEmpenho = mockPedidosAdesao.reduce((acc, pedido) => acc + pedido.valorEmpenho, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const StatusBadge = ({ status }: { status: AdesaoStatus }) => {
    if (status === 'OK') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          OK
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <Clock className="w-3 h-3 mr-1" />
        Pendente
      </span>
    );
  };

  return (
    <MainLayout title="Pedidos de Adesão">
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Total Valor Adesão</span>
          <span className="text-3xl font-bold text-gray-900">{formatCurrency(totalValorAdesao)}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Total Valor Empenho</span>
          <span className="text-3xl font-bold text-blue-700">{formatCurrency(totalValorEmpenho)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 whitespace-nowrap">
              <tr>
                <th className="px-6 py-4 font-semibold">Data da solic.</th>
                <th className="px-6 py-4 font-semibold">Município</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-center">Ofício</th>
                <th className="px-6 py-4 font-semibold text-center">Anuência</th>
                <th className="px-6 py-4 font-semibold text-center">Contrato</th>
                <th className="px-6 py-4 font-semibold text-center">Empenho</th>
                <th className="px-6 py-4 font-semibold text-right">Valor Adesão</th>
                <th className="px-6 py-4 font-semibold text-right">Valor Empenho</th>
                <th className="px-6 py-4 font-semibold">Vendedor</th>
                <th className="px-6 py-4 font-semibold">Obs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockPedidosAdesao.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(pedido.dataSolicitacao)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{pedido.municipio}</td>
                  <td className="px-6 py-4 text-center">{pedido.estado}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={pedido.statusOficio} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={pedido.statusAnuencia} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={pedido.statusContrato} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={pedido.statusEmpenho} />
                  </td>
                  <td className="px-6 py-4 text-right font-medium whitespace-nowrap">
                    {formatCurrency(pedido.valorAdesao)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-blue-700 whitespace-nowrap">
                    {formatCurrency(pedido.valorEmpenho)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{pedido.vendedor}</td>
                  <td className="px-6 py-4 text-xs max-w-[200px] truncate" title={pedido.observacao}>
                    {pedido.observacao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
