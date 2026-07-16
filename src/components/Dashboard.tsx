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
  CheckSquare,
  Copy,
  Check,
  X,
  Sliders,
  BarChart3
} from "lucide-react";
import { SidebarTab } from "./Sidebar";

interface DashboardProps {
  profile: UserProfile;
  onTabChange: (tab: SidebarTab) => void;
  onSaveProfile: (updatedFields: Partial<UserProfile>) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onTabChange, onSaveProfile }) => {
  const pillars: CrescerPillars = profile.pillars || {
    conhecimento: 0,
    relacionamento: 0,
    estrategia: 0,
    sistema: 0,
    comunicacao: 0,
    eficiencia: 0,
    resultados: 0
  };

  const [showInitialDiagModal, setShowInitialDiagModal] = React.useState(false);
  const [empresaInput, setEmpresaInput] = React.useState(profile.initialDiagAnswers?.empresa || profile.empresa || "");
  const [segmentoInput, setSegmentoInput] = React.useState(profile.initialDiagAnswers?.segmento || profile.segmento || "");
  const [mercadoInput, setMercadoInput] = React.useState(profile.initialDiagAnswers?.mercado || "Serviços locais");
  const [cidadeInput, setCidadeInput] = React.useState(profile.initialDiagAnswers?.cidade || profile.cidade || "");
  const [ufInput, setUfInput] = React.useState(profile.initialDiagAnswers?.uf || "RJ");
  const [publicoInput, setPublicoInput] = React.useState(profile.initialDiagAnswers?.publicoPredominante || "");
  const [objetivoInput, setObjetivoInput] = React.useState(profile.initialDiagAnswers?.principalObjetivo || "");
  const [gargaloInput, setGargaloInput] = React.useState(profile.initialDiagAnswers?.maiorGargalo || "");
  const [matDigital, setMatDigital] = React.useState(profile.initialDiagAnswers?.nivelMaturidadeDigital ?? 7);
  const [orgComercial, setOrgComercial] = React.useState(profile.initialDiagAnswers?.nivelOrganizacaoComercial ?? 6);
  const [prioridadeInput, setPrioridadeInput] = React.useState(profile.initialDiagAnswers?.prioridadeEstrategica || "Marketing e Conversão");

  const [savingDiag, setSavingDiag] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setEmpresaInput(profile.initialDiagAnswers?.empresa || profile.empresa || "");
      setSegmentoInput(profile.initialDiagAnswers?.segmento || profile.segmento || "");
      setMercadoInput(profile.initialDiagAnswers?.mercado || "Serviços locais");
      setCidadeInput(profile.initialDiagAnswers?.cidade?.split(" – ")[0] || profile.cidade || "");
      setUfInput(profile.initialDiagAnswers?.uf || profile.cidade?.split(" – ")[1] || "RJ");
      setPublicoInput(profile.initialDiagAnswers?.publicoPredominante || "");
      setObjetivoInput(profile.initialDiagAnswers?.principalObjetivo || profile.objetivos || "");
      setGargaloInput(profile.initialDiagAnswers?.maiorGargalo || "");
      setMatDigital(profile.initialDiagAnswers?.nivelMaturidadeDigital ?? 7);
      setOrgComercial(profile.initialDiagAnswers?.nivelOrganizacaoComercial ?? 6);
      setPrioridadeInput(profile.initialDiagAnswers?.prioridadeEstrategica || "Marketing e Conversão");
    }
  }, [profile]);

  const handleCopyReport = () => {
    if (profile.initialDiagReport) {
      navigator.clipboard.writeText(profile.initialDiagReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveInitialDiag = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDiag(true);
    
    const answers = {
      empresa: empresaInput,
      segmento: segmentoInput,
      mercado: mercadoInput,
      cidade: cidadeInput,
      uf: ufInput,
      publicoPredominante: publicoInput,
      principalObjetivo: objetivoInput,
      maiorGargalo: gargaloInput,
      nivelMaturidadeDigital: matDigital,
      nivelOrganizacaoComercial: orgComercial,
      prioridadeEstrategica: prioridadeInput
    };

    const reportText = `📋 PERFIL ESTRATÉGICO DA EMPRESA

Empresa: ${answers.empresa}

Segmento:
${answers.segmento}

Mercado:
${answers.mercado}

Cidade:
${answers.cidade} – ${answers.uf}

Público predominante:
${answers.publicoPredominante}

Principal objetivo:
${answers.principalObjetivo}

Maior gargalo:
${answers.maiorGargalo}

Nível de maturidade digital:
${answers.nivelMaturidadeDigital}/10

Nível de organização comercial:
${answers.nivelOrganizacaoComercial}/10

Prioridade estratégica:
${answers.prioridadeEstrategica}.

Próxima etapa recomendada:
Auditoria de Instagram + Diagnóstico CRESCER™ + Plano de Marketing.`;

    try {
      await onSaveProfile({
        empresa: answers.empresa,
        segmento: answers.segmento,
        cidade: `${answers.cidade} – ${answers.uf}`,
        objetivos: answers.principalObjetivo,
        hasCompletedInitialDiag: true,
        initialDiagAnswers: answers,
        initialDiagReport: reportText
      });
      setShowInitialDiagModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDiag(false);
    }
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
      
      {/* 📋 INICIAL DIAGNOSIS SECTION (BOTAO DE ACESSO INTUITIVO & PERFIL ESTRATÉGICO) */}
      {!profile.hasCompletedInitialDiag ? (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-900 border-2 border-indigo-500 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Passo 1: Comece por Aqui</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                Defina o seu Diagnóstico Inicial Inteligente 🚀
              </h2>
              <p className="text-xs md:text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
                Antes de iniciar as outras ferramentas, calibre o seu <strong>Meu Consultor IA®</strong>. 
                Gere o seu <strong>Perfil Estratégico Corporativo</strong> oficial para liberar recomendações personalizadas imediatamente.
              </p>
            </div>
            <button
              id="btn-trigger-initial-diag"
              onClick={() => setShowInitialDiagModal(true)}
              className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all uppercase tracking-wider shrink-0 cursor-pointer border border-indigo-400/20 active:scale-[0.98]"
            >
              <span>Realizar Diagnóstico Inicial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-slate-950 to-slate-950/80 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight">📋 PERFIL ESTRATÉGICO DA EMPRESA</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Visão Executiva de Diagnóstico Inteligente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-copy-strat-profile"
                onClick={handleCopyReport}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{copied ? "Copiado!" : "Copiar Perfil"}</span>
              </button>
              <button
                id="btn-update-strat-profile"
                onClick={() => setShowInitialDiagModal(true)}
                className="px-3 py-1.5 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-300 rounded-xl border border-slate-800/80 text-xs font-bold transition-all"
              >
                Atualizar Ficha
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-medium">
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Empresa</span>
              <span className="text-white font-extrabold text-sm">{profile.initialDiagAnswers?.empresa}</span>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1">
              <span className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-wider block">Segmento</span>
              <span className="text-indigo-400 font-extrabold text-sm">{profile.initialDiagAnswers?.segmento}</span>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Mercado</span>
              <span className="text-white font-extrabold text-sm">{profile.initialDiagAnswers?.mercado}</span>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Cidade / UF</span>
              <span className="text-white font-extrabold text-sm">{profile.initialDiagAnswers?.cidade} – {profile.initialDiagAnswers?.uf}</span>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Público Predominante</span>
              <span className="text-white font-extrabold text-sm">{profile.initialDiagAnswers?.publicoPredominante}</span>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Principal Objetivo</span>
              <span className="text-white font-extrabold text-sm">{profile.initialDiagAnswers?.principalObjetivo}</span>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1 md:col-span-2">
              <span className="text-[10px] text-rose-400/80 font-bold uppercase tracking-wider block">Maior Gargalo</span>
              <span className="text-rose-400 font-extrabold text-xs">{profile.initialDiagAnswers?.maiorGargalo}</span>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Maturidade Digital</span>
              <span className="text-indigo-400 font-black text-lg block">{profile.initialDiagAnswers?.nivelMaturidadeDigital}/10</span>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Organização Comercial</span>
              <span className="text-indigo-400 font-black text-lg block">{profile.initialDiagAnswers?.nivelOrganizacaoComercial}/10</span>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Prioridade Estratégica</span>
              <span className="text-indigo-400 font-extrabold text-sm">{profile.initialDiagAnswers?.prioridadeEstrategica}</span>
            </div>
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-1 flex flex-col justify-center">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Próxima Etapa</span>
              <span className="text-indigo-300 font-bold text-[11px] leading-tight">Auditoria de Instagram + Diagnóstico CRESCER™ + Plano de Marketing.</span>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 border border-slate-900/80 rounded-2xl space-y-1.5 relative">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Resumo Executivo Gerado Automaticamente (Copiável)</span>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-slate-900 scrollbar-thin">
              {profile.initialDiagReport}
            </pre>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-950/90 border border-slate-900/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Olá, {profile.displayName || "Empresário"} — MEU CONSULTOR IA®</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Empresas não crescem <span className="font-serif italic font-normal text-slate-400 block sm:inline">por acaso.</span>
            </h1>
            <h2 className="text-base md:text-lg font-semibold text-indigo-400 tracking-tight leading-relaxed">
              Crescem quando tomam decisões melhores.
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed max-w-xl">
              O <strong>Meu Consultor IA®</strong> é o seu conselheiro de negócios 24 horas. Realize diagnósticos táticos, audite seu Instagram e estruture roteiros de vendas sob o Método CRESCER™.
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

      {/* 📋 MODAL DE DIAGNÓSTICO INICIAL */}
      {showInitialDiagModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative my-8 scrollbar-thin">
            
            {/* Close Button */}
            <button
              id="btn-close-initial-diag-modal"
              onClick={() => setShowInitialDiagModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400">
                <Target className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Diagnóstico Inicial de Negócio</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Ficha Estratégica da Sua Empresa</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Responda com sinceridade estas 10 perguntas essenciais para calibrar o <strong>Meu Consultor IA®</strong> e gerar seu Perfil Estratégico Corporativo.
              </p>
              
              {/* Preset example button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="btn-fill-preset-autoescola"
                  onClick={() => {
                    setEmpresaInput("Autoescola Exemplo");
                    setSegmentoInput("Educação para formação de condutores");
                    setMercadoInput("Serviços locais");
                    setCidadeInput("Angra dos Reis");
                    setUfInput("RJ");
                    setPublicoInput("18 a 35 anos");
                    setObjetivoInput("Aumentar matrículas");
                    setGargaloInput("Baixa geração de leads pelo Instagram e poucas avaliações no Google.");
                    setMatDigital(7);
                    setOrgComercial(6);
                    setPrioridadeInput("Marketing e Conversão");
                  }}
                  className="px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/15 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider"
                >
                  ✨ Preencher com Exemplo Prático (Autoescola)
                </button>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Form */}
            <form id="initial-diag-form" onSubmit={handleSaveInitialDiag} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Empresa */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nome da Empresa</label>
                  <input
                    id="diag-empresa-input"
                    type="text"
                    required
                    value={empresaInput}
                    onChange={(e) => setEmpresaInput(e.target.value)}
                    placeholder="Ex: Autoescola Exemplo"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>

                {/* Segmento */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Segmento da Empresa</label>
                  <input
                    id="diag-segmento-input"
                    type="text"
                    required
                    value={segmentoInput}
                    onChange={(e) => setSegmentoInput(e.target.value)}
                    placeholder="Ex: Educação para formação de condutores"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>

                {/* Mercado */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mercado / Tipo de Atuação</label>
                  <select
                    id="diag-mercado-select"
                    value={mercadoInput}
                    onChange={(e) => setMercadoInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option value="Serviços locais">Serviços locais</option>
                    <option value="Nacional ou Online">Nacional ou Online</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Infoprodutos / Educação">Infoprodutos / Educação</option>
                    <option value="B2B / Corporativo">B2B / Corporativo</option>
                  </select>
                </div>

                {/* Cidade e UF */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cidade</label>
                    <input
                      id="diag-cidade-input"
                      type="text"
                      required
                      value={cidadeInput}
                      onChange={(e) => setCidadeInput(e.target.value)}
                      placeholder="Ex: Angra dos Reis"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">UF</label>
                    <input
                      id="diag-uf-input"
                      type="text"
                      required
                      maxLength={2}
                      value={ufInput}
                      onChange={(e) => setUfInput(e.target.value.toUpperCase())}
                      placeholder="Ex: RJ"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 text-center uppercase outline-none"
                    />
                  </div>
                </div>

                {/* Público Predominante */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Público Predominante</label>
                  <input
                    id="diag-publico-input"
                    type="text"
                    required
                    value={publicoInput}
                    onChange={(e) => setPublicoInput(e.target.value)}
                    placeholder="Ex: 18 a 35 anos"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>

                {/* Principal Objetivo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Principal Objetivo</label>
                  <input
                    id="diag-objetivo-input"
                    type="text"
                    required
                    value={objetivoInput}
                    onChange={(e) => setObjetivoInput(e.target.value)}
                    placeholder="Ex: Aumentar matrículas"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none"
                  />
                </div>

                {/* Maior Gargalo */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Maior Gargalo Atual</label>
                  <textarea
                    id="diag-gargalo-textarea"
                    required
                    rows={2}
                    value={gargaloInput}
                    onChange={(e) => setGargaloInput(e.target.value)}
                    placeholder="Ex: Baixa geração de leads pelo Instagram e poucas avaliações no Google."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none resize-none"
                  />
                </div>

                {/* Maturidade Digital (Slider) */}
                <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Maturidade Digital</span>
                    <span className="text-indigo-400 font-extrabold">{matDigital}/10</span>
                  </div>
                  <input
                    id="diag-maturidade-range"
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={matDigital}
                    onChange={(e) => setMatDigital(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                    <span>Iniciante</span>
                    <span>Avançado</span>
                  </div>
                </div>

                {/* Organização Comercial (Slider) */}
                <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Organização Comercial</span>
                    <span className="text-indigo-400 font-extrabold">{orgComercial}/10</span>
                  </div>
                  <input
                    id="diag-comercial-range"
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={orgComercial}
                    onChange={(e) => setOrgComercial(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                    <span>Sem processos</span>
                    <span>Total estruturado</span>
                  </div>
                </div>

                {/* Prioridade Estratégica */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Prioridade Estratégica Principal</label>
                  <select
                    id="diag-prioridade-select"
                    value={prioridadeInput}
                    onChange={(e) => setPrioridadeInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option value="Marketing e Conversão">Marketing e Conversão (Atração e Vendas)</option>
                    <option value="Eficiência e Processos">Eficiência e Processos (Operações Internas)</option>
                    <option value="Gestão Financeira e Caixa">Gestão Financeira e Caixa (Finanças)</option>
                    <option value="Retenção e Recompra">Retenção e Recompra (Fidelização e Indicação)</option>
                  </select>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  id="btn-cancel-initial-diag"
                  onClick={() => setShowInitialDiagModal(false)}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-initial-diag"
                  disabled={savingDiag}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/15 flex items-center gap-2"
                >
                  <span>{savingDiag ? "Gerando..." : "Gerar Resumo Executivo"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
