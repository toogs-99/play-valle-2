import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, DollarSign, Users, ClipboardList } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive
        ? 'text-blue-700 bg-blue-50'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-700">LicitFlow</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de Licitações</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Esteira Kanban
          </NavLink>
          <NavLink to="/reservas" className={linkClass}>
            <FileText className="w-5 h-5 mr-3" />
            Reservas de Ata
          </NavLink>
          <NavLink to="/saldos-atas" className={linkClass}>
            <DollarSign className="w-5 h-5 mr-3" />
            Saldos de Atas
          </NavLink>
          <NavLink to="/pedidos-adesao" className={linkClass}>
            <ClipboardList className="w-5 h-5 mr-3" />
            Pedidos de Adesão
          </NavLink>
          <NavLink to="/fornecedores" className={linkClass}>
            <Users className="w-5 h-5 mr-3" />
            Fornecedores
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              PV
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Equipe Play Valle</p>
              <p className="text-xs text-gray-500">Comercial</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm z-10 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <div className="flex items-center space-x-4">
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
               Novo Processo
             </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
