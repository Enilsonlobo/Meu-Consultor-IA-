import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  ListChecks,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { auth, db } from "../firebase";
import type {
  ActionPlanTask,
  ActionTaskPriority,
  ActionTaskStatus,
  CrescerPillars,
} from "../types";

interface ActionPlanProps {
  pillars: CrescerPillars;
}

const statusColumns: Array<{
  id: ActionTaskStatus;
  label: string;
  description: string;
}> = [
  { id: "todo", label: "A fazer", description: "Próximas prioridades" },
  { id: "doing", label: "Em andamento", description: "Execução atual" },
  { id: "done", label: "Concluído", description: "Resultados entregues" },
];

const pillarLabels: Record<string, string> = {
  conhecimento: "Conhecimento",
  relacionamento: "Relacionamento",
  estrategia: "Estratégia",
  sistema: "Sistema Comercial",
  comunicacao: "Comunicação",
  eficiencia: "Eficiência",
  resultados: "Resultados",
  marketing: "Marketing",
  vendas: "Vendas",
  gestao: "Gestão",
};

const priorityLabels: Record<ActionTaskPriority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createSuggestedTasks(userId: string, pillars: CrescerPillars): Omit<ActionPlanTask, "id">[] {
  const ranking = Object.entries(pillars)
    .sort(([, a], [, b]) => Number(a) - Number(b))
    .slice(0, 3);

  const playbook: Record<string, { title: string; description: string; checklist: string[] }> = {
    conhecimento: {
      title: "Mapear os principais números do negócio",
      description: "Crie uma visão simples de faturamento, custos, margem e metas para reduzir decisões por intuição.",
      checklist: ["Levantar faturamento dos últimos 3 meses", "Listar custos fixos e variáveis", "Definir uma meta mensal"],
    },
    relacionamento: {
      title: "Criar uma rotina de relacionamento com clientes",
      description: "Estruture ações simples para recuperar clientes, pedir indicações e aumentar a recorrência.",
      checklist: ["Separar clientes ativos e inativos", "Criar mensagem de reativação", "Solicitar indicações e avaliações"],
    },
    estrategia: {
      title: "Definir a prioridade comercial dos próximos 30 dias",
      description: "Escolha uma meta central e elimine ações que não contribuam diretamente para ela.",
      checklist: ["Definir objetivo principal", "Escolher indicador de sucesso", "Revisar a meta semanalmente"],
    },
    sistema: {
      title: "Padronizar o processo comercial",
      description: "Organize o caminho do primeiro contato até o fechamento para evitar perda de oportunidades.",
      checklist: ["Mapear etapas do atendimento", "Criar script de resposta", "Definir rotina de follow-up"],
    },
    comunicacao: {
      title: "Melhorar a comunicação da oferta",
      description: "Torne sua proposta mais clara para que o cliente entenda rapidamente o valor e o próximo passo.",
      checklist: ["Revisar promessa principal", "Criar chamada para ação", "Atualizar bio e materiais de divulgação"],
    },
    eficiencia: {
      title: "Eliminar gargalos operacionais",
      description: "Identifique tarefas repetitivas e atrasos que consomem tempo sem gerar resultado.",
      checklist: ["Listar tarefas repetitivas", "Escolher uma automação", "Criar uma rotina de controle"],
    },
    resultados: {
      title: "Implantar acompanhamento semanal de resultados",
      description: "Acompanhe poucos indicadores, mas faça isso com consistência para corrigir a rota rapidamente.",
      checklist: ["Escolher 3 indicadores", "Criar registro semanal", "Definir ação corretiva para cada queda"],
    },
  };

  const now = new Date().toISOString();
  return ranking.map(([pillar], index) => {
    const item = playbook[pillar] || playbook.estrategia;
    return {
      userId,
      title: item.title,
      description: item.description,
      pillar: pillar as keyof CrescerPillars,
      status: "todo",
      priority: index === 0 ? "alta" : index === 1 ? "media" : "baixa",
      source: "diagnostico",
      dueDate: addDays((index + 1) * 7),
      checklist: item.checklist.map((text, checklistIndex) => ({
        id: `item-${Date.now()}-${index}-${checklistIndex}`,
        text,
        done: false,
      })),
      createdAt: now,
      updatedAt: now,
    };
  });
}

