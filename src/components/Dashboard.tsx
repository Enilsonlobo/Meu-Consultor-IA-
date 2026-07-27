import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Image as ImageIcon,
  Instagram,
  ListChecks,
  MapPin,
  MessageSquare,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
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

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: string;
  tab: SidebarTab;
  icon: React.ElementType;
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

function formatRelativeDate(value?: string | null) {
  if (!value) return "Data não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  const today = new Date();
  const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);
  if (diff <= 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff < 7) return `Há ${diff} dias`;
  return formatDate(value);
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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
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
        const chatItems = chats as Array<{ id?: string; createdAt?: string; updatedAt?: string }>;
        const completedTasks = taskItems.filter((item) => item.status === "done").length;
        const latestAudit = [...auditItems].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        const activityItems: ActivityItem[] = [
          ...diagnosticItems.map((item, index) => ({
            id: `diagnostic-${index}`,
            title: "Diagnóstico realizado",
            description: "Uma nova análise empresarial foi registrada.",
            date: item.updatedAt || item.createdAt,
            tab: "relatorios" as SidebarTab,
            icon: Target,
          })),
          ...auditItems.map((item, index) => ({
            id: `audit-${index}`,
            title: "Instagram analisado",
            description: "Uma auditoria do perfil foi concluída.",
            date: item.createdAt,
            tab: "instagram_audits" as SidebarTab,
            icon: Instagram,
          })),
          ...taskItems.map((item, index) => ({
            id: `task-${index}`,
            title: item.status === "done" ? "Tarefa concluída" : "Plano de ação atualizado",
            description: item.status === "done" ? "Mais uma ação estratégica foi finalizada." : "Uma atividade foi adicionada ou atualizada.",
            date: item.updatedAt || item.createdAt,
            tab: "plano" as SidebarTab,
            icon: CheckCircle2,
          })),
          ...chatItems.map((item, index) => ({
            id: `chat-${item.id || index}`,
            title: "Consultoria com a IA",
            description: "Uma nova conversa estratégica foi iniciada.",
            date: item.updatedAt || item.createdAt || "",
            tab: "chat" as SidebarTab,
            icon: MessageSquare,
          })),
        ]
          .filter((item) => Boolean(item.date))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        const latestActivity = activityItems[0]?.date || null;

        if (active) {
          setStats({
            diagnostics: diagnosticItems.length,
            audits: auditItems.length,
            chats: chatItems.length,
            tasks: taskItems.length,
            completedTasks,
            taskProgress: taskItems.length ? Math.round((completedTasks / taskItems.length) * 100) : 0,
            lastAuditScore: latestAudit ? Number(latestAudit.scoreGeral || 0) : null,
            lastActivity: latestActivity,
          });
          setActivities(activityItems);
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
  const hasDiagnostic = score > 0 || stats.diagnostics > 0;
  const hasCompany = Boolean(profile.empresa && profile.cidade);
  const hasPlan = stats.tasks > 0;
  const hasConsultation = stats.chats > 0;
  const hasAudit = stats.audits > 0;
  const hasProfile = Boolean(profile.displayName || profile.email);

  const displayName =
    profile.email?.toLowerCase() === "enilsonlobo32@gmail.com" ||
    profile.displayName?.toLowerCase().includes("enilson")
      ? "Mestre"
      : profile.displayName || "Empresário";

  const journey = [
    { title: "Perfil criado", description: "Sua conta está pronta para uso.", done: hasProfile, tab: "perfil" as SidebarTab },
    { title: "Empresa cadastrada", description: "Informe empresa e localização.", done: hasCompany, tab: "perfil" as SidebarTab },
    { title: "Diagnóstico concluído", description: "Descubra gargalos e prioridades.", done: hasDiagnostic, tab: "diagnostico" as SidebarTab },
    { title: "Plano estratégico criado", description: "Transforme prioridades em tarefas.", done: hasPlan, tab: "plano" as SidebarTab },
    { title: "Primeira consultoria realizada", description: "Use a IA para tomar uma decisão.", done: hasConsultation, tab: "chat" as SidebarTab },
    { title: "Instagram analisado", description: "Encontre oportunidades de posicionamento.", done: hasAudit, tab: "instagram_audits" as SidebarTab },
  ];

  const completedJourney = journey.filter((item) => item.done).length;
  const journeyProgress = Math.round((completedJourney / journey.length) * 100);
  const nextStep = journey.find((item) => !item.done) || {
    title: "Acompanhar e melhorar resultados",
    description: "Revise seus relatórios e continue executando o plano.",
    done: false,
    tab: "relatorios" as SidebarTab,
  };

  const priorityCopy: Record<string, { eyebrow: string; benefit: string; button: string }> = {
    "Empresa cadastrada": {
      eyebrow: "Complete sua base",
      benefit: "Com os dados corretos, a IA consegue personalizar análises, campanhas e recomendações.",
      button: "Cadastrar minha empresa",
    },
    "Diagnóstico concluído": {
      eyebrow: "Descubra o ponto de partida",
      benefit: "O diagnóstico mostra os principais gargalos e evita que você perca tempo com ações sem prioridade.",
      button: "Fazer diagnóstico agora",
    },
    "Plano estratégico criado": {
      eyebrow: "Transforme análise em execução",
      benefit: "Crie tarefas claras para os próximos 30 dias e acompanhe o avanço do negócio.",
      button: "Criar meu plano de ação",
    },
    "Primeira consultoria realizada": {
      eyebrow: "Tome uma decisão com clareza",
      benefit: "Converse com a IA sobre vendas, marketing, gestão ou qualquer desafio atual da empresa.",
      button: "Conversar com a IA",
    },
    "Instagram analisado": {
      eyebrow: "Fortaleça sua presença digital",
      benefit: "Identifique o que está impedindo seu perfil de atrair seguidores e gerar clientes.",
      button: "Analisar meu Instagram",
    },
    "Acompanhar e melhorar resultados": {
      eyebrow: "Continue evoluindo",
      benefit: "Acompanhe relatórios, atualize seu plano e use a plataforma de forma contínua.",
      button: "Ver meus resultados",
    },
  };

  const priority = priorityCopy[nextStep.title] || {
    eyebrow: "Próxima etapa",
    benefit: nextStep.description,
    button: "Continuar jornada",
  };

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
    { tab: "chat", title: "Conversar com a IA", description: "Receba orientação prática para uma decisão do seu negócio.", icon: MessageSquare, badge: "Consultoria" },
    { tab: "diagnostico", title: "Diagnóstico da empresa", description: "Descubra gargalos, prioridades e o próximo passo mais importante.", icon: Target, badge: "Estratégia" },
    { tab: "artes", title: "Criar conteúdo profissional", description: "Transforme uma ideia em uma peça pronta para divulgação.", icon: ImageIcon, badge: "Marketing" },
    { tab: "instagram_audits", title: "Analisar meu Instagram", description: "Avalie posicionamento, conteúdo e oportunidades de conversão.", icon: Instagram, badge: "Presença digital" },
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
              <Sparkles className="h-3.5 w-3.5" /> Seu consultor de crescimento
            </div>
            <h1 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white">
              Olá, {displayName}.
              <span className="block mt-2 text-slate-400">Vamos avançar para o próximo nível.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
              A plataforma identifica sua próxima prioridade e organiza uma jornada simples para você sair da análise e chegar à execução.
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
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Jornada concluída</p>
                <p className="mt-2 text-4xl font-black text-white">{loadingStats ? "…" : `${journeyProgress}%`}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10"><Rocket className="h-7 w-7 text-indigo-400" /></div>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `${journeyProgress}%` }} />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">{completedJourney} de {journey.length} etapas concluídas.</p>
            <button type="button" onClick={() => onTabChange(nextStep.tab)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white transition hover:bg-indigo-500">
              Continuar minha jornada <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-slate-950 p-6 md:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10"><TrendingUp className="h-6 w-6 text-emerald-400" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Sua prioridade hoje</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{priority.eyebrow}</p>
              </div>
            </div>
            <h2 className="mt-6 text-2xl md:text-3xl font-black text-white">{nextStep.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{priority.benefit}</p>
            <button type="button" onClick={() => onTabChange(nextStep.tab)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black text-slate-950 transition hover:bg-emerald-400">
              {priority.button} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Seu progresso</p>
              <h2 className="mt-2 text-lg font-black text-white">Jornada de crescimento</h2>
            </div>
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-black text-slate-300">{completedJourney}/{journey.length}</span>
          </div>
          <div className="mt-5 space-y-2">
            {journey.map((item) => (
              <button key={item.title} type="button" onClick={() => onTabChange(item.tab)} className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition hover:border-slate-800 hover:bg-slate-900/70">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.done ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-900 text-slate-600"}`}>
                  {item.done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-xs font-black ${item.done ? "text-slate-300" : "text-white"}`}>{item.title}</span>
                  <span className="mt-1 block text-[10px] text-slate-600">{item.description}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-700 transition group-hover:translate-x-1 group-hover:text-indigo-400" />
              </button>
            ))}
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

      <section className="grid xl:grid-cols-[1fr_0.72fr] gap-6">
        <div>
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Ferramentas recomendadas</p>
            <h2 className="mt-2 text-xl font-black text-white">Escolha uma ação rápida</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
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
        </div>

        <div>
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Movimentação recente</p>
            <h2 className="mt-2 text-xl font-black text-white">Últimas atividades</h2>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            {activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <button key={activity.id} type="button" onClick={() => onTabChange(activity.tab)} className="group flex w-full items-start gap-3 rounded-2xl border border-transparent p-3 text-left transition hover:border-slate-800 hover:bg-slate-900">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400"><Icon className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-xs font-black text-slate-200">{activity.title}</span>
                          <span className="shrink-0 text-[9px] font-bold text-slate-600">{formatRelativeDate(activity.date)}</span>
                        </span>
                        <span className="mt-1 block text-[10px] leading-relaxed text-slate-600">{activity.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Clock3 className="mx-auto h-8 w-8 text-slate-700" />
                <p className="mt-3 text-xs font-black text-slate-400">Suas atividades aparecerão aqui.</p>
                <p className="mt-2 text-[10px] text-slate-600">Comece pelo diagnóstico ou converse com a IA.</p>
              </div>
            )}
            <button type="button" onClick={() => onTabChange("historico")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-black text-slate-300 transition hover:border-indigo-500 hover:text-white">
              Ver todas as atividades <ArrowRight className="h-4 w-4" />
            </button>
          </div>
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
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10"><BarChart3 className="h-5 w-5 text-amber-400" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Maturidade empresarial</p><h2 className="mt-1 text-base font-black text-white">{hasDiagnostic ? `${score}% de maturidade` : "Ainda não avaliada"}</h2></div></div>
            <div className="mt-5 space-y-3">
              {hasDiagnostic ? weakestPillars.map((pillar, index) => <div key={pillar.key} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3.5"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-black text-amber-400">{index + 1}</span><div className="flex-1"><p className="text-xs font-bold text-slate-200">{pillar.label}</p><p className="mt-1 text-[10px] text-slate-500">Pontuação atual: {Number(pillars[pillar.key] || 0)}/10</p></div></div>) : <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-5 text-center"><Target className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-xs font-bold text-slate-400">As prioridades aparecerão após o diagnóstico.</p></div>}
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-500/15 bg-indigo-500/5 p-6">
            <div className="flex items-start gap-3"><UserRound className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" /><div><h3 className="text-sm font-black text-white">Orientação personalizada</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">A sua prioridade muda automaticamente conforme você conclui cada etapa da jornada.</p><button type="button" onClick={() => onTabChange("chat")} className="mt-4 inline-flex items-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-300">Pedir ajuda à IA <ArrowRight className="h-3.5 w-3.5" /></button></div></div>
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