import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  History,
  Image as ImageIcon,
  Instagram,
  Loader2,
  Megaphone,
  RotateCcw,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import type { UserProfile } from "../types";

interface PostDesignStudioProps {
  profile: UserProfile;
}

type ArtFormat = "feed" | "story" | "reels" | "landscape";
type ArtQuality = "medium" | "high";
type CampaignGoal = "vendas" | "leads" | "engajamento" | "autoridade" | "evento";
type VisualStyle = "moderno" | "premium" | "emocional" | "urgente" | "minimalista";

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

const GOALS: Array<{ value: CampaignGoal; label: string; description: string }> = [
  { value: "vendas", label: "Vender mais", description: "Campanha direta para gerar compras ou matrículas." },
  { value: "leads", label: "Captar contatos", description: "Atrair pessoas para WhatsApp, formulário ou direct." },
  { value: "engajamento", label: "Gerar engajamento", description: "Aumentar comentários, compartilhamentos e alcance." },
  { value: "autoridade", label: "Criar autoridade", description: "Fortalecer confiança e percepção profissional." },
  { value: "evento", label: "Divulgar oferta ou evento", description: "Promover data especial, lançamento ou condição limitada." },
];

const STYLES: Array<{ value: VisualStyle; label: string }> = [
  { value: "moderno", label: "Moderno" },
  { value: "premium", label: "Premium" },
  { value: "emocional", label: "Emocional" },
  { value: "urgente", label: "Urgência" },
  { value: "minimalista", label: "Minimalista" },
];

