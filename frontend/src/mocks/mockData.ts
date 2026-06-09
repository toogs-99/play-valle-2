export interface Fornecedor {
  id: string;
  nome_fabrica: string;
  cnpj: string;
  contato: string;
  telefone: string;
}

export interface Ata {
  id: string;
  numero: string;
  fornecedor_id: string;
  objeto: string;
  quantidade_total: number;
  quantidade_faturada: number;
}

export type ProcessoStatus = 
  | 'Reserva' 
  | 'Aguardando Ofício' 
  | 'Aguardando Anuência' 
  | 'Lançamento Interno'
  | 'Aguardando Contrato' 
  | 'Aguardando Empenho'
  | 'Empenhado';

export interface Processo {
  id: string;
  municipio: string;
  vendedor: string;
  origem: 'Venda Direta' | 'Representante Externo' | 'Vendedor Interno';
  status: ProcessoStatus;
  data_reserva?: string; // ISO format string
  empenho_tipo?: 'Integral' | 'Parcial'; 
  ata_id: string;
}

// Relative calculation for reliable prototyping
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const fornecedores: Fornecedor[] = [
  { id: 'f1', nome_fabrica: 'TechEdu Equipamentos', cnpj: '12.345.678/0001-90', contato: 'Marcos Silveira', telefone: '(11) 98765-4321' },
  { id: 'f2', nome_fabrica: 'Mobiliário Escolar S.A', cnpj: '98.765.432/0001-10', contato: 'Ana Lúcia', telefone: '(41) 99999-8888' },
  { id: 'f3', nome_fabrica: 'Innova Tech Solutions', cnpj: '45.678.901/0001-55', contato: 'Roberto Nunes', telefone: '(31) 97777-6666' }
];

export const atas: Ata[] = [
  { id: 'a1', numero: '001/2025', fornecedor_id: 'f1', objeto: 'Lousas Digitais Interativas', quantidade_total: 500, quantidade_faturada: 120 },
  { id: 'a2', numero: '045/2025', fornecedor_id: 'f2', objeto: 'Conjuntos Escolares (Mesa e Cadeira)', quantidade_total: 10000, quantidade_faturada: 9500 },
  { id: 'a3', numero: '112/2026', fornecedor_id: 'f3', objeto: 'Chromebooks Educacionais', quantidade_total: 2000, quantidade_faturada: 1800 },
  { id: 'a4', numero: '088/2026', fornecedor_id: 'f1', objeto: 'Projetores Multimídia', quantidade_total: 300, quantidade_faturada: 50 },
];

export const processos: Processo[] = [
  { id: 'p1', ata_id: 'a1', municipio: 'São Paulo - SP', vendedor: 'Carlos Almeida', origem: 'Representante Externo', status: 'Reserva', data_reserva: daysAgo(5) },
  { id: 'p2', ata_id: 'a2', municipio: 'Campinas - SP', vendedor: 'Mariana Silva', origem: 'Venda Direta', status: 'Aguardando Anuência' },
  { id: 'p3', ata_id: 'a3', municipio: 'Belo Horizonte - MG', vendedor: 'Roberto Costa', origem: 'Vendedor Interno', status: 'Lançamento Interno', data_reserva: daysAgo(15) },
  { id: 'p4', ata_id: 'a2', municipio: 'Curitiba - PR', vendedor: 'Fernanda Lima', origem: 'Venda Direta', status: 'Aguardando Contrato' },
  { id: 'p5', ata_id: 'a4', municipio: 'Ribeirão Preto - SP', vendedor: 'Carlos Almeida', origem: 'Representante Externo', status: 'Aguardando Ofício', data_reserva: daysAgo(29) },
  { id: 'p6', ata_id: 'a1', municipio: 'Porto Alegre - RS', vendedor: 'Mariana Silva', origem: 'Vendedor Interno', status: 'Empenhado', data_reserva: daysAgo(20), empenho_tipo: 'Parcial' },
  { id: 'p7', ata_id: 'a3', municipio: 'Florianópolis - SC', vendedor: 'Roberto Costa', origem: 'Representante Externo', status: 'Aguardando Empenho', data_reserva: daysAgo(10) },
  { id: 'p8', ata_id: 'a1', municipio: 'Goiânia - GO', vendedor: 'João Pedro', origem: 'Representante Externo', status: 'Reserva', data_reserva: daysAgo(26) }, // Quase expirando
  { id: 'p9', ata_id: 'a2', municipio: 'Manaus - AM', vendedor: 'Fernanda Lima', origem: 'Representante Externo', status: 'Reserva', data_reserva: daysAgo(32) } // Expirado
];
