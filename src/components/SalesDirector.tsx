import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Goal,
  Lightbulb,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import type { UserProfile } from "../types";
import { db } from "../firebase";

interface SalesDirectorProps {
  profile?: Partial<UserProfile>;
}

type LeadStage = "novo" | "contato" | "proposta" | "negociacao" | "venda";

interface CRMLead {
  id: string;
  userId: string;
  name: string;
  value: number;
  stage: LeadStage;
  nextContact?: string;
  updatedAt?: string;
}

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function numberValue(value: string) {
  return Number(value.replace(/[^0-9,.-]/g, "").replace(".", "").replace(",", ".")) || 0;
}

function daysSince(value?: string) {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

export const SalesDirector: React.FC<SalesDirectorProps> = ({ profile }) => {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loadingCRM, setLoadingCRM] = useState(true);
  const [revenue, setRevenue] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [averageTicket, setAverageTicket] = useState("");
  const [salespeople, setSalespeople] = useState("1");
  const [workingDays, setWorkingDays] = useState("22");
  const [difficulty, setDifficulty] = useState("Poucos contatos interessados chegando pelo WhatsApp");
  const [generated, setGenerated] = useState(false);

  async function loadCRM() {
    if (!profile?.uid) {
      setLoadingCRM(false);
      return;
    }

    setLoadingCRM(true);
    try {
      const result = await db.getDocs("crm_leads", [{ field: "userId", val: profile.uid }]);
      setLeads(result as CRMLead[]);
    } catch (error) {
      console.error("Erro ao carregar dados comerciais:", error);
    } finally {
      setLoadingCRM(false);
    }
  }

  useEffect(() => {
    void loadCRM();
  }, [profile?.uid]);

  const crm = useMemo(() => {
    const won = leads.filter((lead) => lead.stage === "venda");
    const open = leads.filter((lead) => lead.stage !== "venda");
    const proposals = leads.filter((lead) => lead.stage === "proposta" || lead.stage === "negociacao");
    const stale = open.filter((lead) => daysSince(lead.updatedAt) >= 3);
    const today = new Date().toISOString().slice(0, 10);
    const overdue = open.filter((lead) => lead.nextContact && lead.nextContact < today);
    const wonValue = won.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
    const pipeline = open.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
    const proposalValue = proposals.reduce((sum, lead) => sum + Number(lead.value || 0), 0);

    return {
      total: leads.length,
      won: won.length,
      wonValue,
      pipeline,
      proposalValue,
      stale,
      overdue,
      conversion: leads.length ? Math.round((won.length / leads.length) * 100) : 0,
      averageTicket: won.length ? wonValue / won.length : 0,
    };
  }, [leads]);

  useEffect(() => {
    if (!revenue && crm.wonValue > 0) setRevenue(String(crm.wonValue));
    if (!averageTicket && crm.averageTicket > 0) setAverageTicket(String(Math.round(crm.averageTicket)));
  }, [crm.averageTicket, crm.wonValue]);

  const plan = useMemo(() => {
    const currentRevenue = numberValue(revenue);
    const goal = numberValue(monthlyGoal);
    const ticket = Math.max(1, numberValue(averageTicket));
    const team = Math.max(1, numberValue(salespeople));
    const days = Math.max(1, numberValue(workingDays));
    const remaining = Math.max(0, goal - currentRevenue);
    const salesNeeded = Math.ceil(remaining / ticket);

    return {
      currentRevenue,
      goal,
      ticket,
      remaining,
      salesNeeded,
      dailyRevenue: remaining / days,
      weeklyRevenue: remaining / Math.max(1, days / 5),
      dailySales: Math.ceil(salesNeeded / days),
      salesPerPerson: Math.ceil(salesNeeded / team),
      progress: goal > 0 ? Math.min(100, Math.round((currentRevenue / goal) * 100)) : 0,
    };
  }, [averageTicket, monthlyGoal, revenue, salespeople, workingDays]);

  const insights = useMemo(() => {
    const items: Array<{ title: string; text: string; level: "warning" | "opportunity" | "success" }> = [];

    if (crm.overdue.length > 0) {
      items.push({
        title: "Retornos atrasados",
        text: `${crm.overdue.length} cliente(s) possuem contato vencido. Comece o dia por eles para evitar perda de interesse.`,
        level: "warning",
      });
    }

    if (crm.stale.length > 0) {
      items.push({
        title: "Oportunidades paradas",
        text: `${crm.stale.length} oportunidade(s) estão sem atualização há 3 dias ou mais. Retome a conversa com uma pergunta objetiva.`,
        level: "warning",
      });
    }

    if (crm.proposalValue > 0) {
      items.push({
        title: "Dinheiro próximo do fechamento",
        text: `Existem ${currency(crm.proposalValue)} em propostas e negociações. Priorize acompanhamento antes de buscar novos contatos.`,
        level: "opportunity",
      });
    }

    if (crm.pipeline > 0) {
      items.push({
        title: "Potencial no funil",
        text: `Seu CRM possui ${currency(crm.pipeline)} em oportunidades abertas. Uma conversão de 20% representa ${currency(crm.pipeline * 0.2)}.`,
        level: "opportunity",
      });
    }

    if (crm.conversion >= 25) {
      items.push({
        title: "Conversão saudável",
        text: `Sua conversão registrada está em ${crm.conversion}%. Mantenha o padrão de atendimento e aumente o volume de oportunidades qualificadas.`,
        level: "success",
      });
    }

    if (items.length === 0) {
      items.push({
        title: "Cadastre oportunidades",
        text: "Use o CRM para registrar clientes, valores, etapas e retornos. O Diretor Comercial passará a orientar suas prioridades automaticamente.",
        level: "opportunity",
      });
    }

    return items.slice(0, 4);
  }, [crm]);

  const actions = useMemo(() => {
    const normalized = difficulty.toLowerCase();
    const base = [
      crm.overdue.length ? `Responder os ${crm.overdue.length} retornos atrasados antes de iniciar novas prospecções.` : "Revisar os contatos pendentes e responder rapidamente.",
      crm.stale.length ? `Reativar as ${crm.stale.length} oportunidades paradas com uma mensagem personalizada.` : `Buscar pelo menos ${Math.max(5, plan.dailySales * 5)} novas conversas comerciais hoje.`,
      crm.proposalValue ? `Acompanhar os ${currency(crm.proposalValue)} que estão em proposta ou negociação.` : "Apresentar uma oferta clara com benefício, prazo e chamada para ação.",
      "Registrar a próxima ação e uma data de retorno para cada oportunidade.",
      "Encerrar o dia conferindo contatos, propostas, vendas e motivos de perda.",
    ];

    if (normalized.includes("preço") || normalized.includes("caro")) {
      base[2] = "Apresentar valor, diferenciais e condições antes de informar somente o preço.";
    }
    if (normalized.includes("equipe") || normalized.includes("vendedor")) {
      base[0] = "Realizar uma reunião comercial de 15 minutos com meta individual e objeção do dia.";
    }
    return base;
  }, [crm.overdue.length, crm.proposalValue, crm.stale.length, difficulty, plan.dailySales]);

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300"><TrendingUp className="h-3.5 w-3.5" /> Diretor Comercial IA</div>
            <h1 className="mt-5 text-3xl md:text-4xl font-black text-white">Decisões comerciais baseadas no seu CRM</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">O sistema analisa oportunidades, retornos, propostas e vendas de {profile?.empresa || "sua empresa"} para indicar o que precisa de atenção agora.</p>
          </div>
          <button onClick={() => void loadCRM()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-black text-slate-300 hover:border-emerald-500/40">
            {loadingCRM ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Atualizar análise
          </button>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Valor no funil", value: currency(crm.pipeline), icon: CircleDollarSign, description: `${crm.total} oportunidade(s) cadastrada(s)` },
          { label: "Vendas realizadas", value: currency(crm.wonValue), icon: UserCheck, description: `${crm.won} negócio(s) fechado(s)` },
          { label: "Taxa de conversão", value: `${crm.conversion}%`, icon: BarChart3, description: "vendas sobre oportunidades" },
          { label: "Retornos atrasados", value: crm.overdue.length, icon: Clock3, description: "clientes que exigem ação" },
        ].map((item) => {
          const Icon = item.icon;
          return <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><Icon className="h-5 w-5" /></div><p className="mt-5 text-2xl font-black text-white">{item.value}</p><p className="mt-2 text-xs font-black text-slate-300">{item.label}</p><p className="mt-1 text-[10px] text-slate-600">{item.description}</p></div>;
        })}
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div key={insight.title} className={`rounded-3xl border p-5 ${insight.level === "warning" ? "border-amber-500/20 bg-amber-500/5" : insight.level === "success" ? "border-emerald-500/20 bg-emerald-500/5" : "border-indigo-500/20 bg-indigo-500/5"}`}>
            <div className="flex items-start gap-3">
              {insight.level === "warning" ? <AlertTriangle className="h-5 w-5 text-amber-400" /> : insight.level === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Lightbulb className="h-5 w-5 text-indigo-400" />}
              <div><h3 className="text-sm font-black text-white">{insight.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-400">{insight.text}</p></div>
            </div>
          </div>
        ))}
      </section>

      {!generated ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-7 space-y-6">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Planejamento de meta</p><h2 className="mt-2 text-xl font-black text-white">Transforme a meta mensal em ações diárias</h2></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Field label="Faturamento atual" value={revenue} onChange={setRevenue} placeholder="Ex.: 25.000" />
            <Field label="Meta de faturamento" value={monthlyGoal} onChange={setMonthlyGoal} placeholder="Ex.: 40.000" />
            <Field label="Ticket médio por venda" value={averageTicket} onChange={setAverageTicket} placeholder="Ex.: 1.500" />
            <Field label="Número de vendedores" value={salespeople} onChange={setSalespeople} />
            <Field label="Dias úteis restantes" value={workingDays} onChange={setWorkingDays} />
            <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Principal dificuldade</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"><option>Poucos contatos interessados chegando pelo WhatsApp</option><option>Muitos contatos perguntam preço e não compram</option><option>Equipe comercial sem ritmo ou acompanhamento</option><option>Baixa quantidade de propostas enviadas</option><option>Dificuldade para fazer acompanhamento dos interessados</option></select></label>
          </div>
          <button type="button" onClick={() => setGenerated(true)} disabled={!monthlyGoal || !averageTicket} className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-slate-950 disabled:bg-slate-800 disabled:text-slate-500">Criar plano comercial <ArrowRight className="h-4 w-4" /></button>
        </section>
      ) : (
        <>
          <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Falta faturar", value: currency(plan.remaining), icon: Target, description: `Meta total de ${currency(plan.goal)}` },
              { label: "Vendas necessárias", value: plan.salesNeeded, icon: Goal, description: `Ticket médio de ${currency(plan.ticket)}` },
              { label: "Meta por dia", value: currency(plan.dailyRevenue), icon: CalendarDays, description: `${plan.dailySales} venda(s) por dia` },
              { label: "Meta por vendedor", value: plan.salesPerPerson, icon: Users, description: "vendas até o fim do período" },
            ].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><Icon className="h-5 w-5 text-emerald-400" /><p className="mt-5 text-2xl font-black text-white">{item.value}</p><p className="mt-2 text-xs font-black text-slate-300">{item.label}</p><p className="mt-1 text-[10px] text-slate-600">{item.description}</p></div>; })}
          </section>
          <section className="grid xl:grid-cols-[1fr_0.72fr] gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6"><h2 className="text-xl font-black text-white">Prioridades de hoje</h2><div className="mt-6 space-y-3">{actions.map((action, index) => <div key={action} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xs font-black text-emerald-400">{index + 1}</span><p className="pt-1 text-xs leading-relaxed text-slate-300">{action}</p></div>)}</div></div>
            <div className="space-y-6"><div className="rounded-3xl border border-slate-800 bg-slate-950 p-6"><h2 className="text-lg font-black text-white">{plan.progress}% da meta</h2><div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${plan.progress}%` }} /></div><div className="mt-4 flex justify-between text-[10px] font-bold text-slate-500"><span>{currency(plan.currentRevenue)} realizado</span><span>{currency(plan.goal)} meta</span></div></div><div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6"><Lightbulb className="h-5 w-5 text-amber-400" /><p className="mt-3 text-xs leading-relaxed text-slate-400">Sua referência semanal é <strong className="text-white">{currency(plan.weeklyRevenue)}</strong>. Corrija o ritmo antes do fim do mês.</p></div><button onClick={() => setGenerated(false)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-black text-slate-300"><RefreshCw className="h-4 w-4" /> Atualizar números</button></div>
          </section>
        </>
      )}
    </div>
  );
};

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode="decimal" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500" /></label>;
}
