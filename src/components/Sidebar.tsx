/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  LayoutDashboard, 
  MessageSquare, 
  Target, 
  Eye, 
  CheckSquare, 
  FileText, 
  History, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Palette,
  Instagram
} from "lucide-react";

export type SidebarTab = 
  | 'dashboard' 
  | 'chat' 
  | 'diagnostico' 
  | 'radar' 
  | 'plano' 
  | 'relatorios' 
  | 'artes'
  | 'instagram_audits'
  | 'historico' 
  | 'perfil' 
  | 'configuracoes'
  | 'admin';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
  isAdmin: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  userName, 
  userRole, 
  onLogout,
  isAdmin
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Meu Consultor IA®', icon: MessageSquare },
    { id: 'diagnostico', label: 'Diagnóstico CRESCER™', icon: Target },
    { id: 'radar', label: 'Radar da Concorrência™', icon: Eye },
    { id: 'plano', label: 'Plano de Ação', icon: CheckSquare },
    { id: 'relatorios', label: 'Relatórios Executivos', icon: FileText },
    { id: 'artes', label: 'Estúdio de Posts', icon: Palette },
    { id: 'instagram_audits', label: 'Auditoria Instagram', icon: Instagram },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'perfil', label: 'Perfil da Empresa', icon: User },
    ...(isAdmin ? [{ id: 'admin', label: 'Painel Admin', icon: Settings }] : []),
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ] as const;

  const handleTabClick = (tabId: SidebarTab) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Header bar */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight uppercase">Meu Consultor IA®</span>
        </div>
        <button
          id="btn-mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-20"
        />
      )}

      {/* Actual Sidebar Navigation Container */}
      <aside className={`fixed inset-y-0 left-0 lg:sticky top-0 z-30 lg:z-10 w-64 bg-slate-950 border-r border-slate-900 text-slate-300 flex flex-col justify-between h-screen transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Top Logo Panel */}
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-500/10 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
                Meu Consultor IA<span className="text-indigo-500">®</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-1 leading-none">
                SaaS PREMIUM GESTÃO
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable menu list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                id={`sidebar-item-${item.id}`}
                key={item.id}
                onClick={() => handleTabClick(item.id as SidebarTab)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 outline-none border ${
                  isSelected 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15 border-indigo-500/20" 
                    : "hover:bg-slate-900/40 hover:text-white text-slate-400 border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Corporate Client Profile summary */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 mb-4 bg-slate-900/40 border border-slate-900/60 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/25 shrink-0 text-xs">
              {userName ? userName.slice(0, 2).toUpperCase() : "IA"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none">{userName || "Empresário"}</p>
              <p className="text-[9px] text-indigo-400 font-semibold mt-1 leading-none">{userRole || "Premium Member"}</p>
            </div>
          </div>

          <button
            id="sidebar-btn-logout"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-950/20 bg-rose-950/10 hover:bg-rose-950/25 text-rose-400 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Sistema</span>
          </button>
        </div>

      </aside>
    </>
  );
};
