import React, { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { ActionPlanTask, CrescerPillars } from "../types";
import {
  buildActionPlanInsight,
  groupTasksByHorizon,
  sortTasksIntelligently,
} from "../services/actionPlanIntelligence";

interface ActionPlanExecutivePanelProps {
  tasks: ActionPlanTask[];
  pillars: CrescerPillars;
  onOpenTask?: (task: ActionPlanTask) => void;
}

const horizonDescription = {
  "30 dias": "Execução imediata e correção dos principais gargalos.",
  "60 dias": "Consolidação dos processos e ganho de consistência.",
  "90 dias": "Escala, otimização e crescimento sustentável.",
};

export const ActionPlanExecutivePanel: React.FC<ActionPlanExecutivePanelProps> = ({
  tasks,
  pillars,
  onOpenTask,
}) => {
  const insight = useMemo(
    () => buildActionPlanInsight(tasks, pillars),
    [tasks, pillars]
  );
  const orderedOpenTasks = useMemo(
    () => sortTasksIntelligently(tasks, pillars).filter((task) => task.status !== "done"),
    [tasks, pillars]
  );
  const horizons = useMemo(() => groupTasksByHorizon(tasks), [tasks]);
  const recommendedTask = orderedOpenTasks.find(
    (task) => task.id === insight.recommendedTaskId
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <Target className="h-5 w-5 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Execução
            </span>
          </div>
          <p className="mt-5 text-3xl font-black text-white">{insight.executionRate}%</p>
          <p className="mt-1 text-xs font-bold text-slate-400">do plano concluído</p>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Atrasos
            </span>
          </div>
          <p className="mt-5 text-3xl font-black text-white">{insight.overdueCount}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">tarefas vencidas</p>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <Clock3 className="h-5 w-5 text-sky-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Próximos 7 dias
            </span>
          </div>
          <p className="mt-5 text-3xl font-black text-white">{insight.dueSoonCount}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">entregas próximas</p>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Alta prioridade
            </span>
          </div>
          <p className="mt-5 text-3xl font-black text-white">
            {insight.highPriorityOpenCount}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-400">ações críticas abertas</p>
        </article>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">
              <Sparkles className="h-4 w-4" /> Recomendação da IA
            </div>
            <h2 className="mt-3 text-xl font-black text-white">
              {recommendedTask?.title || "Plano em dia"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {insight.recommendedReason}
            </p>
          </div>

          {recommendedTask && (
            <button
              type="button"
              onClick={() => onOpenTask?.(recommendedTask)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black text-white transition hover:bg-indigo-500"
            >
              Executar agora <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-black text-white">Roadmap executivo</h2>
            <p className="mt-1 text-xs text-slate-500">
              Visão das prioridades para os próximos 30, 60 e 90 dias.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {horizons.map((horizon, index) => (
            <article
              key={horizon.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-xs font-black text-indigo-300">
                  {index + 1}
                </div>
                <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-[10px] font-black text-slate-400">
                  {horizon.tasks.length} ações
                </span>
              </div>
              <h3 className="mt-4 text-sm font-black text-white">{horizon.label}</h3>
              <p className="mt-2 min-h-10 text-xs leading-relaxed text-slate-500">
                {horizonDescription[horizon.label]}
              </p>

              <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                {horizon.tasks.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="h-4 w-4" /> Nenhuma ação pendente
                  </div>
                ) : (
                  horizon.tasks.slice(0, 3).map((task) => (
                    <button
                      type="button"
                      key={task.id}
                      onClick={() => onOpenTask?.(task)}
                      className="flex w-full items-start gap-2 rounded-xl p-2 text-left transition hover:bg-slate-800/70"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      <span className="text-[11px] font-bold leading-relaxed text-slate-300">
                        {task.title}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
