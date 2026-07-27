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
  Instagram,
  Rocket,
  ChevronRight
} from "lucide-react";

export type SidebarTab =
  | "dashboard"
  | "chat"
  | "diagnostico"
  | "radar"
  | "plano"
  | "relatorios"
  | "artes"
  | "instagram_audits"
  | "historico"
  | "perfil"
  | "configuracoes"
  | "admin";

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
    { id: "dashboard", label: "Visão geral", description: "Veja prioridades e próximos passos", icon: LayoutDashboard },
    { id: "chat", label: "Conversar com a IA", description: "Tire dúvidas e crie estratégias", icon: MessageSquare },
    { id: "diagnostico", label: "Diagnóstico da empresa", description: "Descubra o que precisa melhorar", icon: Target },
    { id: "plano", label: "Meu plano de ação", description: "Organize e execute suas tarefas", icon: CheckSquare },
    { id: "artes", label: "Marketing Studio", description: "Crie posts, anúncios e campanhas", icon: Palette },
    { id: "instagram_audits", label: "Meu Instagram", description: "Analise seu perfil e conteúdo", icon: Instagram },
    { id: "radar", label: "Meus concorrentes", description: "Encontre oportunidades no mercado", icon: Eye },
    { id: "relatorios", label: "Meus relatórios", description: "Consulte análises já concluídas", icon: FileText },
    { id: "historico", label: "Minhas atividades", description: "Veja tudo o que já foi feito", icon: History },
    { id: "perfil", label: "Dados da minha empresa", description: "Atualize as informações do negócio", icon: User },
    ...(isAdmin ? [{ id: "admin", label: "Painel administrativo", description: "Gerencie usuários e a plataforma", icon: Settings }] : []),
    { id: "configuracoes", label: "Configurações", description: "Preferências e segurança", icon: Settings }
  ] as const;

  const handleTabClick = (tabId: SidebarTab) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <>
      <div className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-extrabold text-sm tracking-tight">Meu Consultor IA®</span>
            <span className="block mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">Sua central de crescimento</span>
          </div>
        </div>
        <button
          id="btn-mobile-menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl hover:bg-slate-900 text-slate-200 active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Abrir menu"
        >
          {isOpen ? <X className="w-6 h-6 text-indigo-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40" />
      )}

      <aside className={`fixed inset-y-0 left-0 lg:sticky top-0 z-50 lg:z-10 w-[286px] bg-slate-950 border-r border-slate-900 text-slate-300 flex flex-col h-screen transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-500/10 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">Meu Consultor IA<span className="text-indigo-500">®</span></h1>
              <p className="text-[9px] text-slate-500 font-bold tracking-[0.16em] uppercase mt-1.5 leading-none">Sua central de crescimento</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTabClick("dashboard")}
            className="mt-5 w-full group flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3.5 text-left text-white shadow-lg shadow-indigo-950/40 transition hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Rocket className="h-4 w-4" /></span>
              <span>
                <span className="block text-xs font-black">Comece por aqui</span>
                <span className="mt-1 block text-[9px] font-semibold text-indigo-100">Veja o próximo passo recomendado</span>
              </span>
            </span>
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">Ferramentas da plataforma</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                id={`sidebar-item-${item.id}`}
                key={item.id}
                onClick={() => handleTabClick(item.id as SidebarTab)}
                title={item.description}
                className={`group w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all border ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15 border-indigo-500/30"
                    : "hover:bg-slate-900/70 text-slate-400 border-transparent hover:border-slate-800"
                }`}
              >
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-white/15" : "bg-slate-900 group-hover:bg-slate-800"}`}>
                  <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-xs font-extrabold ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>{item.label}</span>
                  <span className={`mt-1 block text-[9px] leading-4 ${isSelected ? "text-indigo-100" : "text-slate-600 group-hover:text-slate-500"}`}>{item.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-900 bg-slate-950/70">
          <div className="flex items-center gap-3 p-3 mb-3 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 font-black flex items-center justify-center border border-indigo-500/25 shrink-0 text-xs">
              {userName ? userName.slice(0, 2).toUpperCase() : "IA"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate">{userName || "Empresário"}</p>
              <p className="text-[9px] text-indigo-400 font-semibold mt-1 truncate">{userRole || "Acesso Premium"}</p>
            </div>
          </div>

          <button
            id="sidebar-btn-logout"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-950/20 bg-rose-950/10 hover:bg-rose-950/25 text-rose-400 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da plataforma</span>
          </button>
        </div>
      </aside>
    </>
  );
};