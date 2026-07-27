import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Building2,
  Check,
  ClipboardCopy,
  Download,
  Loader2,
  MapPin,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { motion } from "motion/react";

interface CompetitionRadarProps {
  userCity: string;
  userSegment: string;
  userCompany: string;
  onGenerateAnalysis: (cidade: string, segmento: string, empresa: string) => Promise<string>;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-black text-white">{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    )
  );
}

export const CompetitionRadar: React.FC<CompetitionRadarProps> = ({
  userCity,
  userSegment,
  userCompany,
  onGenerateAnalysis,
}) => {
  const [cidade, setCidade] = useState(userCity || "");
  const [segmento, setSegmento] = useState(userSegment || "");
  const [empresa, setEmpresa] = useState(userCompany || "");
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(
    () => empresa.trim().length >= 2 && segmento.trim().length >= 2 && cidade.trim().length >= 2,
    [empresa, segmento, cidade]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      setError("Preencha o nome da empresa, o segmento e a cidade para gerar a análise.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisText(null);
    try {
      const response = await onGenerateAnalysis(cidade.trim(), segmento.trim(), empresa.trim());
      setAnalysisText(response);
    } catch (err) {
      console.error(err);
      setError("Não foi possível gerar o radar neste momento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReport() {
    if (!analysisText) return;
    await navigator.clipboard.writeText(analysisText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadReport() {
    if (!analysisText) return;
    const content = `RADAR DA CONCORRÊNCIA™\n\nEmpresa: ${empresa}\nSegmento: ${segmento}\nLocalidade: ${cidade}\nData: ${new Date().toLocaleDateString("pt-BR")}\n\n${analysisText}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `radar-concorrencia-${empresa.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function resetAnalysis() {
    setAnalysisText(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div id="competition-radar-root" className="max-w-6xl mx-auto p-5 md:p-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-pink-600/10 blur-3xl" />
        <div className="relative z-10 grid lg:grid-cols-[1fr_300px] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-pink-300">
              <Radar className="h-3.5 w-3.5" /> Radar da Concorrência™
            </div>
            <h1 className="mt-5 text-3xl md:text-4xl font-black tracking-tight text-white">
              Encontre espaços para sua empresa se diferenciar
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              Gere uma análise estratégica do seu mercado local, com padrões prováveis do setor, oportunidades de posicionamento e um plano prático de pesquisa e ação.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-[11px] font-bold text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Sem inventar concorrentes reais
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                <Target className="h-4 w-4 text-pink-400" /> Oportunidades acionáveis
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">O relatório entrega</p>
            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /><span>Mapa de forças e fragilidades do mercado</span></div>
              <div className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /><span>Possíveis diferenciais competitivos</span></div>
              <div className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /><span>Checklist para pesquisa local real</span></div>
              <div className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 text-emerald-400" /><span>Plano de ação para 30 dias</span></div>
            </div>
          </div>
        </div>
      </section>

      {!analysisText && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl">
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-400">Dados da análise</p>
            <h2 className="mt-2 text-xl font-black text-white">Defina o mercado que deseja avaliar</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">Use informações específicas para receber recomendações mais úteis.</p>
          </div>

          <form id="radar-analysis-form" onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nome da empresa</span>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <input id="radar-company-input" value={empresa} onChange={(event) => setEmpresa(event.target.value)} placeholder="Ex.: Autoescola 2M" className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-pink-500" />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Segmento de atuação</span>
              <div className="relative">
                <BarChart3 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <input id="radar-segment-input" value={segmento} onChange={(event) => setSegmento(event.target.value)} placeholder="Ex.: Autoescola" className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-pink-500" />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Cidade ou região</span>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <input id="radar-city-input" value={cidade} onChange={(event) => setCidade(event.target.value)} placeholder="Ex.: Angra dos Reis – RJ" className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-pink-500" />
              </div>
            </label>

            {error && (
              <div className="md:col-span-3 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div className="md:col-span-3 mt-2 flex justify-end">
              <button id="btn-radar-submit" type="submit" disabled={loading || !canSubmit} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 text-sm font-black text-white transition hover:bg-pink-500 disabled:bg-slate-800 disabled:text-slate-500 md:w-auto">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? "Gerando análise estratégica..." : "Gerar radar estratégico"}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10">
            <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
          </div>
          <h2 className="mt-5 text-lg font-black text-white">Construindo seu radar</h2>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500">A IA está organizando padrões de mercado, hipóteses competitivas, oportunidades e ações de validação local.</p>
        </section>
      )}

      {!loading && analysisText && (
        <motion.section id="radar-results-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-pink-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">Análise concluída</span>
              </div>
              <h2 className="mt-2 text-xl font-black text-white">Radar estratégico de {empresa}</h2>
              <p className="mt-1 text-xs text-slate-500">{segmento} · {cidade}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyReport} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-pink-500 hover:text-white">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <ClipboardCopy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
              <button type="button" onClick={downloadReport} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-pink-500 hover:text-white">
                <Download className="h-4 w-4" /> Baixar
              </button>
              <button type="button" onClick={resetAnalysis} className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-pink-500">
                <RefreshCw className="h-4 w-4" /> Nova análise
              </button>
            </div>
          </div>

          <div className="mt-7 space-y-4 text-sm leading-relaxed text-slate-300">
            {analysisText.split("\n").map((line, index) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={index} className="h-1" />;
              if (trimmed.startsWith("### ")) return <h4 key={index} className="pt-3 text-sm font-black uppercase tracking-wider text-pink-400">{renderInline(trimmed.slice(4))}</h4>;
              if (trimmed.startsWith("## ")) return <h3 key={index} className="mt-6 border-b border-slate-800 pb-2 text-lg font-black text-white">{renderInline(trimmed.slice(3))}</h3>;
              if (trimmed.startsWith("# ")) return <h2 key={index} className="mt-5 text-xl font-black text-white">{renderInline(trimmed.slice(2))}</h2>;
              if (/^\d+\.\s/.test(trimmed)) return <div key={index} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-[10px] font-black text-pink-400">{trimmed.match(/^\d+/)?.[0]}</span><p>{renderInline(trimmed.replace(/^\d+\.\s*/, ""))}</p></div>;
              if (trimmed.startsWith("- ")) return <div key={index} className="flex items-start gap-3 pl-1"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400" /><p>{renderInline(trimmed.slice(2))}</p></div>;
              return <p key={index}>{renderInline(trimmed)}</p>;
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-slate-400">
            <strong className="text-amber-300">Importante:</strong> esta análise é estratégica e orientativa. Ela não afirma ter consultado automaticamente empresas reais. Use o checklist do relatório para validar concorrentes, preços, avaliações e canais na sua região.
          </div>
        </motion.section>
      )}
    </div>
  );
};
