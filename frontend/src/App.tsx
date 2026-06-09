import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Kanban } from './pages/Kanban';
import { Reservas } from './pages/Reservas';
import { SaldosAtas } from './pages/SaldosAtas';
import { Fornecedores } from './pages/Fornecedores';
import { PedidosAdesao } from './pages/PedidosAdesao';
import { DetalhesAta } from './pages/DetalhesAta';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Kanban />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/saldos-atas" element={<SaldosAtas />} />
        <Route path="/saldos-atas/:id" element={<DetalhesAta />} />
        <Route path="/pedidos-adesao" element={<PedidosAdesao />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
