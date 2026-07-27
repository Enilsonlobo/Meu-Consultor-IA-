import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Image as ImageIcon,
  Instagram,
  ListChecks,
  MapPin,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { db } from "../firebase";
import type {
  ActionPlanTask,
  CrescerPillars,
  DiagnosticSession,
  InstagramAuditSession,
  UserProfile,
} from "../types";
import type { SidebarTab } from "./Sidebar";

interface DashboardProps {
  profile: UserProfile;
  onTabChange: (tab: SidebarTab) => void;
  onSaveProfile: (updatedFields: Partial<UserProfile>) => Promise<void>;
}

interface DashboardStats {
  diagnostics: number;
  audits: number;
  chats: number;
  tasks: number;
  completedTasks: number;
  taskProgress: number;
  lastAuditScore: number | null;
  lastActivity: string | null;
}

const pillarLabels: Array<{ key: keyof CrescerPillars; label: string }> = [
  { key: "conhecimento", label: "Conhecimento" },
  { key: "relacionamento", label: "Relacionamento" },
  { key: "estrategia", label: "Estratégia" },
  { key: "sistema", label: "Sistema Comercial" },
  { key: "comunicacao", label: "Comunicação" },
  { key: "eficiencia", label: "Eficiência" },
  { key: "resultados", label: "Resultados" },
];

