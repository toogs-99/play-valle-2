"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  HelpCircle
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeType?: "danger" | "warning" | "info";
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();

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
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Background decoration elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20 border-r border-slate-200 bg-slate-50">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <Link href="/alertas" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform duration-200">
              <TrendingUp size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs text-indigo-600 uppercase tracking-wider leading-none">
                Gestão de Atas
              </span>
            </div>
          </Link>
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
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs shrink-0">
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

      {/* Mobile Drawer (Sidebar on mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4 focus:outline-none z-50">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex h-12 items-center px-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
                  <TrendingUp size={18} />
                </div>
                <span className="font-extrabold text-xs text-indigo-600 uppercase tracking-wider">
                  Gestão de Atas
                </span>
              </div>
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
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 md:pl-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white/70 backdrop-blur-md border-b border-slate-200/80 justify-between items-center px-4 sm:px-6 md:px-8">
          {/* Left Side: Mobile Menu Button & Dynamic Path Title */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm text-slate-450 font-medium">Dashboard</h2>
            </div>
            <div className="hidden sm:block text-slate-300">/</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative w-64">
              <Search
                size={16}
                className="absolute left-3 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar ata, item, rep..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all"
              />
            </div>

            {/* Notifications Icon */}
            <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl border border-slate-200/50 transition-all">
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
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

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}