export const PostDesignStudio: React.FC<PostDesignStudioProps> = ({ profile }) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<CampaignGoal>("vendas");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [cta, setCta] = useState("Chame no WhatsApp");
  const [style, setStyle] = useState<VisualStyle>("moderno");
  const [brandColors, setBrandColors] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
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
  const [copied, setCopied] = useState<string | null>(null);

  const progress = useMemo(() => Math.min(100, (usage.used / usage.limit) * 100), [usage]);

  const prompt = useMemo(() => {
    const goalLabel = GOALS.find((item) => item.value === goal)?.label || goal;
    const formatLabel = FORMAT_OPTIONS.find((item) => item.value === format)?.label || format;
    return [
      `Crie uma campanha visual profissional para ${profile.empresa || "a empresa"}, do segmento ${profile.segmento || "informado"}.`,
      `Objetivo: ${goalLabel}.`,
      `Campanha/oferta: ${offer || "não informada"}.`,
      `Público-alvo: ${audience || "não informado"}.`,
      `Nome da campanha: ${campaignName || "crie um título forte"}.`,
      `Formato: ${formatLabel}.`,
      `Estilo visual: ${style}.`,
      `Cores da marca: ${brandColors || "usar paleta profissional coerente com o segmento"}.`,
      `CTA principal: ${cta || "crie um CTA direto"}.`,
      `Cidade: ${profile.cidade || "não informada"}.`,
      extraDetails ? `Detalhes adicionais: ${extraDetails}.` : "",
      "A arte deve ter hierarquia visual clara, texto curto, leitura fácil no celular e acabamento publicitário profissional. Não inserir textos longos nem elementos confusos.",
    ].filter(Boolean).join("\n");
  }, [audience, brandColors, campaignName, cta, extraDetails, format, goal, offer, profile, style]);

  const generatedCopy = useMemo(() => {
    const title = campaignName || offer || "Uma oportunidade feita para você";
    const goalText: Record<CampaignGoal, string> = {
      vendas: "Aproveite esta condição especial e dê o próximo passo hoje.",
      leads: "Fale com nossa equipe e receba todas as informações sem compromisso.",
      engajamento: "Conte para nós o que você acha e compartilhe com alguém que precisa ver isso.",
      autoridade: "Experiência, confiança e estratégia para entregar um resultado melhor.",
      evento: "Uma oportunidade com data marcada e vagas limitadas.",
    };
    const hashtags = [
      profile.empresa ? `#${profile.empresa.replace(/\s+/g, "")}` : "#MeuNegocio",
      profile.cidade ? `#${profile.cidade.replace(/\s+/g, "")}` : "#NegocioLocal",
      profile.segmento ? `#${profile.segmento.replace(/\s+/g, "")}` : "#Empreendedorismo",
      "#OfertaEspecial",
      "#ChameNoWhatsApp",
    ].join(" ");
    return {
      title,
      caption: `${title}\n\n${goalText[goal]}\n\n${offer ? `${offer}\n\n` : ""}${cta}.`,
      hashtags,
      bestTime: goal === "vendas" || goal === "leads" ? "Entre 11h30 e 13h ou entre 18h e 20h" : "Entre 18h e 21h",
    };
  }, [campaignName, cta, goal, offer, profile]);

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

  async function improveBriefing() {
    setError(null);
    if (offer.trim().length < 5) {
      setError("Descreva a oferta ou ideia principal da campanha.");
      setStep(1);
      return;
    }
    setIsImproving(true);
    try {
      const response = await fetch("/api/improve-art-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, format, profile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível aprimorar o briefing.");
      setExtraDetails(data.prompt || extraDetails);
    } catch (err: any) {
      setError(err.message || "Não foi possível aprimorar o briefing.");
    } finally {
      setIsImproving(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    if (offer.trim().length < 5 || audience.trim().length < 3) {
      setError("Preencha a oferta e o público-alvo antes de gerar a campanha.");
      setStep(1);
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
        body: JSON.stringify({ prompt, format, quality, profile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível criar a campanha.");
      setImage(data.image);
      setUsage({ used: data.used, remaining: data.remaining, limit: data.limit, admin: data.admin });
      setStep(4);
      await loadHistory();
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao criar a campanha.");
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadImage() {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = `campanha-${profile.empresa || "meu-consultor-ia"}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function resetCampaign() {
    setStep(1);
    setOffer("");
    setAudience("");
    setCampaignName("");
    setCta("Chame no WhatsApp");
    setExtraDetails("");
    setImage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reuseHistory(item: HistoryItem) {
    setExtraDetails(item.prompt);
    setFormat(item.format);
    setQuality(item.quality);
    setImage(null);
    setStep(3);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1800);
  }

  const canAdvanceStep1 = offer.trim().length >= 5 && audience.trim().length >= 3;

  return (
    <div className="max-w-7xl mx-auto p-5 md:p-8 space-y-7">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.18em]">
            <Megaphone className="w-3.5 h-3.5" /> Marketing Studio 2.0
          </div>
          <h1 className="mt-4 text-2xl md:text-4xl font-black text-white tracking-tight">Crie uma campanha completa em poucos passos</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-3xl leading-relaxed">
            Defina objetivo, público e estilo. A plataforma prepara o briefing, gera o criativo e entrega legenda, CTA, hashtags e horário sugerido.
          </p>
        </div>

        <div className="w-full xl:w-80 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Limite diário</span>
            <span className="text-indigo-300">{usage.admin ? "Administrador" : isLoadingUsage ? "Consultando..." : `${usage.used} de ${usage.limit} utilizadas`}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${usage.admin ? 0 : progress}%` }} /></div>
          <p className="mt-2 text-[11px] text-slate-500">{usage.admin ? "Sua conta administrativa não possui bloqueio diário." : `${usage.remaining} criações disponíveis hoje.`}</p>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 md:p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Estratégia", "Formato e estilo", "Revisão", "Campanha pronta"].map((label, index) => {
            const number = index + 1;
            const active = step === number;
            const done = step > number;
            return (
              <div key={label} className={`rounded-2xl border p-3 ${active ? "border-indigo-500 bg-indigo-500/10" : done ? "border-emerald-500/20 bg-emerald-500/5" : "border-slate-800 bg-slate-900/50"}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${active ? "bg-indigo-600 text-white" : done ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>{done ? <Check className="h-4 w-4" /> : number}</span>
                  <span className={`text-xs font-black ${active ? "text-white" : done ? "text-emerald-300" : "text-slate-500"}`}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">{error}</div>}

      {step === 1 && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-7 space-y-6">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Passo 1</p><h2 className="mt-2 text-xl font-black text-white">Qual é o objetivo da campanha?</h2></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3">
            {GOALS.map((item) => <button type="button" key={item.value} onClick={() => setGoal(item.value)} className={`rounded-2xl border p-4 text-left transition ${goal === item.value ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}><Target className={`h-5 w-5 ${goal === item.value ? "text-indigo-400" : "text-slate-600"}`} /><span className="mt-4 block text-xs font-black text-white">{item.label}</span><span className="mt-2 block text-[10px] leading-relaxed text-slate-500">{item.description}</span></button>)}
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block"><span className="block text-xs font-black text-slate-300 mb-2">O que você deseja divulgar?</span><textarea value={offer} onChange={(e) => setOffer(e.target.value)} rows={5} placeholder="Ex.: Matrículas abertas para categoria B com condição especial até sexta-feira." className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
            <label className="block"><span className="block text-xs font-black text-slate-300 mb-2">Quem é o público-alvo?</span><textarea value={audience} onChange={(e) => setAudience(e.target.value)} rows={5} placeholder="Ex.: Jovens de 18 a 30 anos de Angra dos Reis que querem tirar a primeira habilitação." className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block"><span className="block text-xs font-black text-slate-300 mb-2">Nome da campanha</span><input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Ex.: Sua liberdade começa agora" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
            <label className="block"><span className="block text-xs font-black text-slate-300 mb-2">Chamada para ação</span><input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Ex.: Chame no WhatsApp" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
          </div>
          <div className="flex justify-end"><button type="button" disabled={!canAdvanceStep1} onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-black text-white disabled:bg-slate-800 disabled:text-slate-500">Continuar <ArrowRight className="h-4 w-4" /></button></div>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-7 space-y-6">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Passo 2</p><h2 className="mt-2 text-xl font-black text-white">Escolha o formato e o estilo visual</h2></div>
          <div><p className="mb-3 text-xs font-black text-slate-300">Formato</p><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{FORMAT_OPTIONS.map((item) => <button key={item.value} type="button" onClick={() => setFormat(item.value)} className={`rounded-2xl border p-4 text-left ${format === item.value ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900"}`}><ImageIcon className={`h-5 w-5 ${format === item.value ? "text-indigo-400" : "text-slate-600"}`} /><span className="mt-3 block text-xs font-black text-white">{item.label}</span><span className="mt-1 block text-[10px] text-slate-500">{item.description}</span></button>)}</div></div>
          <div><p className="mb-3 text-xs font-black text-slate-300">Estilo visual</p><div className="flex flex-wrap gap-2">{STYLES.map((item) => <button key={item.value} type="button" onClick={() => setStyle(item.value)} className={`rounded-xl border px-4 py-2.5 text-xs font-black ${style === item.value ? "border-indigo-500 bg-indigo-500/10 text-indigo-300" : "border-slate-800 bg-slate-900 text-slate-400"}`}>{item.label}</button>)}</div></div>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="block"><span className="block text-xs font-black text-slate-300 mb-2">Cores da marca</span><input value={brandColors} onChange={(e) => setBrandColors(e.target.value)} placeholder="Ex.: azul, branco e amarelo" className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
            <div><span className="block text-xs font-black text-slate-300 mb-2">Qualidade da imagem</span><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setQuality("medium")} className={`rounded-xl border p-3 text-left ${quality === "medium" ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900"}`}><span className="block text-xs font-black text-white">Profissional</span><span className="mt-1 block text-[10px] text-slate-500">Mais rápida</span></button><button type="button" onClick={() => setQuality("high")} className={`rounded-xl border p-3 text-left ${quality === "high" ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900"}`}><span className="block text-xs font-black text-white">Alta definição</span><span className="mt-1 block text-[10px] text-slate-500">Mais detalhes</span></button></div></div>
          </div>
          <label className="block"><span className="block text-xs font-black text-slate-300 mb-2">Detalhes adicionais</span><textarea value={extraDetails} onChange={(e) => setExtraDetails(e.target.value)} rows={5} placeholder="Ex.: usar uma pessoa sorrindo, destacar prazo, evitar excesso de texto..." className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" /></label>
          <div className="flex flex-col sm:flex-row justify-between gap-3"><button type="button" onClick={() => setStep(1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-black text-slate-300"><ArrowLeft className="h-4 w-4" /> Voltar</button><div className="flex flex-col sm:flex-row gap-3"><button type="button" onClick={improveBriefing} disabled={isImproving} className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-3 text-xs font-black text-indigo-300">{isImproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />} Aprimorar com IA</button><button type="button" onClick={() => setStep(3)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-black text-white">Revisar campanha <ArrowRight className="h-4 w-4" /></button></div></div>
        </section>
      )}

      {step === 3 && (
        <section className="grid xl:grid-cols-[1fr_0.8fr] gap-6 items-start">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-5"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Passo 3</p><h2 className="mt-2 text-xl font-black text-white">Revise antes de gerar</h2></div><div className="space-y-3 text-xs"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><span className="text-slate-500">Objetivo</span><p className="mt-1 font-black text-white">{GOALS.find((g) => g.value === goal)?.label}</p></div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><span className="text-slate-500">Oferta</span><p className="mt-1 font-black text-white">{offer}</p></div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><span className="text-slate-500">Público</span><p className="mt-1 font-black text-white">{audience}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><span className="text-slate-500">Formato</span><p className="mt-1 font-black text-white">{FORMAT_OPTIONS.find((f) => f.value === format)?.label}</p></div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><span className="text-slate-500">Estilo</span><p className="mt-1 font-black text-white capitalize">{style}</p></div></div></div><button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-xs font-black text-indigo-400"><ArrowLeft className="h-4 w-4" /> Editar informações</button></div>
          <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6"><Sparkles className="h-7 w-7 text-indigo-400" /><h3 className="mt-5 text-lg font-black text-white">Sua campanha está pronta para ser criada</h3><p className="mt-3 text-xs leading-relaxed text-slate-400">A IA usará todas as informações escolhidas para criar um criativo coerente com seu objetivo, público e identidade visual.</p><button id="btn-generate-professional-art" type="button" onClick={handleGenerate} disabled={isGenerating || (!usage.admin && usage.remaining <= 0)} className="mt-6 w-full min-h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-black flex items-center justify-center gap-2">{isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando campanha...</> : <><Sparkles className="w-4 h-4" /> Gerar campanha completa</>}</button></div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-6">
          <div className="grid xl:grid-cols-[1fr_0.9fr] gap-6 items-start">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6"><div className="flex items-center justify-between gap-3 mb-5"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Campanha pronta</p><h2 className="mt-2 text-lg font-black text-white">Criativo gerado</h2></div><button type="button" onClick={resetCampaign} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-black text-slate-300"><RotateCcw className="h-4 w-4" /> Nova campanha</button></div>{image ? <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900"><img src={image} alt="Campanha gerada" className="w-full h-auto object-contain" /></div> : <div className="min-h-[420px] flex items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/50"><ImageIcon className="h-10 w-10 text-slate-700" /></div>}{image && <button type="button" onClick={downloadImage} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black text-slate-950"><Download className="h-4 w-4" /> Baixar criativo</button>}</div>
            <div className="space-y-4"><div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Texto principal</p><h3 className="mt-2 text-base font-black text-white">Legenda pronta</h3></div><button type="button" onClick={() => copyText("caption", generatedCopy.caption)} className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400">{copied === "caption" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}</button></div><p className="mt-4 whitespace-pre-line text-xs leading-relaxed text-slate-400">{generatedCopy.caption}</p></div><div className="rounded-3xl border border-slate-800 bg-slate-950 p-5"><div className="flex items-center justify-between"><h3 className="text-sm font-black text-white">Hashtags sugeridas</h3><button type="button" onClick={() => copyText("hashtags", generatedCopy.hashtags)} className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400">{copied === "hashtags" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}</button></div><p className="mt-3 text-xs leading-relaxed text-indigo-300">{generatedCopy.hashtags}</p></div><div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5"><div className="flex items-start gap-3"><Instagram className="mt-0.5 h-5 w-5 text-amber-400" /><div><h3 className="text-sm font-black text-white">Melhor horário sugerido</h3><p className="mt-2 text-xs text-slate-400">{generatedCopy.bestTime}</p><p className="mt-2 text-[10px] text-slate-600">Use como ponto de partida e compare com os horários de maior atividade do seu perfil.</p></div></div></div></div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6">
        <div className="flex items-center gap-3"><History className="h-5 w-5 text-indigo-400" /><div><h2 className="text-sm font-black text-white">Campanhas anteriores</h2><p className="mt-1 text-[10px] text-slate-500">Reaproveite ideias e briefings já utilizados.</p></div></div>
        <div className="mt-5 grid md:grid-cols-2 xl:grid-cols-3 gap-3">{isLoadingHistory ? <div className="col-span-full py-8 text-center text-xs text-slate-500">Carregando histórico...</div> : history.length === 0 ? <div className="col-span-full py-8 text-center text-xs text-slate-500">Nenhuma campanha criada ainda.</div> : history.slice(0, 6).map((item) => <button type="button" key={item.id} onClick={() => reuseHistory(item)} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-indigo-500/40"><span className="block text-xs font-black text-white line-clamp-2">{item.prompt}</span><span className="mt-3 block text-[10px] text-slate-600">{item.createdAt} • {item.format}</span></button>)}</div>
      </section>
    </div>
  );
};