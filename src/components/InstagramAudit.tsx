import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Eye,
  Instagram,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { db } from "../firebase";
import type { InstagramAuditSession, UserProfile } from "../types";

interface InstagramAuditProps {
  profile: UserProfile;
}

type AuditTab = "visao" | "gargalos" | "conteudos" | "hooks" | "plano" | "relatorio";

const loadingSteps = [
  "Organizando as informações fornecidas...",
  "Calculando o índice estratégico estimado...",
  "Mapeando gargalos de posicionamento e conversão...",
  "Criando ideias de conteúdo e ganchos...",
  "Estruturando o plano de ação de 30 dias...",
];

const metricLabels: Record<string, string> = {
  bio: "Bio",
  foto: "Foto",
  nomePerfil: "Nome do perfil",
  nomeUsuario: "Nome de usuário",
  destaques: "Destaques",
  frequencia: "Frequência",
  identidadeVisual: "Identidade visual",
  posicionamento: "Posicionamento",
  clarezaOferta: "Clareza da oferta",
  cta: "Chamada para ação",
  propostaValor: "Proposta de valor",
};

function scoreClass(score: number) {
  if (score >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
  if (score >= 55) return "text-amber-400 border-amber-500/20 bg-amber-500/10";
  return "text-rose-400 border-rose-500/20 bg-rose-500/10";
}

function scoreStatus(score: number) {
  if (score >= 80) return "Forte";
  if (score >= 55) return "Atenção";
  return "Prioridade";
}

export const InstagramAudit: React.FC<InstagramAuditProps> = ({ profile }) => {
  const initialHandle = profile.empresa
    ? `@${profile.empresa.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")}`
    : "@minhaempresa";

  const [username, setUsername] = useState(initialHandle);
  const [empresa, setEmpresa] = useState(profile.empresa || "");
  const [segmento, setSegmento] = useState(profile.segmento || "");
  const [publicoAlvo, setPublicoAlvo] = useState(profile.objetivos || "");
  const [desafio, setDesafio] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [sessions, setSessions] = useState<InstagramAuditSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InstagramAuditSession | null>(null);
  const [activeTab, setActiveTab] = useState<AuditTab>("visao");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [profile.uid]);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = window.setInterval(
      () => setLoadingStep((step) => (step + 1) % loadingSteps.length),
      2600
    );
    return () => window.clearInterval(interval);
  }, [loading]);

  async function loadSessions() {
    try {
      const docs = await db.getDocs("instagram_audits", [{ field: "userId", val: profile.uid }]);
      const sorted = (docs as InstagramAuditSession[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSessions(sorted);
      setSelectedSession((current) => current || sorted[0] || null);
    } catch (err) {
      console.error("Erro ao carregar auditorias:", err);
    }
  }

  const canSubmit = useMemo(
    () => username.trim().length > 2 && empresa.trim().length > 1 && segmento.trim().length > 1,
    [username, empresa, segmento]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      setError("Preencha o perfil, o nome do negócio e o segmento.");
      return;
    }

    setLoading(true);
    setError(null);
    const cleanUsername = username.startsWith("@") ? username : `@${username}`;

    try {
      const response = await fetch("/api/instagram-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cleanUsername, username: cleanUsername, empresa, segmento, publicoAlvo, desafio }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível gerar a auditoria.");

      const newAudit: InstagramAuditSession = {
        id: `audit-${Math.random().toString(36).slice(2)}`,
        userId: profile.uid,
        username: cleanUsername,
        empresa,
        segmento,
        publicoAlvo,
        desafio,
        scoreGeral: data.scoreGeral,
        diagnostico: data.diagnostico,
        pontosFortes: data.pontosFortes,
        pontosAtencao: data.pontosAtencao,
        oportunidades: data.oportunidades,
        estrategiaRecomendada: data.estrategiaRecomendada,
        conteudosPerformance: data.conteudosPerformance,
        hooks: data.hooks,
        ideiasConteudo: data.ideiasConteudo,
        tendencias: data.tendencias,
        plano30Dias: data.plano30Dias,
        gargalos: data.gargalos,
        published: false,
        createdAt: new Date().toISOString(),
        rawReportMarkdown: data.rawReportMarkdown,
      };

      const saved = await db.addDoc("instagram_audits", newAudit);
      const completed = { ...newAudit, id: saved.id || newAudit.id };
      setSessions((items) => [completed, ...items]);
      setSelectedSession(completed);
      setActiveTab("visao");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao processar a auditoria.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSession(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    if (!window.confirm("Remover esta auditoria do histórico?")) return;
    try {
      await db.deleteDoc("instagram_audits", id);
      const remaining = sessions.filter((session) => session.id !== id);
      setSessions(remaining);
      if (selectedSession?.id === id) setSelectedSession(remaining[0] || null);
    } catch (err) {
      console.error(err);
      setError("Não foi possível excluir a auditoria.");
    }
  }

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1800);
  }

  function downloadReport() {
    if (!selectedSession) return;
    const content = selectedSession.rawReportMarkdown || selectedSession.estrategiaRecomendada;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria-instagram-${selectedSession.username.replace("@", "")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const metrics = selectedSession ? Object.entries(selectedSession.diagnostico || {}) : [];
  const weakestMetrics = [...metrics].sort((a, b) => Number(a[1]) - Number(b[1])).slice(0, 3);

  const tabs: Array<{ id: AuditTab; label: string }> = [
    { id: "visao", label: "Visão geral" },
    { id: "gargalos", label: "Gargalos" },
    { id: "conteudos", label: "Conteúdos" },
    { id: "hooks", label: "Ganchos" },
    { id: "plano", label: "Plano 30 dias" },
    { id: "relatorio", label: "Relatório" },
  ];

  return (
    <div id="instagram-audit-module" className="max-w-7xl mx-auto p-5 md:p-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="relative z-10 grid lg:grid-cols-[1fr_310px] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-300">
              <Instagram className="h-3.5 w-3.5" /> Auditoria de Instagram
            </div>
            <h1 className="mt-5 text-3xl md:text-4xl font-black tracking-tight text-white">
              Transforme seu Instagram em uma vitrine que gera oportunidades
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              Receba um diagnóstico estratégico, ideias de conteúdo, ganchos e um plano de execução de 30 dias com base nas informações fornecidas.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-fuchsia-400" />
              <p className="text-sm font-black text-white">Análise orientativa</p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              A ferramenta não afirma acessar automaticamente seu perfil real. As notas são estimativas estratégicas e devem ser validadas com o Instagram Insights.
            </p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
        <aside className="space-y-6 lg:sticky lg:top-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Sparkles className="h-4 w-4 text-fuchsia-400" />
              <h2 className="text-sm font-black text-white">Nova auditoria</h2>
            </div>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {[
                ["Perfil", username, setUsername, "@minhaempresa"],
                ["Empresa", empresa, setEmpresa, "Nome do negócio"],
                ["Segmento", segmento, setSegmento, "Ex.: Autoescola"],
              ].map(([label, value, setter, placeholder]) => (
                <label key={String(label)} className="block space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{String(label)}</span>
                  <input
                    value={String(value)}
                    onChange={(event) => (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)}
                    placeholder={String(placeholder)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-500"
                  />
                </label>
              ))}
              <label className="block space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Público-alvo</span>
                <textarea value={publicoAlvo} onChange={(event) => setPublicoAlvo(event.target.value)} rows={3} placeholder="Quem você deseja atrair?" className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-fuchsia-500" />
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Principal desafio</span>
                <textarea value={desafio} onChange={(event) => setDesafio(event.target.value)} rows={3} placeholder="Ex.: poucas pessoas chamam no WhatsApp" className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-fuchsia-500" />
              </label>

              {error && <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

              <button type="submit" disabled={loading || !canSubmit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-5 py-3.5 text-xs font-black text-white transition hover:bg-fuchsia-500 disabled:bg-slate-800 disabled:text-slate-500">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Instagram className="h-4 w-4" />}
                {loading ? "Gerando auditoria..." : "Gerar auditoria premium"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <h2 className="text-sm font-black text-white">Histórico</h2>
            <div className="mt-4 space-y-2">
              {sessions.length === 0 && <p className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-600">Nenhuma auditoria criada.</p>}
              {sessions.map((session) => (
                <button key={session.id} type="button" onClick={() => { setSelectedSession(session); setActiveTab("visao"); }} className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selectedSession?.id === session.id ? "border-fuchsia-500 bg-fuchsia-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-700"}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black ${scoreClass(session.scoreGeral)}`}>{session.scoreGeral}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-white">{session.username}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{new Date(session.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span onClick={(event) => deleteSession(session.id, event)} className="rounded-lg p-2 text-slate-600 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></span>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main className="min-w-0 space-y-6">
          {loading && (
            <section className="rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10"><Loader2 className="h-8 w-8 animate-spin text-fuchsia-400" /></div>
              <h2 className="mt-5 text-lg font-black text-white">Construindo sua auditoria</h2>
              <p className="mt-2 text-xs text-slate-500">{loadingSteps[loadingStep]}</p>
            </section>
          )}

          {!loading && !selectedSession && (
            <section className="rounded-3xl border border-dashed border-slate-800 bg-slate-950 p-12 text-center">
              <Target className="mx-auto h-10 w-10 text-slate-700" />
              <h2 className="mt-4 text-lg font-black text-white">Crie sua primeira auditoria</h2>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500">Preencha os dados ao lado para receber um diagnóstico estratégico e um plano de conteúdo personalizado.</p>
            </section>
          )}

          {!loading && selectedSession && (
            <>
              <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-3xl border ${scoreClass(selectedSession.scoreGeral)}`}>
                      <span className="text-3xl font-black">{selectedSession.scoreGeral}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider">de 100</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-400">Índice estratégico estimado</p>
                      <h2 className="mt-2 text-2xl font-black text-white">{selectedSession.username}</h2>
                      <p className="mt-1 text-xs text-slate-500">{selectedSession.empresa} · {selectedSession.segmento}</p>
                      <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${scoreClass(selectedSession.scoreGeral)}`}>{scoreStatus(selectedSession.scoreGeral)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => copyText(selectedSession.rawReportMarkdown || selectedSession.estrategiaRecomendada, "report")} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-fuchsia-500"><ClipboardCopy className="h-4 w-4" />{copied === "report" ? "Copiado" : "Copiar"}</button>
                    <button type="button" onClick={downloadReport} className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-xs font-black text-white hover:bg-fuchsia-500"><Download className="h-4 w-4" />Baixar relatório</button>
                  </div>
                </div>
              </section>

              <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-2">
                {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition ${activeTab === tab.id ? "bg-fuchsia-600 text-white" : "text-slate-500 hover:bg-slate-900 hover:text-white"}`}>{tab.label}</button>)}
              </nav>

              {activeTab === "visao" && (
                <div className="space-y-6">
                  <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {metrics.map(([key, value]) => {
                      const score = Number(value);
                      return <div key={key} className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><div className="flex items-center justify-between"><p className="text-xs font-black text-slate-300">{metricLabels[key] || key}</p><span className={`rounded-lg border px-2 py-1 text-[10px] font-black ${scoreClass(score)}`}>{score}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900"><div className="h-full rounded-full bg-fuchsia-500" style={{ width: `${score}%` }} /></div><p className="mt-2 text-[10px] font-bold text-slate-600">{scoreStatus(score)}</p></div>;
                    })}
                  </section>

                  <section className="grid xl:grid-cols-2 gap-6">
                    <div className="rounded-3xl border border-emerald-500/15 bg-emerald-500/5 p-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><h3 className="text-sm font-black text-white">O que está a favor da marca</h3></div><div className="mt-5 space-y-3">{selectedSession.pontosFortes.map((item, index) => <div key={index} className="flex items-start gap-3 text-xs leading-relaxed text-slate-400"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{item}</div>)}</div></div>
                    <div className="rounded-3xl border border-amber-500/15 bg-amber-500/5 p-6"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-amber-400" /><h3 className="text-sm font-black text-white">Onde agir primeiro</h3></div><div className="mt-5 space-y-3">{weakestMetrics.map(([key, value], index) => <div key={key} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-black text-amber-400">{index + 1}</span><div className="flex-1"><p className="text-xs font-black text-white">{metricLabels[key] || key}</p><p className="mt-1 text-[10px] text-slate-500">Pontuação estimada: {Number(value)}/100</p></div></div>)}</div></div>
                  </section>

                  <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6"><div className="flex items-center gap-3"><Lightbulb className="h-5 w-5 text-fuchsia-400" /><h3 className="text-sm font-black text-white">Estratégia recomendada</h3></div><p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-400">{selectedSession.estrategiaRecomendada}</p></section>
                </div>
              )}

              {activeTab === "gargalos" && <section className="grid md:grid-cols-2 gap-4">{selectedSession.gargalos.map((item, index) => <div key={index} className="rounded-2xl border border-rose-500/15 bg-rose-500/5 p-5"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-xs font-black text-rose-400">{index + 1}</span><div><h3 className="text-sm font-black text-white">{item.titulo}</h3><p className="mt-2 text-xs leading-relaxed text-slate-500">{item.impacto}</p></div></div></div>)}</section>}

              {activeTab === "conteudos" && <section className="grid md:grid-cols-2 gap-4">{selectedSession.ideiasConteudo.map((item, index) => <article key={index} className="rounded-2xl border border-slate-800 bg-slate-950 p-5"><div className="flex items-center justify-between gap-3"><span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-2.5 py-1 text-[9px] font-black uppercase text-fuchsia-300">{item.formato}</span><span className="text-[10px] font-bold text-slate-600">#{index + 1}</span></div><h3 className="mt-4 text-sm font-black text-white">{item.titulo}</h3><p className="mt-3 text-xs text-slate-500"><strong className="text-slate-300">Gancho:</strong> {item.gancho}</p><p className="mt-2 text-xs text-slate-500"><strong className="text-slate-300">Objetivo:</strong> {item.objetivo}</p><p className="mt-2 text-xs text-slate-500"><strong className="text-slate-300">CTA:</strong> {item.cta}</p></article>)}</section>}

              {activeTab === "hooks" && <section className="grid md:grid-cols-2 gap-3">{selectedSession.hooks.map((hook, index) => <div key={index} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-[10px] font-black text-fuchsia-400">{index + 1}</span><p className="flex-1 text-xs leading-relaxed text-slate-300">{hook}</p><button type="button" onClick={() => copyText(hook, `hook-${index}`)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-900 hover:text-white">{copied === `hook-${index}` ? <Check className="h-4 w-4 text-emerald-400" /> : <ClipboardCopy className="h-4 w-4" />}</button></div>)}</section>}

              {activeTab === "plano" && <section className="space-y-3">{selectedSession.plano30Dias.map((item) => <div key={item.dia} className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4"><span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300"><span className="text-[8px] font-black uppercase">Dia</span><span className="text-sm font-black">{item.dia}</span></span><div className="flex-1"><span className="rounded-full border border-slate-800 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">{item.tipo.replace("_", " ")}</span><p className="mt-3 text-xs leading-relaxed text-slate-300">{item.tarefa}</p></div></div>)}</section>}

              {activeTab === "relatorio" && <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-fuchsia-400 prose-strong:text-white prose-p:text-slate-400 prose-li:text-slate-400"><Markdown>{selectedSession.rawReportMarkdown || selectedSession.estrategiaRecomendada}</Markdown></section>}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
