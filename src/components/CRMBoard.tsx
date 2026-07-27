import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  Edit3,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { db } from "../firebase";
import type { UserProfile } from "../types";

type LeadStage = "novo" | "contato" | "proposta" | "negociacao" | "venda";

interface CRMLead {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  value: number;
  stage: LeadStage;
  source: string;
  nextContact?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CRMBoardProps {
  profile: UserProfile;
}

const stages: Array<{ id: LeadStage; label: string; description: string }> = [
  { id: "novo", label: "Novo lead", description: "Entrou no funil" },
  { id: "contato", label: "Contato", description: "Atendimento iniciado" },
  { id: "proposta", label: "Proposta", description: "Oferta apresentada" },
  { id: "negociacao", label: "Negociação", description: "Objeções e condições" },
  { id: "venda", label: "Venda", description: "Oportunidade fechada" },
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  value: "",
  stage: "novo" as LeadStage,
  source: "WhatsApp",
  nextContact: "",
  notes: "",
};

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function parseMoney(value: string) {
  return Number(value.replace(/[^0-9,.-]/g, "").replace(".", "").replace(",", ".")) || 0;
}

function dateLabel(value?: string) {
  if (!value) return "Sem retorno agendado";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

export const CRMBoard: React.FC<CRMBoardProps> = ({ profile }) => {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    async function loadLeads() {
      try {
        const items = await db.getDocs("crm_leads", [{ field: "userId", val: profile.uid }]);
        if (active) {
          setLeads((items as CRMLead[]).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        }
      } catch (error) {
        console.error("Erro ao carregar CRM:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadLeads();
    return () => {
      active = false;
    };
  }, [profile.uid]);

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((lead) =>
      [lead.name, lead.phone, lead.email, lead.source, lead.notes].some((value) => value?.toLowerCase().includes(term))
    );
  }, [leads, search]);

  const indicators = useMemo(() => {
    const open = leads.filter((lead) => lead.stage !== "venda");
    const won = leads.filter((lead) => lead.stage === "venda");
    return {
      total: leads.length,
      pipeline: open.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
      wonValue: won.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
      conversion: leads.length ? Math.round((won.length / leads.length) * 100) : 0,
    };
  }, [leads]);

  function openNewLead(stage: LeadStage = "novo") {
    setEditingId(null);
    setForm({ ...emptyForm, stage });
    setModalOpen(true);
  }

  function openEditLead(lead: CRMLead) {
    setEditingId(lead.id);
    setForm({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || "",
      value: String(lead.value || ""),
      stage: lead.stage,
      source: lead.source,
      nextContact: lead.nextContact || "",
      notes: lead.notes || "",
    });
    setModalOpen(true);
  }

  async function saveLead(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    setSaving(true);
    const now = new Date().toISOString();
    try {
      if (editingId) {
        const previous = leads.find((lead) => lead.id === editingId);
        const updated: CRMLead = {
          ...(previous as CRMLead),
          ...form,
          value: parseMoney(form.value),
          updatedAt: now,
        };
        await db.updateDoc("crm_leads", editingId, {
          ...form,
          value: updated.value,
          updatedAt: now,
        });
        setLeads((current) => current.map((lead) => (lead.id === editingId ? updated : lead)));
      } else {
        const created = await db.addDoc("crm_leads", {
          userId: profile.uid,
          ...form,
          value: parseMoney(form.value),
          createdAt: now,
          updatedAt: now,
        });
        setLeads((current) => [{ ...(created as CRMLead) }, ...current]);
      }
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
    } finally {
      setSaving(false);
    }
  }

  async function moveLead(lead: CRMLead, stage: LeadStage) {
    if (lead.stage === stage) return;
    const updatedAt = new Date().toISOString();
    try {
      await db.updateDoc("crm_leads", lead.id, { stage, updatedAt });
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, stage, updatedAt } : item)));
    } catch (error) {
      console.error("Erro ao mover lead:", error);
    }
  }

  async function deleteLead(id: string) {
    if (!window.confirm("Deseja realmente excluir esta oportunidade?")) return;
    try {
      await db.deleteDoc("crm_leads", id);
      setLeads((current) => current.filter((lead) => lead.id !== id));
    } catch (error) {
      console.error("Erro ao excluir lead:", error);
    }
  }

  function nextAction(lead: CRMLead) {
    if (lead.stage === "novo") return "Entre em contato rapidamente e descubra a principal necessidade.";
    if (lead.stage === "contato") return "Confirme interesse, orçamento e prazo antes de montar a proposta.";
    if (lead.stage === "proposta") return "Faça acompanhamento e pergunte o que falta para avançar.";
    if (lead.stage === "negociacao") return "Trate a objeção principal e combine uma decisão com data definida.";
    return "Solicite indicação, avaliação e mantenha o relacionamento pós-venda.";
  }

  return (
    <div className="max-w-[1500px] mx-auto p-5 md:p-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" /> CRM Inteligente
            </div>
            <h1 className="mt-5 text-3xl md:text-4xl font-black text-white">Organize contatos e transforme oportunidades em vendas</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
              Acompanhe o estágio de cada cliente, o valor em negociação e o próximo contato de {profile.empresa || "sua empresa"}.
            </p>
          </div>
          <button onClick={() => openNewLead()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-black text-white hover:bg-indigo-500">
            <Plus className="h-4 w-4" /> Novo cliente
          </button>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Oportunidades", value: indicators.total, icon: Users, description: "contatos cadastrados" },
          { label: "Valor no funil", value: currency(indicators.pipeline), icon: CircleDollarSign, description: "negociações em aberto" },
          { label: "Vendas fechadas", value: currency(indicators.wonValue), icon: ArrowRight, description: "valor conquistado" },
          { label: "Conversão", value: `${indicators.conversion}%`, icon: Sparkles, description: "leads transformados em venda" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400"><Icon className="h-5 w-5" /></div>
              <p className="mt-5 text-2xl font-black text-white">{item.value}</p>
              <p className="mt-2 text-xs font-black text-slate-300">{item.label}</p>
              <p className="mt-1 text-[10px] text-slate-600">{item.description}</p>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome, telefone, origem..." className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500" />
        </div>
        <p className="text-xs font-bold text-slate-500">{filteredLeads.length} oportunidade(s) exibida(s)</p>
      </section>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-950"><Loader2 className="h-7 w-7 animate-spin text-indigo-400" /></div>
      ) : (
        <section className="overflow-x-auto pb-4">
          <div className="grid min-w-[1250px] grid-cols-5 gap-4">
            {stages.map((stage) => {
              const stageLeads = filteredLeads.filter((lead) => lead.stage === stage.id);
              const total = stageLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
              return (
                <div key={stage.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4 min-h-[440px]">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                    <div><h2 className="text-sm font-black text-white">{stage.label}</h2><p className="mt-1 text-[10px] text-slate-600">{stage.description}</p></div>
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black text-slate-400">{stageLeads.length}</span>
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-indigo-400">{currency(total)}</p>

                  <div className="mt-4 space-y-3">
                    {stageLeads.map((lead) => {
                      const stageIndex = stages.findIndex((item) => item.id === lead.stage);
                      const nextStage = stages[Math.min(stageIndex + 1, stages.length - 1)]?.id;
                      return (
                        <article key={lead.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0"><h3 className="truncate text-sm font-black text-white">{lead.name}</h3><p className="mt-1 text-[10px] font-bold text-emerald-400">{currency(lead.value)}</p></div>
                            <div className="flex gap-1">
                              <button onClick={() => openEditLead(lead)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-indigo-400" aria-label="Editar"><Edit3 className="h-3.5 w-3.5" /></button>
                              <button onClick={() => deleteLead(lead.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400" aria-label="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2 text-[10px] text-slate-500">
                            <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {lead.phone}</p>
                            {lead.email && <p className="flex items-center gap-2 truncate"><Mail className="h-3 w-3" /> {lead.email}</p>}
                            <p className="flex items-center gap-2"><CalendarClock className="h-3 w-3" /> {dateLabel(lead.nextContact)}</p>
                          </div>
                          <div className="mt-3 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-3">
                            <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-indigo-400"><Sparkles className="h-3 w-3" /> Próximo passo</p>
                            <p className="mt-1.5 text-[10px] leading-4 text-slate-400">{nextAction(lead)}</p>
                          </div>
                          {lead.stage !== "venda" && (
                            <button onClick={() => moveLead(lead, nextStage)} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-[10px] font-black text-slate-300 hover:border-indigo-500/40 hover:text-white">
                              Avançar etapa <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </article>
                      );
                    })}
                    {stageLeads.length === 0 && <p className="rounded-2xl border border-dashed border-slate-800 p-5 text-center text-[10px] text-slate-600">Nenhuma oportunidade nesta etapa.</p>}
                  </div>
                  <button onClick={() => openNewLead(stage.id)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 px-3 py-2.5 text-[10px] font-black text-slate-500 hover:border-indigo-500/40 hover:text-indigo-400"><Plus className="h-3.5 w-3.5" /> Adicionar oportunidade</button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <form onSubmit={saveLead} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">CRM Inteligente</p><h2 className="mt-2 text-xl font-black text-white">{editingId ? "Editar oportunidade" : "Cadastrar novo cliente"}</h2></div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400"><X className="h-4 w-4" /></button>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Nome do cliente *</span><div className="relative"><UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500" /></div></label>
              <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Telefone / WhatsApp *</span><div className="relative"><MessageCircle className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500" /></div></label>
              <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">E-mail</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
              <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Valor da oportunidade</span><input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="Ex.: 1.500,00" inputMode="decimal" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
              <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Etapa do funil</span><select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value as LeadStage })} className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500">{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
              <label className="block"><span className="mb-2 block text-xs font-black text-slate-300">Origem do contato</span><select value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"><option>WhatsApp</option><option>Instagram</option><option>Google</option><option>Indicação</option><option>Ligação</option><option>Site</option><option>Outro</option></select></label>
              <label className="block md:col-span-2"><span className="mb-2 block text-xs font-black text-slate-300">Próximo contato</span><input type="date" value={form.nextContact} onChange={(event) => setForm({ ...form, nextContact: event.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
              <label className="block md:col-span-2"><span className="mb-2 block text-xs font-black text-slate-300">Observações</span><textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Necessidade, objeção, condição combinada..." className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-700 px-5 py-3 text-xs font-black text-slate-400">Cancelar</button>
              <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-black text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />} {editingId ? "Salvar alterações" : "Cadastrar cliente"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};