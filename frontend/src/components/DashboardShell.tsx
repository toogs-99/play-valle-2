"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBrand } from "@/context/BrandContext";
import {
  Bell,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  Search,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  User,
  LogOut,
  HelpCircle,
  Camera,
  MessageSquare,
  Mail
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeType?: "danger" | "warning" | "info";
}

const BrandLogo = ({ brand }: { brand: 'esporte' | 'play' }) => {
  if (brand === 'esporte') {
    return (
      <img 
        src="/logo.png" 
        alt="Esporte Valle" 
        className="max-h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]" 
      />
    );
  }

  return (
    <img 
      src="/logo-play.png" 
      alt="Play Valle" 
      className="max-h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]" 
    />
  );
};

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { brand, setBrand } = useBrand();
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // Swipe gesture tracking state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      setSidebarOpen(false);
    }
  };

  const navigation: SidebarItem[] = [
    {
      name: "Painel Geral",
      href: "/dashboard",
      icon: TrendingUp,
    },
    {
      name: "Alertas",
      href: "/alertas",
      icon: Bell,
      badge: "4 Vencidos",
      badgeType: "danger",
    },
    {
      name: "Atas de Preço",
      href: "/atas",
      icon: FileText,
    },
    {
      name: "Representantes",
      href: "/representantes",
      icon: Users,
      badge: "Aguardando",
      badgeType: "warning",
    },
    {
      name: "Instagram",
      href: "/instagram",
      icon: Camera,
    },
    {
      name: "WhatsApp",
      href: "/whatsapp",
      icon: MessageSquare,
    },
    {
      name: "E-mails",
      href: "/emails",
      icon: Mail,
    },
    {
      name: "Configurações",
      href: "/configuracoes",
      icon: Settings,
    },
  ];

  const getPageTitle = () => {
    const activeItem = navigation.find((item) => pathname.startsWith(item.href));
    return activeItem ? activeItem.name : "Gestão de Atas";
  };

  const getBadgeClass = (type?: string) => {
    switch (type) {
      case "danger":
        return "bg-rose-50 text-rose-600 border border-rose-100 font-medium";
      case "warning":
        return "bg-amber-50 text-amber-600 border border-amber-100 font-medium";
      default:
        return "bg-blue-50 text-blue-600 border border-blue-100 font-medium";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex overflow-x-hidden relative">
      {/* Background decoration elements wrapper with overflow hidden to prevent horizontal scroll */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20 border-r border-slate-200 bg-slate-50">
        {/* Brand Header & Switcher */}
        <div className="h-16 border-b border-slate-100 flex items-center px-4 relative shrink-0">
          <button
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="flex items-center justify-center gap-2 w-full hover:bg-slate-100/50 p-2 rounded-xl transition-all group"
          >
            <BrandLogo brand={brand} />
            <span className="text-slate-400 group-hover:text-slate-655 transition-colors">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </span>
          </button>

          {brandDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setBrandDropdownOpen(false)} 
              />
              <div className="absolute top-14 left-4 right-4 bg-white rounded-xl shadow-lg border border-slate-150 p-1.5 z-30 animate-in fade-in duration-200">
                <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Selecione a Empresa
                </div>
                {[
                  {
                    id: "esporte" as const,
                    name: "Esporte Valle",
                    desc: "Materiais Esportivos",
                  },
                  {
                    id: "play" as const,
                    name: "Play Valle",
                    desc: "Playgrounds & Parques",
                  }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBrand(b.id);
                      setBrandDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                      brand === b.id 
                        ? "bg-slate-50 font-semibold text-slate-900" 
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className={`h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                      b.id === 'esporte' ? 'bg-[#1F2A5A]' : 'bg-[#0F6F5B]'
                    }`}>
                      {b.id === 'esporte' ? 'EV' : 'PV'}
                    </div>
                    <div className="flex-1 min-w-0 leading-tight">
                      <p className="text-xs font-bold truncate">{b.name}</p>
                      <p className="text-[9px] text-slate-450 truncate">{b.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between w-full p-2 rounded-md text-sm transition-colors group ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <item.icon
                      size={16}
                      className={`shrink-0 transition-colors ${
                        isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md leading-none flex items-center justify-center min-w-5 h-5 ${getBadgeClass(
                        item.badgeType
                      )}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Help Card & User Card */}
          <div className="mt-8 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border border-indigo-100/50">
              <h4 className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-indigo-600" />
                Suporte Gestão de Atas
              </h4>
              <p className="text-xxs text-indigo-750/70 mt-1 leading-normal">
                Dúvidas sobre os prazos de adesão? Consulte as regras ou fale com o administrador.
              </p>
            </div>

            {/* Profile footer inside sidebar */}
            <button className="flex items-center w-full gap-2 p-2 rounded-md hover:bg-slate-100 transition-colors text-left">
              <div className="h-8 w-8 rounded-lg bg-indigo-650 text-white font-semibold flex items-center justify-center text-xs shrink-0">
                VH
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                  Victor Hugo
                </p>
                <p className="text-xs text-slate-500 truncate leading-tight">
                  victor@licitflow.com.br
                </p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Sidebar on mobile) with transition and swipe gestures */}
      <div 
        className={`fixed inset-0 z-40 md:hidden flex transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4 focus:outline-none z-50 transition-transform duration-300 ease-in-out transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-slate-900/20 text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Drawer Header & Switcher */}
          <div className="h-14 border-b border-slate-100 flex items-center px-4 relative shrink-0">
            <button
              onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
              className="flex items-center justify-center gap-2 w-full hover:bg-slate-100/50 p-2 rounded-xl transition-all group"
            >
              <BrandLogo brand={brand} />
              <span className="text-slate-400 group-hover:text-slate-655 transition-colors">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </span>
            </button>

            {brandDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setBrandDropdownOpen(false)} 
                />
                <div className="absolute top-12 left-4 right-4 bg-white rounded-xl shadow-lg border border-slate-150 p-1.5 z-30 animate-in fade-in duration-200">
                  <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Selecione a Empresa
                  </div>
                  {[
                    {
                      id: "esporte" as const,
                      name: "Esporte Valle",
                      desc: "Materiais Esportivos",
                    },
                    {
                      id: "play" as const,
                      name: "Play Valle",
                      desc: "Playgrounds & Parques",
                    }
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setBrand(b.id);
                        setBrandDropdownOpen(false);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        brand === b.id 
                          ? "bg-slate-50 font-semibold text-slate-900" 
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                        b.id === 'esporte' ? 'bg-[#1F2A5A]' : 'bg-[#0F6F5B]'
                      }`}>
                        {b.id === 'esporte' ? 'EV' : 'PV'}
                      </div>
                      <div className="flex-1 min-w-0 leading-tight">
                        <p className="text-xs font-bold truncate">{b.name}</p>
                        <p className="text-[9px] text-slate-450 truncate">{b.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-5 flex-1 h-0 overflow-y-auto px-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between w-full py-3 px-4 rounded-xl text-sm transition-colors group ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-750 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <item.icon
                        size={18}
                        className={`shrink-0 transition-colors ${
                          isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md leading-none flex items-center justify-center min-w-5 h-5 ${getBadgeClass(
                          item.badgeType
                        )}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white/70 backdrop-blur-md border-b border-slate-200/80 justify-between items-center px-4 sm:px-6 md:px-8">
          
          {/* Mobile Search Overlay */}
          {mobileSearchOpen && (
            <div className="absolute inset-0 bg-white z-20 flex items-center px-4 gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Buscar no sistema..."
                autoFocus
                className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-sm text-slate-800 placeholder-slate-450"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-550 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Left Side: Mobile Menu Button & Dynamic Path Title */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-750 bg-white hover:bg-slate-50 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {/* Desktop breadcrumb */}
            <div className="hidden md:flex items-center gap-2">
              <h2 className="text-sm text-slate-450 font-medium">Dashboard</h2>
              <div className="text-slate-300">/</div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Centered Mobile Title */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center">
            <span className="font-bold text-sm text-slate-900 tracking-tight truncate max-w-[150px]">
              {getPageTitle()}
            </span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center relative w-64">
              <Search
                size={16}
                className="absolute left-3 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar ... "
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all"
              />
            </div>

            {/* Mobile Search Trigger */}
            <button 
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl border border-slate-200/50 transition-all"
            >
              <Search size={18} />
            </button>

            {/* Notifications Icon */}
            <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl border border-slate-200/50 transition-all">
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-[#E97826] ring-2 ring-white" />
              <Bell size={18} />
            </button>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition-all"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="h-8 w-8 rounded-lg bg-indigo-650 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  VH
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white p-1.5 shadow-lg shadow-slate-100 border border-slate-150 ring-1 ring-black/5 focus:outline-none z-30 animate-in fade-in duration-100">
                    <div className="px-3 py-2 border-b border-slate-50">
                      <p className="text-xs font-semibold text-slate-800">
                        Victor Hugo
                      </p>
                      <p className="text-[10px] text-slate-400">
                        victor@licitflow.com.br
                      </p>
                    </div>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-left mt-1"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User size={14} />
                      Meu Perfil
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors text-left"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <LogOut size={14} />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper - responsive bottom padding to clear the mobile nav bar */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 relative z-0">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-35 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,0px)] shadow-lg shadow-slate-100">
        {[
          { name: "Painel", href: "/dashboard", icon: TrendingUp },
          { name: "Alertas", href: "/alertas", icon: Bell, badge: "4" },
          { name: "Atas", href: "/atas", icon: FileText },
          { name: "Mais", href: "#", icon: Menu, action: () => setSidebarOpen(true) }
        ].map((item, idx) => {
          const isActive = item.action ? false : pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <button
              key={idx}
              onClick={item.action ? item.action : () => {}}
              className="flex-1 flex flex-col items-center justify-center h-full relative"
            >
              {item.action ? (
                <div className="flex flex-col items-center">
                  <Icon size={18} className="text-slate-500" />
                  <span className="text-[10px] font-semibold text-slate-500 mt-1">{item.name}</span>
                </div>
              ) : (
                <Link href={item.href} className="flex flex-col items-center w-full h-full justify-center">
                  <div className="relative">
                    <Icon 
                      size={18} 
                      className={isActive ? "text-[#1F2A5A]" : "text-slate-500"} 
                    />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold mt-1 ${isActive ? "text-[#1F2A5A]" : "text-slate-500"}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <span className="absolute top-0 w-8 h-0.5 bg-[#E97826] rounded-full" />
                  )}
                </Link>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
