/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CheckSquare, Square, Play, Calendar, Target, Award, Sparkles } from "lucide-react";
import { CrescerPillars } from "../types";

interface ActionPlanProps {
  pillars: CrescerPillars;
}

interface ActionTask {
  id: string;
  pillar: string;
  taskText: string;
  duration: string;
  checked: boolean;
  type: 'quickwin' | 'medium';
}

export const ActionPlanSection: React.FC<ActionPlanProps> = ({ pillars }) => {
  const [tasks, setTasks] = useState<ActionTask[]>([
    { id: "t-1", pillar: "Financeiro", taskText: "Mapear faturamento real diário e reconciliar todas as taxas de cartões de crédito/débito.", duration: "Dias 1 a 5", checked: false, type: "quickwin" },
    { id: "t-2", pillar: "Comunicação", taskText: "Obter ativamente pelo menos 5 novas avaliações positivas com nota máxima no perfil do Google Meu Negócio.", duration: "Dias 6 a 10", checked: false, type: "quickwin" },
    { id: "t-3", pillar: "Relacionamento", taskText: "Estruturar lista de transmissão VIP de WhatsApp Business com cupom exclusivo pós-venda para clientes inativos há mais de 30 dias.", duration: "Dias 11 a 15", checked: false, type: "quickwin" },
    { id: "t-4", pillar: "Processos", taskText: "Criar playbook padrão simplificado de 1 página com o roteiro de abertura e fechamento de caixa.", duration: "Dias 16 a 22", checked: false, type: "medium" },
    { id: "t-5", pillar: "Estratégia", taskText: "Sentar com a liderança para projetar o faturamento-alvo dos próximos 6 meses com limites de custos.", duration: "Dias 23 a 30", checked: false, type: "medium" }
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const completedCount = tasks.filter(t => t.checked).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div id="action-plan-root" className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 text-indigo-400">
          <CheckSquare className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Cronograma de Ativação</span>
        </div>
        <h2 className="text-xl font-extrabold text-white mt-1.5">Plano de Ação Tático</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Seu plano tático gerado de forma automatizada. Execute e dê check-out nos Quick Wins de 30 dias para otimizar os pilares críticos do Método CRESCER™.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-300">Conclusão de Metas Recentes</h3>
            <p className="text-xs text-slate-500 font-semibold">{completedCount} de {tasks.length} tarefas de crescimento operacional finalizadas</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-2xl font-black text-indigo-400">{progressPercent}%</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Evolução</span>
          </div>
        </div>

        {/* Custom Progress bar */}
        <div className="w-full h-2.5 bg-slate-900 border border-slate-900 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist List Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cronograma de 30 Dias</h3>
        
        <div className="space-y-3">
          {tasks.map((task) => {
            return (
              <button
                id={`btn-toggle-task-${task.id}`}
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full p-4 rounded-2xl border text-left flex gap-4 transition-all duration-200 outline-none items-start ${
                  task.checked 
                    ? "bg-slate-900/40 border-slate-900 text-slate-500" 
                    : "bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                {/* Custom Checkbox style */}
                <div className="shrink-0 mt-0.5">
                  {task.checked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600 hover:text-indigo-400 shrink-0" />
                  )}
                </div>

                {/* Content body */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-indigo-400">{task.pillar}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {task.duration}
                    </span>
                  </div>
                  
                  <p className={`text-sm leading-relaxed font-semibold ${task.checked ? "line-through text-slate-500 font-medium" : "text-slate-200"}`}>
                    {task.taskText}
                  </p>
                </div>

                {/* Badges indicators */}
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                  task.checked 
                    ? "bg-slate-900 text-slate-600 border border-slate-900" 
                    : task.type === 'quickwin' 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                    : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25"
                }`}>
                  {task.checked ? "Feito" : task.type === 'quickwin' ? "Quick Win" : "Ativação"}
                </span>

              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
