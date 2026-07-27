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
  InstagramAuditSession,
} from "../types";

interface ActionPlanProps {
  pillars: CrescerPillars;
}

const columns: Array<{ id: ActionTaskStatus; label: string }> = [
  { id: "todo", label: "A fazer" },
  { id: "doing", label: "Em andamento" },
  { id: "done", label: "Concluído" },
];

const pillarLabel: Record<string, string> = {
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

function dueDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function taskBase(userId: string) {
  const now = new Date().toISOString();
  return { userId, status: "todo" as const, createdAt: now, updatedAt: now };
}

function diagnosticSuggestions(userId: string, pillars: CrescerPillars): Omit<ActionPlanTask, "id">[] {
  const templates: Record<string, { title: string; description: string; steps: string[] }> = {
    conhecimento: { title: "Mapear os números principais do negócio", description: "Organize faturamento, custos, margem e metas para tomar decisões com segurança.", steps: ["Levantar os últimos 3 meses", "Listar custos fixos e variáveis", "Definir meta mensal"] },
    relacionamento: { title: "Criar rotina de relacionamento com clientes", description: "Recupere clientes inativos e aumente indicações e avaliações.", steps: ["Separar clientes ativos e inativos", "Criar mensagem de reativação", "Solicitar avaliações"] },
    estrategia: { title: "Definir a prioridade comercial dos próximos 30 dias", description: "Escolha uma meta central e concentre os esforços nela.", steps: ["Definir objetivo", "Escolher indicador", "Revisar semanalmente"] },
    sistema: { title: "Padronizar o processo comercial", description: "Organize o caminho do primeiro contato até o fechamento.", steps: ["Mapear etapas", "Criar script", "Definir follow-up"] },
    comunicacao: { title: "Melhorar a comunicação da oferta", description: "Deixe claro o benefício, o diferencial e o próximo passo.", steps: ["Revisar promessa", "Criar CTA", "Atualizar materiais"] },
    eficiencia: { title: "Eliminar gargalos operacionais", description: "Reduza tarefas repetitivas e atrasos que não geram resultado.", steps: ["Listar gargalos", "Escolher automação", "Criar rotina de controle"] },
    resultados: { title: "Implantar acompanhamento semanal de resultados", description: "Acompanhe poucos indicadores com consistência.", steps: ["Escolher 3 indicadores", "Criar registro semanal", "Definir ações corretivas"] },
  };

  return Object.entries(pillars)
    .sort(([, a], [, b]) => Number(a) - Number(b))
    .slice(0, 3)
    .map(([pillar], index) => {
      const item = templates[pillar] || templates.estrategia;
      return {
        ...taskBase(userId),
        title: item.title,
        description: item.description,
        pillar: pillar as keyof CrescerPillars,
        priority: index === 0 ? "alta" : index === 1 ? "media" : "baixa",
        source: "diagnostico",
        dueDate: dueDate((index + 1) * 7),
        checklist: item.steps.map((text, step) => ({ id: `diag-${pillar}-${step}`, text, done: false })),
      };
    });
}

function auditSuggestions(userId: string, audit: InstagramAuditSession): Omit<ActionPlanTask, "id">[] {
  const ideas = (audit.plano30Dias || []).slice(0, 3);
  if (ideas.length) {
    return ideas.map((item, index) => ({
      ...taskBase(userId),
      title: item.tarefa,
      description: `Ação recomendada pela auditoria do Instagram @${audit.username}.`,
      pillar: "marketing",
      priority: index === 0 ? "alta" : "media",
      source: "instagram",
      dueDate: dueDate(Math.max(3, Number(item.dia || (index + 1) * 5))),
      checklist: [],
    }));
  }

  return (audit.pontosAtencao || []).slice(0, 3).map((item, index) => ({
    ...taskBase(userId),
    title: `Corrigir ponto de atenção: ${item}`,
    description: `Melhoria identificada na auditoria do Instagram @${audit.username}.`,
    pillar: "marketing",
    priority: index === 0 ? "alta" : "media",
    source: "instagram",
    dueDate: dueDate((index + 1) * 5),
    checklist: [],
  }));
}

export const ActionPlanSection: React.FC<ActionPlanProps> = ({ pillars }) => {
  const [tasks, setTasks] = useState<ActionPlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "media" as ActionTaskPriority, dueDate: dueDate(7) });
  const userId = auth.currentUser?.uid || "";

  useEffect(() => {
    let active = true;
    async function load() {
      if (!userId) return setLoading(false);
      try {
        const [saved, audits] = await Promise.all([
          db.getDocs("action_tasks", [{ field: "userId", val: userId }]),
          db.getDocs("instagram_audits", [{ field: "userId", val: userId }]),
        ]);
        let current = saved as ActionPlanTask[];
        const additions: Omit<ActionPlanTask, "id">[] = [];

        if (!current.some((task) => task.source === "diagnostico")) additions.push(...diagnosticSuggestions(userId, pillars));

        const latestAudit = [...(audits as InstagramAuditSession[])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        if (latestAudit && !current.some((task) => task.source === "instagram")) additions.push(...auditSuggestions(userId, latestAudit));

        for (const addition of additions) {
          const created = (await db.addDoc("action_tasks", addition)) as ActionPlanTask;
          current = [created, ...current];
        }
        if (active) setTasks(current);
      } catch (err) {
        console.error(err);
        if (active) setError("Não foi possível carregar o plano de ação.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [userId]);

  const completed = tasks.filter((task) => task.status === "done").length;
  const doing = tasks.filter((task) => task.status === "doing").length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const weakest = useMemo(() => Object.entries(pillars).sort(([, a], [, b]) => Number(a) - Number(b))[0]?.[0], [pillars]);

  async function updateTask(task: ActionPlanTask, changes: Partial<ActionPlanTask>) {
    const update = { ...changes, updatedAt: new Date().toISOString(), ...(changes.status === "done" ? { completedAt: new Date().toISOString() } : {}) };
    setTasks((list) => list.map((item) => item.id === task.id ? { ...item, ...update } : item));
    try { await db.updateDoc("action_tasks", task.id, update); } catch { setError("Não foi possível salvar a alteração."); }
  }

  async function createTask() {
    if (!form.title.trim() || !userId) return;
    setSaving(true);
    try {
      const created = (await db.addDoc("action_tasks", {
        ...taskBase(userId), title: form.title.trim(), description: form.description.trim(), pillar: "gestao",
        priority: form.priority, source: "manual", dueDate: form.dueDate, checklist: [],
      })) as ActionPlanTask;
      setTasks((list) => [created, ...list]);
      setForm({ title: "", description: "", priority: "media", dueDate: dueDate(7) });
      setShowForm(false);
    } catch { setError("Não foi possível criar a tarefa."); } finally { setSaving(false); }
  }

  if (loading) return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 md:p-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-300"><Sparkles className="h-3.5 w-3.5" /> Plano de Ação Inteligente</div><h1 className="mt-5 text-3xl font-black text-white">Transforme análise em execução.</h1><p className="mt-3 max-w-2xl text-sm text-slate-400">As tarefas do diagnóstico e da auditoria do Instagram são organizadas automaticamente.</p></div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black text-white"><Plus className="h-4 w-4" /> Nova tarefa</button>
        </div>
      </section>

      {error && <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs font-bold text-red-300"><AlertCircle className="h-4 w-4" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="h-4 w-4" /></button></div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ icon: Target, value: tasks.length, label: "Tarefas" }, { icon: Clock3, value: doing, label: "Em andamento" }, { icon: CheckCircle2, value: completed, label: "Concluídas" }, { icon: TrendingUp, value: `${progress}%`, label: "Progresso" }].map((item) => <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><item.icon className="h-5 w-5 text-indigo-400" /><p className="mt-4 text-3xl font-black text-white">{item.value}</p><p className="mt-1 text-xs font-bold text-slate-400">{item.label}</p></div>)}
      </section>

      <section className="rounded-3xl border border-indigo-500/15 bg-indigo-500/5 p-5"><div className="flex gap-3"><ListChecks className="h-5 w-5 text-indigo-400" /><div><p className="text-xs font-black uppercase tracking-wider text-indigo-300">Foco recomendado</p><p className="mt-2 text-sm font-bold text-white">Comece por {pillarLabel[weakest] || "Estratégia"} e pelas tarefas de prioridade alta.</p></div></div></section>

      <section className="grid gap-5 xl:grid-cols-3">
        {columns.map((column) => <div key={column.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4"><div className="flex items-center justify-between px-1 py-2"><h2 className="text-sm font-black text-white">{column.label}</h2><span className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-black text-slate-400">{tasks.filter((task) => task.status === column.id).length}</span></div><div className="mt-3 space-y-3">{tasks.filter((task) => task.status === column.id).length === 0 ? <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center"><Circle className="mx-auto h-6 w-6 text-slate-700" /></div> : tasks.filter((task) => task.status === column.id).map((task) => <article key={task.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-indigo-500/10 px-2 py-1 text-[9px] font-black uppercase text-indigo-300">{task.priority}</span><h3 className="mt-3 text-sm font-black text-white">{task.title}</h3></div><button onClick={async () => { setTasks((list) => list.filter((item) => item.id !== task.id)); await db.deleteDoc("action_tasks", task.id); }} className="p-2 text-slate-600 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>{task.description && <p className="mt-3 text-xs leading-relaxed text-slate-500">{task.description}</p>}<div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500"><span className="rounded-lg bg-slate-950 px-2 py-1">{pillarLabel[task.pillar] || task.pillar}</span><span className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-2 py-1"><Calendar className="h-3 w-3" />{task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString("pt-BR") : "Sem prazo"}</span></div>{task.checklist.length > 0 && <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">{task.checklist.map((step) => <button key={step.id} onClick={() => void updateTask(task, { checklist: task.checklist.map((item) => item.id === step.id ? { ...item, done: !item.done } : item) })} className="flex w-full items-start gap-2 text-left"><span className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border ${step.done ? "border-emerald-500 bg-emerald-500" : "border-slate-700"}`}>{step.done && <Check className="h-3 w-3 text-white" />}</span><span className={`text-[11px] ${step.done ? "text-slate-600 line-through" : "text-slate-400"}`}>{step.text}</span></button>)}</div>}<button onClick={() => void updateTask(task, { status: task.status === "todo" ? "doing" : task.status === "doing" ? "done" : "todo" })} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-[10px] font-black text-slate-300">{task.status === "todo" ? "Iniciar" : task.status === "doing" ? "Concluir" : "Reabrir"}<ChevronRight className="h-3.5 w-3.5" /></button></article>)}</div></div>)}
      </section>

      {showForm && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4"><div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-white">Nova tarefa</h2><button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-500" /></button></div><div className="mt-6 space-y-4"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título da tarefa" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white" /><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição" className="min-h-24 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white" /><div className="grid gap-4 sm:grid-cols-2"><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ActionTaskPriority })} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white"><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white" /></div></div><div className="mt-6 flex gap-3"><button onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-800 px-4 py-3 text-xs font-black text-slate-400">Cancelar</button><button onClick={() => void createTask()} disabled={saving || !form.title.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Criar</button></div></div></div>}
    </div>
  );
};