export const ActionPlanSection: React.FC<ActionPlanProps> = ({ pillars }) => {
  const [tasks, setTasks] = useState<ActionPlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "media" as ActionTaskPriority,
    dueDate: addDays(7),
  });

  const userId = auth.currentUser?.uid || "";

  useEffect(() => {
    let mounted = true;

    async function loadPlan() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setError("");
        const records = (await db.getDocs("action_tasks", [
          { field: "userId", val: userId },
        ])) as ActionPlanTask[];

        if (!mounted) return;

        if (records.length > 0) {
          setTasks(records);
          return;
        }

        const suggestions = createSuggestedTasks(userId, pillars);
        const created: ActionPlanTask[] = [];
        for (const suggestion of suggestions) {
          created.push((await db.addDoc("action_tasks", suggestion)) as ActionPlanTask);
        }
        if (mounted) setTasks(created);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Não foi possível carregar o plano de ação agora.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadPlan();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const completedCount = tasks.filter((task) => task.status === "done").length;
  const doingCount = tasks.filter((task) => task.status === "doing").length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const weakestPillar = useMemo(() => {
    const item = Object.entries(pillars).sort(([, a], [, b]) => Number(a) - Number(b))[0];
    return item ? pillarLabels[item[0]] : "Estratégia";
  }, [pillars]);

  async function updateTask(task: ActionPlanTask, changes: Partial<ActionPlanTask>) {
    const next = {
      ...changes,
      updatedAt: new Date().toISOString(),
      ...(changes.status === "done" ? { completedAt: new Date().toISOString() } : {}),
    };
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, ...next } : item)));
    try {
      await db.updateDoc("action_tasks", task.id, next);
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar uma alteração.");
    }
  }

  function moveTask(task: ActionPlanTask) {
    const nextStatus: Record<ActionTaskStatus, ActionTaskStatus> = {
      todo: "doing",
      doing: "done",
      done: "todo",
    };
    void updateTask(task, { status: nextStatus[task.status] });
  }

  async function toggleChecklist(task: ActionPlanTask, checklistId: string) {
    const checklist = task.checklist.map((item) =>
      item.id === checklistId ? { ...item, done: !item.done } : item
    );
    await updateTask(task, { checklist });
  }

  async function deleteTask(task: ActionPlanTask) {
    setTasks((current) => current.filter((item) => item.id !== task.id));
    try {
      await db.deleteDoc("action_tasks", task.id);
    } catch (err) {
      console.error(err);
      setError("Não foi possível excluir a tarefa.");
    }
  }

  async function addTask() {
    if (!newTask.title.trim() || !userId) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const created = (await db.addDoc("action_tasks", {
        userId,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        pillar: "gestao",
        status: "todo",
        priority: newTask.priority,
        source: "manual",
        dueDate: newTask.dueDate,
        checklist: [],
        createdAt: now,
        updatedAt: now,
      })) as ActionPlanTask;
      setTasks((current) => [created, ...current]);
      setNewTask({ title: "", description: "", priority: "media", dueDate: addDays(7) });
      setShowNewTask(false);
    } catch (err) {
      console.error(err);
      setError("Não foi possível criar a tarefa.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400" />
          <p className="mt-3 text-xs font-bold text-slate-500">Montando seu plano inteligente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 md:p-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> Plano de Ação Inteligente
            </div>
            <h1 className="mt-5 text-3xl font-black text-white md:text-4xl">Transforme diagnóstico em execução.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              Priorize tarefas, acompanhe o progresso e organize os próximos passos do seu negócio em um quadro simples.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewTask(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black text-white transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Nova tarefa
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs font-bold text-red-300">
          <AlertCircle className="h-4 w-4" /> {error}
          <button type="button" onClick={() => setError("")} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <Target className="h-5 w-5 text-indigo-400" />
          <p className="mt-4 text-3xl font-black text-white">{tasks.length}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">Tarefas no plano</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <Clock3 className="h-5 w-5 text-amber-400" />
          <p className="mt-4 text-3xl font-black text-white">{doingCount}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">Em andamento</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <p className="mt-4 text-3xl font-black text-white">{completedCount}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">Concluídas</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          <p className="mt-4 text-3xl font-black text-white">{progress}%</p>
          <p className="mt-1 text-xs font-bold text-slate-400">Progresso geral</p>
        </div>
      </section>

      <section className="rounded-3xl border border-indigo-500/15 bg-indigo-500/5 p-5">
        <div className="flex items-start gap-3">
          <ListChecks className="mt-0.5 h-5 w-5 text-indigo-400" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-indigo-300">Foco recomendado</p>
            <p className="mt-2 text-sm font-bold text-white">Seu pilar mais crítico é {weakestPillar}.</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">Comece pelas tarefas de prioridade alta ligadas a esse pilar.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {statusColumns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <div key={column.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between px-1 py-2">
                <div>
                  <h2 className="text-sm font-black text-white">{column.label}</h2>
                  <p className="mt-1 text-[10px] font-semibold text-slate-600">{column.description}</p>
                </div>
                <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-900 px-2 text-xs font-black text-slate-400">{columnTasks.length}</span>
              </div>

              <div className="mt-3 space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center">
                    <Circle className="mx-auto h-6 w-6 text-slate-700" />
                    <p className="mt-3 text-xs font-bold text-slate-600">Nenhuma tarefa aqui.</p>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const checklistDone = task.checklist.filter((item) => item.done).length;
                    return (
                      <article key={task.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
                              task.priority === "alta"
                                ? "bg-red-500/10 text-red-300"
                                : task.priority === "media"
                                ? "bg-amber-500/10 text-amber-300"
                                : "bg-emerald-500/10 text-emerald-300"
                            }`}>
                              {priorityLabels[task.priority]}
                            </span>
                            <h3 className="mt-3 text-sm font-black leading-snug text-white">{task.title}</h3>
                          </div>
                          <button type="button" onClick={() => void deleteTask(task)} className="rounded-lg p-2 text-slate-600 hover:bg-red-500/10 hover:text-red-400" aria-label="Excluir tarefa">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {task.description && <p className="mt-3 text-xs leading-relaxed text-slate-500">{task.description}</p>}

                        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                          <span className="rounded-lg bg-slate-950 px-2 py-1">{pillarLabels[task.pillar] || task.pillar}</span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-2 py-1"><Calendar className="h-3 w-3" /> {task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString("pt-BR") : "Sem prazo"}</span>
                        </div>

                        {task.checklist.length > 0 && (
                          <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                            {task.checklist.map((item) => (
                              <button key={item.id} type="button" onClick={() => void toggleChecklist(task, item.id)} className="flex w-full items-start gap-2 text-left">
                                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${item.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-700"}`}>
                                  {item.done && <Check className="h-3 w-3" />}
                                </span>
                                <span className={`text-[11px] leading-relaxed ${item.done ? "text-slate-600 line-through" : "text-slate-400"}`}>{item.text}</span>
                              </button>
                            ))}
                            <p className="pt-1 text-[9px] font-black uppercase tracking-wider text-slate-600">{checklistDone} de {task.checklist.length} etapas</p>
                          </div>
                        )}

                        <button type="button" onClick={() => moveTask(task)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-[10px] font-black text-slate-300 transition hover:border-indigo-500 hover:text-white">
                          {task.status === "todo" ? "Iniciar tarefa" : task.status === "doing" ? "Marcar como concluída" : "Reabrir tarefa"}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </section>

      {showNewTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Plano inteligente</p><h2 className="mt-2 text-xl font-black text-white">Nova tarefa</h2></div>
              <button type="button" onClick={() => setShowNewTask(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-900 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 space-y-4">
              <div><label className="text-xs font-bold text-slate-400">Título</label><input value={newTask.title} onChange={(event) => setNewTask((current) => ({ ...current, title: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="Ex.: Criar campanha de reativação" /></div>
              <div><label className="text-xs font-bold text-slate-400">Descrição</label><textarea value={newTask.description} onChange={(event) => setNewTask((current) => ({ ...current, description: event.target.value }))} className="mt-2 min-h-24 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" placeholder="Descreva o resultado esperado." /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-xs font-bold text-slate-400">Prioridade</label><select value={newTask.priority} onChange={(event) => setNewTask((current) => ({ ...current, priority: event.target.value as ActionTaskPriority }))} className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select></div>
                <div><label className="text-xs font-bold text-slate-400">Prazo</label><input type="date" value={newTask.dueDate} onChange={(event) => setNewTask((current) => ({ ...current, dueDate: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setShowNewTask(false)} className="flex-1 rounded-xl border border-slate-800 px-4 py-3 text-xs font-black text-slate-400 hover:text-white">Cancelar</button>
              <button type="button" onClick={() => void addTask()} disabled={saving || !newTask.title.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Criar tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
