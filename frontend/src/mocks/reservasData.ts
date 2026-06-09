export interface Reserva {
  id: string;
  representante: string;
  municipio: string;
  estado: string;
  dataReserva: string;
}

export const mockReservasMural: Reserva[] = [
  // JOSÉ
  { id: '1', representante: 'JOSÉ', municipio: 'Jacareí', estado: 'SP', dataReserva: '2026-01-01' },
  { id: '2', representante: 'JOSÉ', municipio: 'Limeira', estado: 'SP', dataReserva: '2026-02-25' },
  // MARIA
  { id: '3', representante: 'MARIA', municipio: 'Aracaju', estado: 'SE', dataReserva: '2026-02-02' },
  { id: '4', representante: 'MARIA', municipio: 'Natal', estado: 'RN', dataReserva: '2026-04-04' },
  { id: '5', representante: 'MARIA', municipio: 'Rio Branco', estado: 'AC', dataReserva: '2026-05-10' },
  // EMPRESA 1
  { id: '6', representante: 'EMPRESA 1', municipio: 'Blumenau', estado: 'SC', dataReserva: '2026-03-03' },
  { id: '7', representante: 'EMPRESA 1', municipio: 'Rio Branco', estado: 'AC', dataReserva: '2026-03-30' },
  // EMPRESA 2
  { id: '8', representante: 'EMPRESA 2', municipio: 'Manaus', estado: 'AM', dataReserva: '2026-05-20' }, // Dado extra para teste
];
