import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { mockItensAta } from '../mocks/itensAtaData';
import { atas } from '../mocks/mockData';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export function DetalhesAta() {
  const { id } = useParams();
  const navigate = useNavigate();

  const ata = atas.find(a => a.id === id);
  const itens = mockItensAta.filter(i => i.ata_id === id);

  if (!ata) {
    return (
      <MainLayout title="Detalhes da Ata">
        <div className="p-8 text-center text-gray-500">Ata não encontrada.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Saldos por Item: ${ata.numero}`}>
      
      {/* Botão Voltar e Info */}
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/saldos-atas')}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Voltar para Todas as Atas
        </button>

        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center border border-blue-100 shadow-sm">
          <span>O Limite de Adesões (Caronas) está configurado como 200% da Quantidade Original.</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              {/* Header Principal */}
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-800">
                <th colSpan={5} className="px-4 py-3 border-r border-gray-200 text-center font-bold tracking-wider uppercase text-xs">
                  Geral Ata {ata.numero}
                </th>
                <th colSpan={2} className="px-4 py-3 border-r border-gray-200 bg-blue-50 text-blue-800 text-center font-bold tracking-wider uppercase text-xs">
                  Saldo Gerenciador
                </th>
                <th colSpan={2} className="px-4 py-3 bg-emerald-50 text-emerald-800 text-center font-bold tracking-wider uppercase text-xs">
                  Saldo Adesões (2x)
                </th>
              </tr>
              {/* Sub-Header */}
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold text-center w-16">Item</th>
                <th className="px-4 py-3 font-semibold text-center w-16">Lote</th>
                <th className="px-4 py-3 font-semibold text-right w-24">Qtde Org.</th>
                <th className="px-4 py-3 font-semibold w-80">Descrição</th>
                <th className="px-4 py-3 font-semibold border-r border-gray-200">Marca/Modelo</th>
                
                {/* Gerenciador */}
                <th className="px-4 py-3 font-semibold text-right bg-blue-50/50">Saída</th>
                <th className="px-4 py-3 font-semibold text-right border-r border-gray-200 bg-blue-50/50 text-blue-700">Saldo</th>
                
                {/* Adesões */}
                <th className="px-4 py-3 font-semibold text-right bg-emerald-50/50">Saída</th>
                <th className="px-4 py-3 font-semibold text-right bg-emerald-50/50 text-emerald-700">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Nenhum item cadastrado para esta ata.
                  </td>
                </tr>
              ) : (
                itens.map((item) => {
                  // Cálculos Gerenciador
                  const saldoGerenciador = item.quantidade_original - item.saida_gerenciador;
                  
                  // Cálculos Adesões (2x a original)
                  const quantidadeAdesoes = item.quantidade_original * 2;
                  const saldoAdesoes = quantidadeAdesoes - item.saida_adesoes;

                  // Alertas Visuais
                  const gerenciadorAcabando = saldoGerenciador <= (item.quantidade_original * 0.1);
                  const adesoesAcabando = saldoAdesoes <= (quantidadeAdesoes * 0.1);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center font-medium text-gray-900">{item.item_numero}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{item.lote}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.quantidade_original.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-800 truncate max-w-[300px]" title={item.descricao}>
                        {item.descricao}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 border-r border-gray-100 truncate max-w-[200px]" title={item.marca_modelo}>
                        {item.marca_modelo}
                      </td>
                      
                      {/* Colunas Gerenciador */}
                      <td className="px-4 py-3 text-right text-gray-500">
                        {item.saida_gerenciador.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold border-r border-gray-100 ${gerenciadorAcabando ? 'text-red-600 bg-red-50/30' : 'text-blue-700'}`}>
                        <div className="flex items-center justify-end space-x-1">
                          {gerenciadorAcabando && <AlertTriangle size={14} className="text-red-500" />}
                          <span>{saldoGerenciador.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Colunas Adesões */}
                      <td className="px-4 py-3 text-right text-gray-500">
                        {item.saida_adesoes.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${adesoesAcabando ? 'text-red-600 bg-red-50/30' : 'text-emerald-700'}`}>
                        <div className="flex items-center justify-end space-x-1">
                          {adesoesAcabando && <AlertTriangle size={14} className="text-red-500" />}
                          <span>{saldoAdesoes.toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
