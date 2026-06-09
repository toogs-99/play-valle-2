export interface ItemAta {
  id: string;
  ata_id: string; // Relacionado com a Ata
  item_numero: number;
  lote: number;
  quantidade_original: number;
  descricao: string;
  marca_modelo: string;
  saida_gerenciador: number; // Uso do Órgão Gerenciador
  saida_adesoes: number; // Uso por Caronas
}

export const mockItensAta: ItemAta[] = [
  // Simulando Itens para a Ata "ATA-001/2026" (id: '1' no mock de atas)
  {
    id: 'i1', ata_id: '1', item_numero: 1, lote: 1,
    quantidade_original: 105, descricao: 'Playground I 2 Atividades', marca_modelo: 'Brink mobil / Dynamic',
    saida_gerenciador: 0, saida_adesoes: 0
  },
  {
    id: 'i6', ata_id: '1', item_numero: 6, lote: 1,
    quantidade_original: 105, descricao: 'Playground Modular Tipo Big Climber III', marca_modelo: 'Nabre / Big climber III',
    saida_gerenciador: 2, saida_adesoes: 1
  },
  {
    id: 'i12', ata_id: '1', item_numero: 12, lote: 1,
    quantidade_original: 150, descricao: 'Playground em Formato de Castelo', marca_modelo: 'Nabre / Play Castelo',
    saida_gerenciador: 0, saida_adesoes: 0
  },
  {
    id: 'i18', ata_id: '1', item_numero: 18, lote: 1,
    quantidade_original: 105, descricao: 'Parque Infantil III', marca_modelo: 'Playvalle / Parque Infantil III',
    saida_gerenciador: 2, saida_adesoes: 2
  },
  {
    id: 'i31', ata_id: '1', item_numero: 31, lote: 1,
    quantidade_original: 800, descricao: 'Gangorra Dog', marca_modelo: 'Nabre / Gangorra Dog',
    saida_gerenciador: 6, saida_adesoes: 5
  },
  {
    id: 'i56', ata_id: '1', item_numero: 56, lote: 1,
    quantidade_original: 5000, descricao: 'CAMA INFANTIL', marca_modelo: 'Brink mobil / Caminha empilhavel',
    saida_gerenciador: 30, saida_adesoes: 15
  }
];
