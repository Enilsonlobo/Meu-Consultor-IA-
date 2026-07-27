import React, { useEffect, useMemo, useState } from "react";
import { Download, History, Image as ImageIcon, Loader2, RotateCcw, Sparkles, WandSparkles } from "lucide-react";
import type { UserProfile } from "../types";

interface PostDesignStudioProps {
  profile: UserProfile;
}

type ArtFormat = "feed" | "story" | "reels" | "landscape";
type ArtQuality = "medium" | "high";

interface UsageData {
  used: number;
  remaining: number;
  limit: number;
  admin?: boolean;
}

interface HistoryItem {
  id: string;
  prompt: string;
  format: ArtFormat;
  quality: ArtQuality;
  createdAt: string;
}

const FORMAT_OPTIONS: Array<{ value: ArtFormat; label: string; description: string }> = [
  { value: "feed", label: "Feed quadrado", description: "Instagram e Facebook — 1:1" },
  { value: "story", label: "Stories", description: "Instagram e Facebook — vertical" },
  { value: "reels", label: "Capa de Reels", description: "Formato vertical para vídeos" },
  { value: "landscape", label: "Banner horizontal", description: "Anúncios, sites e apresentações" },
];

export const PostDesignStudio: React.FC<PostDesignStudioProps> = ({ profile }) => {
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<ArtFormat>("feed");
  const [quality, setQuality] = useState<ArtQuality>("medium");
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [usage, setUsage] = useState<UsageData>({ used: 0, remaining: 8, limit: 8 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => Math.min(100, (usage.used / usage.limit) * 100), [usage]);

  useEffect(() => {
    void Promise.all([loadUsage(), loadHistory()]);
  }, []);

  async function loadUsage() {
    setIsLoadingUsage(true);
    try {
      const response = await fetch("/api/art-usage", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível consultar o limite diário.");
      setUsage(data);
    } catch (err: any) {
      setError(err.message || "Não foi possível consultar o limite diário.");
    } finally {
      setIsLoadingUsage(false);
    }
  }

  async function loadHistory() {
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/art-history", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar o histórico.");
      setHistory(data.items || []);
    } catch (err: any) {
      console.warn(err.message || "Não foi possível carregar o histórico.");
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function improvePrompt() {
    setError(null);
    if (prompt.trim().length < 5) {
      setError("Escreva uma ideia inicial para o Diretor Criativo aprimorar.");
      return;
    }
    setIsImproving(true);
    try {
      const response = await fetch("/api/improve-art-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), format, profile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível aprimorar o briefing.");
      setPrompt(data.prompt || prompt);
    } catch (err: any) {
      setError(err.message || "Não foi possível aprimorar o briefing.");
    } finally {
      setIsImproving(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    if (prompt.trim().length < 12) {
      setError("Descreva melhor a arte que deseja criar.");
      return;
    }
    if (!usage.admin && usage.remaining <= 0) {
      setError("Você atingiu o limite diário de 8 criações. O acesso será renovado amanhã.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), format, quality, profile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível criar a arte.");
      setImage(data.image);
      setUsage({ used: data.used, remaining: data.remaining, limit: data.limit, admin: data.admin });
      await loadHistory();
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao criar a arte profissional.");
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadImage() {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = `arte-${profile.empresa || "meu-consultor-ia"}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function startNewArt() {
    setImage(null);
    setPrompt("");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reuseHistory(item: HistoryItem) {
    setPrompt(item.prompt);
    setFormat(item.format);
    setQuality(item.quality);
    setImage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-8 space-y-7">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.18em]">
            <WandSparkles className="w-3.5 h-3.5" /> Diretor Criativo IA
          </div>
          <h1 className="mt-4 text-2xl md:text-3xl font-black text-white tracking-tight">Criação de Artes Profissionais</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
            Escreva uma ideia simples, aprimore o briefing com IA e gere uma única arte final pronta para divulgação.
          </p>
        </div>

        <div className="w-full xl:w-80 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Limite diário</span>
            <span className="text-indigo-300">
              {usage.admin ? "Administrador" : isLoadingUsage ? "Consultando..." : `${usage.used} de ${usage.limit} utilizadas`}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${usage.admin ? 0 : progress}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {usage.admin ? "Sua conta administrativa não possui bloqueio diário." : `${usage.remaining} criações disponíveis hoje.`}
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6 space-y-5 shadow-2xl">
          <div>
            <label htmlFor="art-prompt" className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2">
              Descreva sua arte
            </label>
            <textarea
              id="art-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={9}
              maxLength={1800}
              placeholder="Exemplo: Quero divulgar matrículas abertas para categoria B, com uma mulher feliz, carro moderno e cores azul e dourado."
              className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition-colors leading-relaxed"
            />
            <div className="mt-2 flex justify-between text-[10px] text-slate-600 font-semibold">
              <span>Você pode escrever apenas a ideia. A IA organiza o briefing.</span>
              <span>{prompt.length}/1800</span>
            </div>
          </div>

          <button
            type="button"
            onClick={improvePrompt}
            disabled={isImproving || isGenerating}
            className="w-full min-h-11 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15 disabled:opacity-50 text-indigo-200 text-xs font-black flex items-center justify-center gap-2 transition-all"
          >
            {isImproving ? <><Loader2 className="w-4 h-4 animate-spin" /> Aprimorando briefing...</> : <><WandSparkles className="w-4 h-4" /> Aprimorar com Diretor Criativo</>}
          </button>

          <div>
            <p className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3">Formato</p>
            <div className="grid grid-cols-2 gap-2.5">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  className={`text-left rounded-xl border p-3 transition-all ${format === option.value ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}
                >
                  <span className={`block text-xs font-bold ${format === option.value ? "text-indigo-300" : "text-slate-200"}`}>{option.label}</span>
                  <span className="block text-[10px] text-slate-500 mt-1 leading-snug">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3">Qualidade</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setQuality("medium")} className={`rounded-xl border p-3 text-left ${quality === "medium" ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900"}`}>
                <span className="block text-xs font-bold text-slate-200">Profissional</span>
                <span className="block text-[10px] text-slate-500 mt-1">Boa qualidade e geração mais rápida</span>
              </button>
              <button type="button" onClick={() => setQuality("high")} className={`rounded-xl border p-3 text-left ${quality === "high" ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900"}`}>
                <span className="block text-xs font-bold text-slate-200">Alta definição</span>
                <span className="block text-[10px] text-slate-500 mt-1">Mais detalhes e acabamento</span>
              </button>
            </div>
          </div>

          {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300 leading-relaxed">{error}</div>}

          <button
            id="btn-generate-professional-art"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || isImproving || (!usage.admin && usage.remaining <= 0)}
            className="w-full min-h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/15"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando sua arte...</> : <><Sparkles className="w-4 h-4" /> Criar arte profissional</>}
          </button>
        </section>

        <section className="min-h-[620px] rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6 flex flex-col shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm font-black text-white">Resultado</h2>
              <p className="text-[11px] text-slate-500 mt-1">Uma única arte final, pronta para divulgação.</p>
            </div>
            {image && (
              <div className="flex gap-2">
                <button type="button" onClick={startNewArt} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-slate-500 transition-colors">
                  <RotateCcw className="w-4 h-4" /> Nova arte
                </button>
                <button type="button" onClick={downloadImage} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-indigo-500 hover:text-white transition-colors">
                  <Download className="w-4 h-4" /> Baixar PNG
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 flex items-center justify-center overflow-hidden min-h-[500px]">
            {isGenerating ? (
              <div className="text-center px-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <h3 className="mt-5 text-base font-black text-white">Produzindo sua arte</h3>
                <p className="mt-2 text-xs text-slate-500 max-w-sm leading-relaxed">A inteligência artificial está interpretando seu briefing e criando a peça final. Isso pode levar alguns segundos.</p>
              </div>
            ) : image ? (
              <img src={image} alt="Arte profissional criada por inteligência artificial" className="max-w-full max-h-[760px] object-contain" />
            ) : (
              <div className="text-center px-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="mt-5 text-base font-black text-slate-300">Sua arte aparecerá aqui</h3>
                <p className="mt-2 text-xs text-slate-600 max-w-sm leading-relaxed">Preencha o briefing ao lado e clique em “Criar arte profissional”. Não utilizamos modelos prontos.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <History className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Briefings recentes</h2>
            <p className="text-[11px] text-slate-500 mt-1">Reaproveite uma ideia anterior sem gerar versões automáticas.</p>
          </div>
        </div>

        {isLoadingHistory ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Carregando histórico...</div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 py-10 text-center text-xs text-slate-600">As últimas criações aparecerão aqui.</div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {history.map((item) => (
              <button key={item.id} type="button" onClick={() => reuseHistory(item)} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">{FORMAT_OPTIONS.find((option) => option.value === item.format)?.label || item.format}</span>
                  <span className="text-[10px] text-slate-600">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : ""}</span>
                </div>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed line-clamp-3">{item.prompt}</p>
                <span className="mt-4 block text-[10px] font-bold text-slate-500">Clique para reutilizar o briefing</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
