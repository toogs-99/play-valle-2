export type AdesaoStatus = 'Pendente' | 'OK';

export interface PedidoAdesao {
  id: string;
  ata: string;
  dataSolicitacao: string;
  municipio: string;
  estado: string;
  statusOficio: AdesaoStatus;
  statusAnuencia: AdesaoStatus;
  statusContrato: AdesaoStatus;
  statusEmpenho: AdesaoStatus;
  valorAdesao: number;
  valorEmpenho: number;
  vendedor: string;
  observacao: string;
}

export const mockPedidosAdesao: PedidoAdesao[] = [
  {
    id: '1',
    ata: 'ATA XXXX',
    dataSolicitacao: '2026-01-01',
    municipio: 'Prefeitura 1',
    estado: 'XX',
    statusOficio: 'OK',
    statusAnuencia: 'OK',
    statusContrato: 'OK',
    statusEmpenho: 'OK',
    valorAdesao: 50000.00,
    valorEmpenho: 35000.00,
    vendedor: 'Representante X',
    observacao: 'Faturado parcialmente na NF XXX, aguardando demais empenhos'
  },
  {
    id: '2',
    ata: 'ATA XXXX',
    dataSolicitacao: '2026-02-02',
    municipio: 'Prefeitura 2',
    estado: 'XX',
    statusOficio: 'OK',
    statusAnuencia: 'OK',
    statusContrato: 'Pendente',
    statusEmpenho: 'Pendente',
    valorAdesao: 100000.00,
    valorEmpenho: 0,
    vendedor: 'Representante Y',
    observacao: 'Aguardando contrato'
  },
  {
    id: '3',
    ata: 'ATA XXXX',
    dataSolicitacao: '2026-03-03',
    municipio: 'Prefeitura 3',
    estado: 'XX',
    statusOficio: 'OK',
    statusAnuencia: 'OK',
    statusContrato: 'OK',
    statusEmpenho: 'Pendente',
    valorAdesao: 150000.00,
    valorEmpenho: 0,
    vendedor: 'Representante Z',
    observacao: 'Aguardando empenho'
  }
];