function formatDate(value?: string | null) {
  if (!value) return "Sem atividade recente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onTabChange }) => {
  const [stats, setStats] = useState<DashboardStats>({
    diagnostics: 0,
    audits: 0,
    chats: 0,
    tasks: 0,
    completedTasks: 0,
    taskProgress: 0,
    lastAuditScore: null,
    lastActivity: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadStats() {
      try {
        const [diagnostics, audits, chats, actionTasks] = await Promise.all([
          db.getDocs("diagnostics", [{ field: "userId", val: profile.uid }]),
          db.getDocs("instagram_audits", [{ field: "userId", val: profile.uid }]),
          db.getDocs("chats", [{ field: "userId", val: profile.uid }]),
          db.getDocs("action_tasks", [{ field: "userId", val: profile.uid }]),
        ]);

        const diagnosticItems = diagnostics as DiagnosticSession[];
        const auditItems = audits as InstagramAuditSession[];
        const taskItems = actionTasks as ActionPlanTask[];
        const completedTasks = taskItems.filter((item) => item.status === "done").length;
        const latestAudit = [...auditItems].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        const activityDates = [
          ...diagnosticItems.map((item) => item.updatedAt || item.createdAt),
          ...auditItems.map((item) => item.createdAt),
          ...taskItems.map((item) => item.updatedAt || item.createdAt),
        ].filter(Boolean);
        const latestActivity = activityDates.sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        )[0] || null;

        if (active) {
          setStats({
            diagnostics: diagnosticItems.length,
            audits: auditItems.length,
            chats: chats.length,
            tasks: taskItems.length,
            completedTasks,
            taskProgress: taskItems.length ? Math.round((completedTasks / taskItems.length) * 100) : 0,
            lastAuditScore: latestAudit ? Number(latestAudit.scoreGeral || 0) : null,
            lastActivity: latestActivity,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar indicadores do dashboard:", error);
      } finally {
        if (active) setLoadingStats(false);
      }
    }
    void loadStats();
    return () => {
      active = false;
    };
  }, [profile.uid]);

  const pillars: CrescerPillars = profile.pillars || {
    conhecimento: 0,
    relacionamento: 0,
    estrategia: 0,
    sistema: 0,
    comunicacao: 0,
    eficiencia: 0,
    resultados: 0,
  };

  const score = Number(profile.scoreCrescer || 0);
  const hasDiagnostic = score > 0;
  const displayName =
    profile.email?.toLowerCase() === "enilsonlobo32@gmail.com" ||
    profile.displayName?.toLowerCase().includes("enilson")
      ? "Mestre"
      : profile.displayName || "Empresário";

  const weakestPillars = useMemo(
    () => [...pillarLabels].sort((a, b) => Number(pillars[a.key] || 0) - Number(pillars[b.key] || 0)).slice(0, 3),
    [pillars]
  );

  const quickActions: Array<{
    tab: SidebarTab;
    title: string;
    description: string;
    icon: React.ElementType;
    badge: string;
  }> = [
    { tab: "chat", title: "Consultar a IA", description: "Receba orientação prática para uma decisão do seu negócio.", icon: MessageSquare, badge: "Consultoria" },
    { tab: "diagnostico", title: "Diagnóstico CRESCER™", description: "Descubra gargalos, prioridades e o próximo passo mais importante.", icon: Target, badge: "Estratégia" },
    { tab: "artes", title: "Criar arte profissional", description: "Transforme uma ideia em uma peça pronta para divulgação.", icon: ImageIcon, badge: "Conteúdo" },
    { tab: "instagram_audits", title: "Auditar Instagram", description: "Analise posicionamento, conteúdo e oportunidades de conversão.", icon: Instagram, badge: "Marketing" },
  ];

  const executiveIndicators = [
    { label: "Diagnósticos", value: stats.diagnostics, icon: Target, tab: "relatorios" as SidebarTab, description: "avaliações empresariais" },
    { label: "Auditorias", value: stats.audits, icon: Instagram, tab: "instagram_audits" as SidebarTab, description: "análises de Instagram" },
    { label: "Tarefas", value: stats.tasks, icon: ListChecks, tab: "plano" as SidebarTab, description: `${stats.completedTasks} concluídas` },
    { label: "Execução", value: `${stats.taskProgress}%`, icon: TrendingUp, tab: "plano" as SidebarTab, description: "progresso do plano" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="relative z-10 grid xl:grid-cols-[1fr_330px] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> Painel executivo
            </div>
            <h1 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white">
              Olá, {displayName}.
              <span className="block mt-2 text-slate-400">Seu negócio em uma única visão.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              Acompanhe maturidade, diagnósticos, auditorias e prioridades para tomar decisões com mais clareza.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"><Building2 className="h-4 w-4 text-indigo-400" /> {profile.empresa || "Empresa não informada"}</span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"><MapPin className="h-4 w-4 text-indigo-400" /> {profile.cidade || "Localização não informada"}</span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"><Clock3 className="h-4 w-4 text-indigo-400" /> {formatDate(stats.lastActivity)}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Maturidade empresarial</p>
                <p className="mt-2 text-4xl font-black text-white">{hasDiagnostic ? `${score}%` : "—"}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10"><BarChart3 className="h-7 w-7 text-indigo-400" /></div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              {hasDiagnostic ? `Último diagnóstico: ${profile.ultimoDiagnostico || "concluído"}.` : "Realize o Diagnóstico CRESCER™ para liberar sua pontuação."}
            </p>
            <button type="button" onClick={() => onTabChange(hasDiagnostic ? "relatorios" : "diagnostico")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white transition hover:bg-indigo-500">
              {hasDiagnostic ? "Ver relatório executivo" : "Fazer diagnóstico agora"}<ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Resumo da plataforma</p>
          <h2 className="mt-2 text-xl font-black text-white">Indicadores executivos</h2>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {executiveIndicators.map((indicator) => {
            const Icon = indicator.icon;
            return (
              <button key={indicator.label} type="button" onClick={() => onTabChange(indicator.tab)} className="group rounded-3xl border border-slate-800 bg-slate-950 p-5 text-left transition hover:-translate-y-1 hover:border-indigo-500/40">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900"><Icon className="h-5 w-5 text-indigo-400" /></div>
                  <ArrowRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-indigo-400" />
                </div>
                <p className="mt-5 text-3xl font-black text-white">{loadingStats ? "…" : indicator.value}</p>
                <p className="mt-2 text-xs font-black text-slate-300">{indicator.label}</p>
                <p className="mt-1 text-[10px] text-slate-600">{indicator.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Acesso rápido</p>
          <h2 className="mt-2 text-xl font-black text-white">Comece por uma ação</h2>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.tab} type="button" onClick={() => onTabChange(action.tab)} className="group rounded-3xl border border-slate-800 bg-slate-950 p-5 text-left transition hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10"><Icon className="h-5 w-5 text-indigo-400" /></div>
                  <span className="rounded-full border border-slate-800 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">{action.badge}</span>
                </div>
                <h3 className="mt-5 text-sm font-black text-white">{action.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{action.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-indigo-400">Abrir ferramenta <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Método CRESCER™</p><h2 className="mt-2 text-lg font-black text-white">Visão dos pilares</h2></div>
            <button type="button" onClick={() => onTabChange("diagnostico")} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Atualizar diagnóstico</button>
          </div>
          <div className="mt-6 space-y-4">
            {pillarLabels.map(({ key, label }) => {
              const value = Number(pillars[key] || 0);
              return <div key={key}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-bold text-slate-300">{label}</span><span className="font-black text-slate-500">{hasDiagnostic ? `${value}/10` : "Não avaliado"}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-900"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${hasDiagnostic ? Math.min(100, value * 10) : 0}%` }} /></div></div>;
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10"><TrendingUp className="h-5 w-5 text-amber-400" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Prioridades</p><h2 className="mt-1 text-base font-black text-white">Onde agir primeiro</h2></div></div>
            <div className="mt-5 space-y-3">
              {hasDiagnostic ? weakestPillars.map((pillar, index) => <div key={pillar.key} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3.5"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-black text-amber-400">{index + 1}</span><div className="flex-1"><p className="text-xs font-bold text-slate-200">{pillar.label}</p><p className="mt-1 text-[10px] text-slate-500">Pontuação atual: {Number(pillars[pillar.key] || 0)}/10</p></div></div>) : <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-5 text-center"><Target className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-xs font-bold text-slate-400">As prioridades aparecerão após o diagnóstico.</p></div>}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/15 bg-emerald-500/5 p-6">
            <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /><div><h3 className="text-sm font-black text-white">Próximo passo recomendado</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">{hasDiagnostic ? "Transforme o principal gargalo em um plano de ação de 30 dias e acompanhe sua execução." : "Conclua o Diagnóstico CRESCER™ para criar a base das recomendações."}</p><button type="button" onClick={() => onTabChange(hasDiagnostic ? "plano" : "diagnostico")} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-emerald-400 hover:text-emerald-300">Executar próximo passo <ArrowRight className="h-3.5 w-3.5" /></button></div></div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10"><FileText className="h-6 w-6 text-indigo-400" /></div><div><h2 className="text-base font-black text-white">Toda a jornada organizada</h2><p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500">Centralize diagnósticos, conversas, relatórios, auditorias, tarefas e materiais para acompanhar a evolução do negócio.</p></div></div>
          <button type="button" onClick={() => onTabChange("historico")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-black text-slate-200 transition hover:border-indigo-500 hover:text-white">Ver histórico <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </div>
  );
};
