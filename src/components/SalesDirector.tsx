import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Goal,
  Lightbulb,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { UserProfile } from "../types";

interface SalesDirectorProps {
  profile?: Partial<UserProfile>;
}

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function numberValue(value: string) {
  return Number(value.replace(/[^0-9,.-]/g, "").replace(".", "").replace(",", ".")) || 0;
}

export const SalesDirector: React.FC<SalesDirectorProps> = ({ profile }) => {
  const [revenue, setRevenue] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [averageTicket, setAverageTicket] = useState("");
  const [salespeople, setSalespeople] = useState("1");
  const [workingDays, setWorkingDays] = useState("22");
  const [difficulty, setDifficulty] = useState("Poucos contatos interessados chegando pelo WhatsApp");
  const [generated, setGenerated] = useState(false);

  const plan = useMemo(() => {
    const currentRevenue = numberValue(revenue);
    const goal = numberValue(monthlyGoal);
    const ticket = Math.max(1, numberValue(averageTicket));
    const team = Math.max(1, numberValue(salespeople));
    const days = Math.max(1, numberValue(workingDays));
    const remaining = Math.max(0, goal - currentRevenue);
    const salesNeeded = Math.ceil(remaining / ticket);
    const dailyRevenue = remaining / days;
    const weeklyRevenue = remaining / Math.max(1, days / 5);
    const dailySales = Math.ceil(salesNeeded / days);
    const salesPerPerson = Math.ceil(salesNeeded / team);

    return {
      currentRevenue,
      goal,
      ticket,
      team,
      days,
      remaining,
      salesNeeded,
      dailyRevenue,
      weeklyRevenue,
      dailySales,
      salesPerPerson,
      progress: goal > 0 ? Math.min(100, Math.round((currentRevenue / goal) * 100)) : 0,
    };
  }, [averageTicket, monthlyGoal, revenue, salespeople, workingDays]);

  const actions = useMemo(() => {
    const normalized = difficulty.toLowerCase();
    const base = [
      "Revisar os contatos pendentes e responder todos em até 10 minutos.",
      `Buscar pelo menos ${Math.max(5, plan.dailySales * 5)} novas conversas comerciais hoje.`,
      "Apresentar uma oferta clara com benefício, prazo e chamada para ação.",
      "Registrar cada oportunidade e definir a próxima ação antes de encerrar o atendimento.",
      "Encerrar o dia conferindo contatos, propostas, vendas e motivos de perda.",
    ];

    if (normalized.includes("whatsapp") || normalized.includes("contato")) {
      base[0] = "Organizar uma lista com todos os contatos do WhatsApp que ainda não receberam retorno.";
      base[2] = "Usar uma mensagem curta com pergunta de diagnóstico antes de apresentar preço.";
    }
    if (normalized.includes("preço") || normalized.includes("caro")) {
      base[2] = "Apresentar valor, diferenciais e condições antes de informar somente o preço.";
    }
    if (normalized.includes("equipe") || normalized.includes("vendedor")) {
      base[0] = "Realizar uma reunião comercial de 15 minutos com meta individual e objeção do dia.";
      base[4] = "Comparar conversão por vendedor e corrigir rapidamente os atendimentos com menor avanço.";
    }
    return base;
  }, [difficulty, plan.dailySales]);

  function generatePlan() {
    setGenerated(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" /> Diretor Comercial IA
            </div>
            <h1 className="mt-5 text-3xl md:text-4xl font-black text-white">Transforme sua meta mensal em ações diárias</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
              Informe os números atuais de {profile?.empresa || "sua empresa"}. O sistema calcula quanto falta vender, distribui a meta e cria um plano simples de execução.
            </p>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-emerald-500/20 bg-emerald-500/10"><CircleDollarSign className="h-10 w-10 text-emerald-400" /></div>
        </div>
      </section>

      {!generated ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-7 space-y-6">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Diagnóstico comercial rápido</p><h2 className="mt-2 text-xl font-black text-white">Preencha os dados do mês</h2></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Faturamento atual</span><input value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="Ex.: 25.000" inputMode="decimal" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500" /></label>
            <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Meta de faturamento</span><input value={monthlyGoal} onChange={(e) => setMonthlyGoal(e.target.value)} placeholder="Ex.: 40.000" inputMode="decimal" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500" /></label>
            <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Ticket médio por venda</span><input value={averageTicket} onChange={(e) => setAverageTicket(e.target.value)} placeholder="Ex.: 1.500" inputMode="decimal" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500" /></label>
            <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Número de vendedores</span><input value={salespeople} onChange={(e) => setSalespeople(e.target.value)} inputMode="numeric" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500" /></label>
            <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Dias úteis restantes</span><input value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} inputMode="numeric" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500" /></label>
            <label className="block md:col-span-2 xl:col-span-1"><span className="mb-2 block text-xs font-black text-slate-300">Principal dificuldade</span><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"><option>Poucos contatos interessados chegando pelo WhatsApp</option><option>Muitos contatos perguntam preço e não compram</option><option>Equipe comercial sem ritmo ou acompanhamento</option><option>Baixa quantidade de propostas enviadas</option><option>Dificuldade para fazer acompanhamento dos interessados</option></select></label>
          </div>
          <button type="button" onClick={generatePlan} disabled={!monthlyGoal || !averageTicket} className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-slate-950 disabled:bg-slate-800 disabled:text-slate-500">Criar meu plano comercial <ArrowRight className="h-4 w-4" /></button>
        </section>
      ) : (
        <>
          <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Falta faturar", value: currency(plan.remaining), icon: Target, description: `Meta total de ${currency(plan.goal)}` },
              { label: "Vendas necessárias", value: plan.salesNeeded, icon: Goal, description: `Ticket médio de ${currency(plan.ticket)}` },
              { label: "Meta por dia", value: currency(plan.dailyRevenue), icon: CalendarDays, description: `${plan.dailySales} venda(s) por dia` },
              { label: "Meta por vendedor", value: plan.salesPerPerson, icon: Users, description: "vendas até o fim do período" },
            ].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><Icon className="h-5 w-5" /></div><p className="mt-5 text-2xl font-black text-white">{item.value}</p><p className="mt-2 text-xs font-black text-slate-300">{item.label}</p><p className="mt-1 text-[10px] text-slate-600">{item.description}</p></div>; })}
          </section>

          <section className="grid xl:grid-cols-[1fr_0.72fr] gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Plano de execução</p><h2 className="mt-2 text-xl font-black text-white">Prioridades de hoje</h2></div><CheckCircle2 className="h-7 w-7 text-emerald-400" /></div>
              <div className="mt-6 space-y-3">{actions.map((action, index) => <div key={action} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xs font-black text-emerald-400">{index + 1}</span><p className="pt-1 text-xs leading-relaxed text-slate-300">{action}</p></div>)}</div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Progresso da meta</p><h2 className="mt-2 text-lg font-black text-white">{plan.progress}% alcançado</h2></div><BarChart3 className="h-7 w-7 text-indigo-400" /></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${plan.progress}%` }} /></div><div className="mt-4 flex justify-between text-[10px] font-bold text-slate-500"><span>{currency(plan.currentRevenue)} realizado</span><span>{currency(plan.goal)} meta</span></div></div>
              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6"><div className="flex items-start gap-3"><Lightbulb className="mt-0.5 h-5 w-5 text-amber-400" /><div><h3 className="text-sm font-black text-white">Recomendação do Diretor</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">Para alcançar a meta, priorize volume de conversas e acompanhamento. Sua referência semanal é <strong className="text-white">{currency(plan.weeklyRevenue)}</strong>. Não espere o fim do mês para corrigir o ritmo.</p></div></div></div>
              <button type="button" onClick={() => setGenerated(false)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-black text-slate-300"><RefreshCw className="h-4 w-4" /> Atualizar números</button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};