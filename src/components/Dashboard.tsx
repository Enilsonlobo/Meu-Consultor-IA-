/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { UserProfile, CrescerPillars } from "../types";
import { 
  Sparkles, 
  Target, 
  MessageSquare, 
  Eye, 
  FileText, 
  History, 
  User, 
  TrendingUp, 
  Clock, 
  Building2, 
  MapPin, 
  ArrowRight,
  Palette,
  CheckSquare
} from "lucide-react";
import { SidebarTab } from "./Sidebar";

interface DashboardProps {
  profile: UserProfile;
  onTabChange: (tab: SidebarTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onTabChange }) => {
  const pillars: CrescerPillars = profile.pillars || {
    conhecimento: 0,
    relacionamento: 0,
    estrategia: 0,
    sistema: 0,
    comunicacao: 0,
    eficiencia: 0,
    resultados: 0
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  const actions = [
    { 
      id: 'diagnostico', 
      title: 'Novo Diagnóstico', 
      desc: 'Faça a auditoria do Método CRESCER™ para identificar pontos fracos.', 
      icon: Target, 
      color: 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-600/15'
    },
    { 
      id: 'chat', 
      title: 'Meu Consultor IA®', 
      desc: 'Inicie uma conversa estratégica para receber ideias e soluções práticas.', 
      icon: MessageSquare, 
      color: 'bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/15'
    },
    { 
      id: 'radar', 
      title: 'Radar Concorrência™', 
      desc: 'Faça a análise comparativa de concorrentes na sua cidade e setor.', 
      icon: Eye, 
      color: 'bg-pink-600/10 text-pink-400 border-pink-500/20 hover:bg-pink-600/15'
    },
    { 
      id: 'relatorios', 
      title: 'Relatórios Executivos', 
      desc: 'Gere e consulte relatórios estratégicos com metas e planos de ação.', 
      icon: FileText, 
      color: 'bg-purple-600/10 text-purple-400 border-purple-500/20 hover:bg-purple-600/15'
    },
    { 
      id: 'artes', 
      title: 'Estúdio de Posts', 
      desc: 'Crie artes limpas, luxuosas e modernas para suas redes sociais com IA.', 
      icon: Palette, 
      color: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/15'
    },
    { 
      id: 'historico', 
      title: 'Meu Histórico', 
      desc: 'Veja diagnósticos e chats salvos anteriormente.', 
      icon: History, 
      color: 'bg-amber-600/10 text-amber-400 border-amber-500/20 hover:bg-amber-600/15'
    },
    { 
      id: 'perfil', 
      title: 'Perfil da Empresa', 
      desc: 'Atualize dados de faturamento, metas e número de funcionários.', 
      icon: User, 
      color: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/15'
    }
  ] as const;

  return (
    <div id="dashboard-tab-root" className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header Card */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Olá, {profile.displayName || "Empresário"} — MEU CONSULTOR IA®</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Empresas não crescem por acaso.
            </h1>
            <h2 className="text-lg md:text-xl font-bold text-indigo-400 tracking-tight">
              Crescem quando tomam decisões melhores.
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed max-w-2xl">
              O Meu Consultor IA® analisa sua empresa, identifica oportunidades e cria planos de ação estratégicos para acelerar seu crescimento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <strong>Empresa:</strong> {profile.empresa || "Não Informada"}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {profile.segmento || "Segmento"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {profile.cidade || "São Paulo"}
            </span>
          </div>
        </div>

        {/* Sync dates */}
        <div className="flex flex-col gap-2.5 shrink-0 border-l border-slate-900 md:pl-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Último Acesso: <strong>{profile.ultimoAcesso || "Hoje"}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Último Diagnóstico: <strong>{profile.ultimoDiagnostico || "Nunca realizado"}</strong></span>
          </div>
          <div className="mt-1">
            <span className="px-2.5 py-1 bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 rounded-full font-bold uppercase tracking-wider text-[9px]">
              Assinatura: {profile.plan || "Membro"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CRESCER SCORE CHART & PILLARS - 7 Cols */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white">Método CRESCER™</h2>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Evolução do Índice de Maturidade do Negócio</p>
            </div>
            
            <div className={`px-4 py-2 border rounded-2xl text-center shrink-0 ${getScoreColorClass(profile.scoreCrescer)}`}>
              <span className="block text-[10px] font-bold uppercase tracking-wider">SCORE</span>
              <span className="text-2xl font-black">{profile.scoreCrescer}%</span>
            </div>
          </div>

          <hr className="border-slate-900" />

          {/* Pillars List */}
          <div className="space-y-4">
            {[
              { key: 'conhecimento', label: 'Conhecimento', desc: 'Atendimento às necessidades e hábitos dos clientes', val: pillars.conhecimento },
              { key: 'relacionamento', label: 'Relacionamento', desc: 'Retenção e engajamento pós-venda em canais digitais', val: pillars.relacionamento },
              { key: 'estrategia', label: 'Estratégia', desc: 'Metas comerciais claras e planejamento financeiro', val: pillars.estrategia },
              { key: 'sistema', label: 'Sistema', desc: 'Controle de caixa, ferramentas de gestão e ERP', val: pillars.sistema },
              { key: 'comunicacao', label: 'Comunicação', desc: 'Presença no Google Business, Instagram e automação', val: pillars.comunicacao },
              { key: 'eficiencia', label: 'Eficiência', desc: 'Organização operacional e manuais de processos', val: pillars.eficiencia },
              { key: 'resultados', label: 'Resultados', desc: 'Análise de margem real de contribuição e lucratividade', val: pillars.resultados }
            ].map((p) => (
              <div key={p.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-300 capitalize">{p.label}</span>
                    <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">— {p.desc}</span>
                  </div>
                  <span className="font-extrabold text-slate-200">{p.val}%</span>
                </div>
                
                {/* Custom corporate slate progress bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
                    style={{ width: `${p.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {profile.scoreCrescer === 0 && (
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-center text-xs text-slate-400 space-y-3">
              <p>Você ainda não realizou sua primeira auditoria empresarial do Método CRESCER™.</p>
              <button
                id="btn-score-cta"
                onClick={() => onTabChange('diagnostico')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1"
              >
                <span>Iniciar Auditoria de Elite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* CONSULTATIVE RECENT MEMOS & PILLARS SUMMARY - 5 Cols */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-extrabold text-white">Status Estratégico</h2>
            </div>
            
            <hr className="border-slate-900" />

            <div className="p-4 bg-slate-900/60 border border-slate-900 rounded-2xl space-y-2.5">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Diagnóstico Atual</span>
              <p className="text-xs text-slate-300 font-semibold">
                {profile.scoreCrescer >= 80 
                  ? "Sua empresa possui processos de alto nível estruturados. O foco agora é escala e inovação contínua."
                  : profile.scoreCrescer >= 50 
                  ? "Seu negócio está na zona de organização. Existem gaps importantes em Finanças e Presença Digital ativa."
                  : profile.scoreCrescer > 0
                  ? "Nível Operacional Crítico. Suas margens ou processos correm risco imediato de gargalo."
                  : "Aguardando conclusão do primeiro Diagnóstico."
                }
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Especialidades do Consultor</h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-semibold">
                <span className="p-2.5 bg-slate-900 border border-slate-900 rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Marketing & Vendas
                </span>
                <span className="p-2.5 bg-slate-900 border border-slate-900 rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Finanças de Caixa
                </span>
                <span className="p-2.5 bg-slate-900 border border-slate-900 rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Google Business
                </span>
                <span className="p-2.5 bg-slate-900 border border-slate-900 rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> WhatsApp Business
                </span>
              </div>
            </div>
          </div>

          <button
            id="btn-dash-chat-cta"
            onClick={() => onTabChange('chat')}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/10 mt-6"
          >
            <span>Consultar IA Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Premium Active Package Section with R$ 49,90 and listed items */}
      <div className="bg-gradient-to-r from-indigo-950/40 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block">Sua Assinatura Premium Ativa</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Seu Investimento de Alto Impacto</h2>
            <p className="text-xs text-slate-500 font-semibold uppercase">Tudo o que está incluído no seu plano de consultoria para impulsionar seu crescimento</p>
          </div>
          <div className="text-left md:text-right shrink-0">
            <div className="flex items-baseline gap-1.5 md:justify-end">
              <span className="text-3xl font-black text-indigo-400">R$ 49,90</span>
              <span className="text-xs text-slate-400 font-bold">/mês</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Acesso Completo Ativo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: "Diagnóstico da empresa", desc: "Mapeamento completo dos gargalos e oportunidades reais" },
            { title: "Consultor de IA corporativo", desc: "Seu Diretor de Operações sênior disponível 24h por dia" },
            { title: "Método CRESCER™", desc: "Índice estruturado de maturidade em 7 pilares corporativos" },
            { title: "Marketing Estratégico", desc: "Ações de alto impacto para atrair mais clientes qualificados" },
            { title: "Vendas Estratégicas", desc: "Roteiros de vendas práticos e melhoria das taxas de conversão" },
            { title: "WhatsApp Business", desc: "Padrão de atendimento de alta conversão e follow-ups rápidos" },
            { title: "Google Business Profile", desc: "Domine as pesquisas locais e conquiste mais avaliações" },
            { title: "Radar da Concorrência", desc: "Análise ética do posicionamento e oportunidades contra concorrentes" },
            { title: "Estúdio de posts de luxo", desc: "Crie artes de altíssimo padrão visual e sofisticação com IA" },
            { title: "Planos de ação de 30 dias", desc: "Cronogramas de execução simples e práticos para crescer rápido" }
          ].map((item, index) => (
            <div key={index} className="p-4 bg-slate-900/40 border border-slate-900/60 rounded-2xl space-y-1 hover:border-indigo-500/25 transition-all">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">{item.title}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed pl-6">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Large Quick Action Cards Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-white">Ações Rápidas do Gestor</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                id={`btn-dash-act-${act.id}`}
                key={act.id}
                onClick={() => onTabChange(act.id as SidebarTab)}
                className="p-5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-2xl text-left flex gap-4 transition-all duration-200 group"
              >
                <div className={`p-3 rounded-xl shrink-0 border ${act.color} flex items-center justify-center h-12 w-12`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-sm group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    <span>{act.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all text-indigo-400" />
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{act.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
