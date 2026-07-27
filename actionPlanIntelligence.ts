import type { ActionPlanTask, CrescerPillars } from "../types";

export interface ActionPlanInsight {
  overdueCount: number;
  dueSoonCount: number;
  highPriorityOpenCount: number;
  executionRate: number;
  recommendedTaskId: string | null;
  recommendedReason: string;
}

export interface ActionPlanHorizon {
  label: "30 dias" | "60 dias" | "90 dias";
  tasks: ActionPlanTask[];
}

const priorityWeight = {
  alta: 30,
  media: 18,
  baixa: 8,
};

const statusWeight = {
  todo: 15,
  doing: 24,
  done: -100,
};

function normalizeDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function daysUntilDue(task: ActionPlanTask, now = new Date()) {
  const due = normalizeDate(task.dueDate);
  if (!due) return null;
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return Math.ceil((due.getTime() - current.getTime()) / 86_400_000);
}

export function isTaskOverdue(task: ActionPlanTask, now = new Date()) {
  const days = daysUntilDue(task, now);
  return task.status !== "done" && days !== null && days < 0;
}

export function getTaskIntelligenceScore(
  task: ActionPlanTask,
  pillars: CrescerPillars,
  now = new Date()
) {
  let score = priorityWeight[task.priority] + statusWeight[task.status];
  const days = daysUntilDue(task, now);

  if (days !== null) {
    if (days < 0) score += 45 + Math.min(20, Math.abs(days));
    else if (days <= 2) score += 35;
    else if (days <= 7) score += 22;
    else if (days <= 14) score += 10;
  }

  if (task.source === "diagnostico") score += 10;
  if (task.source === "instagram") score += 7;

  if (task.pillar in pillars) {
    const pillarValue = Number(pillars[task.pillar as keyof CrescerPillars] || 0);
    const normalized = pillarValue <= 10 ? pillarValue * 10 : pillarValue;
    score += Math.max(0, Math.round((100 - normalized) / 4));
  }

  const checklistTotal = task.checklist.length;
  const checklistDone = task.checklist.filter((item) => item.done).length;
  if (checklistTotal > 0) {
    const checklistProgress = checklistDone / checklistTotal;
    if (checklistProgress > 0 && checklistProgress < 1) score += 12;
  }

  return score;
}

export function sortTasksIntelligently(
  tasks: ActionPlanTask[],
  pillars: CrescerPillars,
  now = new Date()
) {
  return [...tasks].sort((a, b) => {
    const scoreDifference =
      getTaskIntelligenceScore(b, pillars, now) -
      getTaskIntelligenceScore(a, pillars, now);

    if (scoreDifference !== 0) return scoreDifference;

    const aDue = normalizeDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDue = normalizeDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  });
}

export function buildActionPlanInsight(
  tasks: ActionPlanTask[],
  pillars: CrescerPillars,
  now = new Date()
): ActionPlanInsight {
  const openTasks = tasks.filter((task) => task.status !== "done");
  const completedTasks = tasks.length - openTasks.length;
  const ordered = sortTasksIntelligently(openTasks, pillars, now);
  const recommended = ordered[0] || null;

  const overdueCount = openTasks.filter((task) => isTaskOverdue(task, now)).length;
  const dueSoonCount = openTasks.filter((task) => {
    const days = daysUntilDue(task, now);
    return days !== null && days >= 0 && days <= 7;
  }).length;

  return {
    overdueCount,
    dueSoonCount,
    highPriorityOpenCount: openTasks.filter((task) => task.priority === "alta").length,
    executionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
    recommendedTaskId: recommended?.id || null,
    recommendedReason: recommended
      ? isTaskOverdue(recommended, now)
        ? "Esta tarefa está atrasada e tem o maior impacto estimado."
        : recommended.priority === "alta"
          ? "Esta é a tarefa aberta de maior prioridade e impacto."
          : "Esta tarefa combina prazo, prioridade e impacto no pilar mais crítico."
      : "Nenhuma tarefa pendente no momento.",
  };
}

export function groupTasksByHorizon(
  tasks: ActionPlanTask[],
  now = new Date()
): ActionPlanHorizon[] {
  const openTasks = tasks.filter((task) => task.status !== "done");
  const groups: ActionPlanHorizon[] = [
    { label: "30 dias", tasks: [] },
    { label: "60 dias", tasks: [] },
    { label: "90 dias", tasks: [] },
  ];

  for (const task of openTasks) {
    const days = daysUntilDue(task, now);
    if (days === null || days <= 30) groups[0].tasks.push(task);
    else if (days <= 60) groups[1].tasks.push(task);
    else groups[2].tasks.push(task);
  }

  return groups;
}
