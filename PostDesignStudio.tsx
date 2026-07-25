/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { UserProfile } from "../types";
import { 
  Sparkles, 
  Download, 
  Palette, 
  Type, 
  Sliders, 
  Copy, 
  Check, 
  RefreshCw, 
  Image as ImageIcon,
  Layers,
  ChevronRight,
  Send,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trophy,
  Target,
  TrendingUp,
  Bookmark,
  Share2,
  AlertCircle
} from "lucide-react";

interface PostDesignStudioProps {
  profile: UserProfile;
}

type StylePreset = 'Sleek Obsidian' | 'Minimalist Marble' | 'Royal Emerald' | 'Deep Sapphire' | 'Warm Terracotta';
type BgDecoration = 'none' | 'grid' | 'circles' | 'glow';
type TextAlignment = 'left' | 'center' | 'right';
type TextVerticalPosition = 'top' | 'center' | 'bottom';
type FontStyleOption = 'Modern Serif' | 'Bold Tech' | 'Elegant Sans';
type SelectedIconOption = 'None' | 'Sparkles' | 'Trophy' | 'Target' | 'TrendingUp' | 'Bookmark';

interface GeneratedPostContent {
  headline: string;
  subheadline: string;
  cta: string;
  caption: string;
  suggestedStyle: StylePreset;
}

export const PostDesignStudio: React.FC<PostDesignStudioProps> = ({ profile }) => {
  // Post setup states
  const [topic, setTopic] = useState<string>("");
  const [tone, setTone] = useState<string>("Luxuoso/Elegante");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedHeadline, setCopiedHeadline] = useState<boolean>(false);
  const [copiedCta, setCopiedCta] = useState<boolean>(false);

  // Daily art generation limits
  const [generationsLeft, setGenerationsLeft] = useState<number>(3);
  const [generationLimitError, setGenerationLimitError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toLocaleDateString('pt-BR');
    const storedData = localStorage.getItem("mci_daily_art_generations");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === today) {
          setGenerationsLeft(Math.max(0, 3 - parsed.count));
        } else {
          setGenerationsLeft(3);
        }
      } catch (e) {
        setGenerationsLeft(3);
      }
    } else {
      setGenerationsLeft(3);
    }
  }, []);

  // Design Studio Editor Canvas states
  const [headline, setHeadline] = useState<string>("O Segredo do Sucesso");
  const [subheadline, setSubheadline] = useState<string>("Como estruturar processos sólidos para faturar até 5x mais sem depender de você.");
  const [cta, setCta] = useState<string>("Leia a legenda completa");
  const [caption, setCaption] = useState<string>("Seja bem-vindo ao novo patamar da sua marca. ✨\n\nNesta semana, nosso foco está totalmente voltado para a estruturação de metodologias que destravam gargalos ocultos no seu negócio. Faturar mais não deve significar trabalhar mais, e sim trabalhar de forma inteligente.\n\nPreparamos um guia definitivo em nosso perfil para você aplicar ainda hoje. Acesse o link na nossa bio.\n\n#Sucesso #Negocios #Premium #Estrategia");
  const [brandName, setBrandName] = useState<string>(profile.empresa || "MINHA EMPRESA");
  
  // Customization presets
  const [activeStyle, setActiveStyle] = useState<StylePreset>("Sleek Obsidian");
  const [bgDecoration, setBgDecoration] = useState<BgDecoration>("glow");
  const [textAlign, setTextAlign] = useState<TextAlignment>("center");
  const [textPosition, setTextPosition] = useState<TextVerticalPosition>("center");
  const [fontPairing, setFontPairing] = useState<FontStyleOption>("Modern Serif");
  const [textScale, setTextScale] = useState<number>(100);
  const [selectedIcon, setSelectedIcon] = useState<SelectedIconOption>("Sparkles");
  const [borderThickness, setBorderThickness] = useState<number>(2); // 0 to 4 px equivalency on canvas

  // Quick suggestion ideas matching the segment
  const getPreFilledTopics = (segment: string) => {
    const lowSegment = segment.toLowerCase();
    if (lowSegment.includes("alimento") || lowSegment.includes("restaurante") || lowSegment.includes("doce") || lowSegment.includes("gourmet")) {
      return [
        "A experiência gourmet incomparável que criamos para você",
        "Por trás dos bastidores: Nossa busca implacável por ingredientes nobres",
        "3 segredos culinários que você só encontra aqui",
        "Reserva Exclusiva: Garanta sua mesa para o final de semana"
      ];
    }
    if (lowSegment.includes("estetica") || lowSegment.includes("beleza") || lowSegment.includes("clinica") || lowSegment.includes("salao")) {
      return [
        "A arte do autocuidado: Invista no seu maior ativo",
        "O protocolo exclusivo de rejuvenescimento e bem-estar",
        "Segredos de beleza que as marcas de luxo não te contam",
        "Agende seu momento exclusivo de renovação"
      ];
    }
    if (lowSegment.includes("consultoria") || lowSegment.includes("advogado") || lowSegment.includes("servico") || lowSegment.includes("contab")) {
      return [
        "Como blindar o patrimônio da sua empresa estrategicamente",
        "O erro silencioso que drena 30% do lucro de negócios locais",
        "Metodologia CRESCER: O pilar que falta na sua gestão",
        "Fale com nossa banca de especialistas e mude seu patamar"
      ];
    }
    // Default upscale generic topics
    return [
      "Os 3 erros estratégicos que impedem seu crescimento comercial",
      "Posicionamento Premium: Como cobrar mais caro com orgulho",
      "O poder de uma experiência impecável para fidelizar clientes",
      "Inovação Silenciosa: O segredo dos líderes de mercado"
    ];
  };

  const topicsList = getPreFilledTopics(profile.segmento);

  useEffect(() => {
    if (topicsList.length > 0 && !topic) {
      setTopic(topicsList[0]);
    }
  }, [profile.segmento]);

  // Request high-end post structure from the AI
  const handleGeneratePost = async () => {
    setGenerationLimitError(null);
    const today = new Date().toLocaleDateString('pt-BR');
    let currentCount = 0;
    const storedData = localStorage.getItem("mci_daily_art_generations");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === today) {
          currentCount = parsed.count;
        }
      } catch (e) {}
    }

    if (currentCount >= 3) {
      setGenerationLimitError("Você atingiu o seu limite diário de 3 criações de artes por acesso. Retorne amanhã ou fale com o suporte para expandir sua cota corporativa.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/post-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          topic: topic,
          tone: tone
        })
      });

      if (res.ok) {
        const data: GeneratedPostContent = await res.json();
        setHeadline(data.headline);
        setSubheadline(data.subheadline);
        setCta(data.cta);
        setCaption(data.caption);
        setActiveStyle(data.suggestedStyle);

        // Increment and save limit count
        const newCount = currentCount + 1;
        localStorage.setItem("mci_daily_art_generations", JSON.stringify({ date: today, count: newCount }));
        setGenerationsLeft(Math.max(0, 3 - newCount));
      } else {
        const errData = await res.json().catch(() => ({}));
        setGenerationLimitError(errData.error || "Ocorreu uma falha no servidor ao gerar a arte. Por favor, tente novamente.");
      }
    } catch (e: any) {
      console.error("Erro ao processar postagem premium:", e);
      setGenerationLimitError("Não foi possível conectar ao servidor de inteligência artificial. Verifique sua conexão de rede.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Preset styles color definitions
  const getStyleSettings = (style: StylePreset) => {
    switch (style) {
      case 'Sleek Obsidian':
        return {
          bg: "from-slate-950 via-slate-900 to-slate-950",
          bgRawGradient: ["#020617", "#0f172a", "#020617"],
          border: "border-amber-500/20",
          borderRaw: "#d4af37", // Gold accent
          textPrimary: "text-slate-100",
          textPrimaryRaw: "#f8fafc",
          textAccent: "text-amber-400",
          textAccentRaw: "#fbbf24",
          textMuted: "text-slate-400",
          textMutedRaw: "#94a3b8",
          fontFamily: "font-serif",
          fontFamilyRaw: "Georgia, 'Times New Roman', serif"
        };
      case 'Minimalist Marble':
        return {
          bg: "from-stone-50 via-stone-100 to-stone-50",
          bgRawGradient: ["#fafaf9", "#f5f5f4", "#fafaf9"],
          border: "border-stone-300",
          borderRaw: "#78716c", // Warm grey accent
          textPrimary: "text-stone-900",
          textPrimaryRaw: "#1c1917",
          textAccent: "text-stone-700",
          textAccentRaw: "#44403c",
          textMuted: "text-stone-500",
          textMutedRaw: "#78716c",
          fontFamily: "font-serif",
          fontFamilyRaw: "Palatino, 'Book Antiqua', Georgia, serif"
        };
      case 'Royal Emerald':
        return {
          bg: "from-emerald-950 via-emerald-900 to-emerald-950",
          bgRawGradient: ["#022c22", "#064e3b", "#022c22"],
          border: "border-yellow-500/20",
          borderRaw: "#eab308", // Golden yellow
          textPrimary: "text-emerald-50",
          textPrimaryRaw: "#ecfdf5",
          textAccent: "text-yellow-400",
          textAccentRaw: "#facc15",
          textMuted: "text-emerald-300/80",
          textMutedRaw: "#a7f3d0",
          fontFamily: "font-sans tracking-tight",
          fontFamilyRaw: "'Helvetica Neue', Arial, sans-serif"
        };
      case 'Deep Sapphire':
        return {
          bg: "from-blue-950 via-slate-900 to-blue-950",
          bgRawGradient: ["#03071e", "#0a192f", "#03071e"],
          border: "border-indigo-400/30",
          borderRaw: "#38bdf8", // Sky blue accent
          textPrimary: "text-slate-50",
          textPrimaryRaw: "#f8fafc",
          textAccent: "text-sky-400",
          textAccentRaw: "#38bdf8",
          textMuted: "text-slate-400",
          textMutedRaw: "#94a3b8",
          fontFamily: "font-mono",
          fontFamilyRaw: "'Courier New', Courier, monospace"
        };
      case 'Warm Terracotta':
        return {
          bg: "from-amber-900/10 via-amber-950/20 to-orange-950/20",
          bgRawGradient: ["#fdf8f5", "#f5e8e0", "#ebd4c6"], // Light modern warm terracotta
          border: "border-orange-800/30",
          borderRaw: "#854d0e",
          textPrimary: "text-stone-800",
          textPrimaryRaw: "#292524",
          textAccent: "text-orange-800",
          textAccentRaw: "#9a3412",
          textMuted: "text-stone-600",
          textMutedRaw: "#57534e",
          fontFamily: "font-sans font-medium",
          fontFamilyRaw: "ui-sans-serif, system-ui, sans-serif"
        };
    }
  };

  const activeStyles = getStyleSettings(activeStyle);

  // Trigger high-fidelity browser canvas render & direct file download
  const handleDownloadImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw elegant background
    const gradient = ctx.createRadialGradient(540, 540, 100, 540, 540, 700);
    const colors = activeStyles.bgRawGradient;
    gradient.addColorStop(0, colors[1]);
    gradient.addColorStop(0.5, colors[0]);
    gradient.addColorStop(1, colors.length > 2 ? colors[2] : colors[0]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Draw luxury decorations based on state
    if (bgDecoration === 'grid') {
      ctx.strokeStyle = activeStyle === 'Minimalist Marble' || activeStyle === 'Warm Terracotta' 
        ? "rgba(120, 113, 108, 0.08)" 
        : "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < 1080; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1080);
        ctx.stroke();
      }
      for (let y = 0; y < 1080; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1080, y);
        ctx.stroke();
      }
    } else if (bgDecoration === 'circles') {
      ctx.strokeStyle = activeStyle === 'Minimalist Marble' || activeStyle === 'Warm Terracotta'
        ? "rgba(120, 113, 108, 0.04)"
        : "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 2;
      for (let r = 200; r <= 800; r += 200) {
        ctx.beginPath();
        ctx.arc(540, 540, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (bgDecoration === 'glow') {
      const glowGrad = ctx.createRadialGradient(540, 540, 50, 540, 540, 500);
      glowGrad.addColorStop(0, activeStyle === 'Minimalist Marble' || activeStyle === 'Warm Terracotta' ? "rgba(230, 215, 200, 0.6)" : "rgba(99, 102, 241, 0.15)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1080, 1080);
    }

    // 3. Draw border frame
    if (borderThickness > 0) {
      ctx.strokeStyle = activeStyles.borderRaw;
      ctx.lineWidth = borderThickness * 3; // make it more visible at 1080x1080
      ctx.strokeRect(50, 50, 980, 980);
      
      // Luxury double frame corner highlights
      ctx.lineWidth = 1;
      ctx.strokeRect(62, 62, 956, 956);
    }

    // 4. Draw Brand Name header
    ctx.textAlign = "center";
    ctx.fillStyle = activeStyles.textMutedRaw;
    ctx.font = `bold 24px ${activeStyles.fontFamilyRaw === "font-mono" ? "monospace" : "sans-serif"}`;
    // Character tracking / spacing simulation
    const spacedBrand = brandName.toUpperCase().split("").join(" ");
    ctx.fillText(spacedBrand, 540, 140);

    // Small divider line below brand
    ctx.strokeStyle = activeStyles.borderRaw;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(490, 180);
    ctx.lineTo(590, 180);
    ctx.stroke();

    // 5. Draw Selected Icon
    if (selectedIcon !== 'None') {
      ctx.fillStyle = activeStyles.textAccentRaw;
      ctx.font = "42px Georgia";
      let iconSymbol = "✦";
      if (selectedIcon === "Trophy") iconSymbol = "🏆";
      else if (selectedIcon === "Target") iconSymbol = "🎯";
      else if (selectedIcon === "TrendingUp") iconSymbol = "📈";
      else if (selectedIcon === "Bookmark") iconSymbol = "🔖";
      
      ctx.fillText(iconSymbol, 540, 240);
    }

    // 6. Draw Headline (Title) with word wrapping
    ctx.textAlign = textAlign;
    const computedHeadlineColor = activeStyle === 'Minimalist Marble' || activeStyle === 'Warm Terracotta' ? activeStyles.textPrimaryRaw : "#ffffff";
    ctx.fillStyle = computedHeadlineColor;
    
    // Choose font family
    let headlineFont = "";
    if (fontPairing === "Modern Serif") {
      headlineFont = `bold ${Math.round(62 * (textScale / 100))}px Georgia, serif`;
    } else if (fontPairing === "Bold Tech") {
      headlineFont = `900 ${Math.round(58 * (textScale / 100))}px Arial, sans-serif`;
    } else {
      headlineFont = `200 ${Math.round(64 * (textScale / 100))}px "Helvetica Neue", sans-serif`;
    }
    ctx.font = headlineFont;

    const startX = textAlign === "center" ? 540 : textAlign === "left" ? 150 : 930;
    
    // Calculate vertical position offset
    let startY = 440;
    if (textPosition === "top") startY = 320;
    else if (textPosition === "bottom") startY = 560;

    // Headline wrap drawing
    const maxLineWith = 780;
    const headlineLineHeight = Math.round(74 * (textScale / 100));
    const lines = [];
    const words = headline.split(' ');
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWith && n > 0) {
        lines.push(currentLine);
        currentLine = words[n] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    lines.forEach((lineText, idx) => {
      ctx.fillText(lineText.trim(), startX, startY + (idx * headlineLineHeight));
    });

    // Draw Subheadline (Support Text)
    const subheadlineY = startY + (lines.length * headlineLineHeight) + 40;
    ctx.fillStyle = activeStyles.textMutedRaw;
    ctx.font = `300 28px ${activeStyles.fontFamilyRaw}`;
    
    const subWords = subheadline.split(' ');
    const subLines = [];
    let subCurrentLine = '';
    for (let m = 0; m < subWords.length; m++) {
      const testLine = subCurrentLine + subWords[m] + ' ';
      ctx.font = `300 28px ${activeStyles.fontFamilyRaw}`;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWith && m > 0) {
        subLines.push(subCurrentLine);
        subCurrentLine = subWords[m] + ' ';
      } else {
        subCurrentLine = testLine;
      }
    }
    subLines.push(subCurrentLine);

    subLines.forEach((subLineText, idx) => {
      ctx.fillText(subLineText.trim(), startX, subheadlineY + (idx * 38));
    });

    // 7. Draw Call To Action (CTA) at the bottom
    ctx.textAlign = "center";
    ctx.fillStyle = activeStyles.textAccentRaw;
    ctx.font = `bold 24px sans-serif`;
    
    // Draw an elegant decorative box or underline
    const ctaUpperText = cta.toUpperCase().split("").join("  ");
    ctx.fillText(ctaUpperText, 540, 940);
    
    // Bottom minimal arrow symbol
    ctx.font = "20px Arial";
    ctx.fillText("▼", 540, 975);

    // Trigger immediate download trigger
    const link = document.createElement("a");
    link.download = `post_meu_consultor_ia_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyToClipboard = (text: string, type: 'caption' | 'headline' | 'cta') => {
    navigator.clipboard.writeText(text);
    if (type === 'caption') {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else if (type === 'headline') {
      setCopiedHeadline(true);
      setTimeout(() => setCopiedHeadline(false), 2000);
    } else if (type === 'cta') {
      setCopiedCta(true);
      setTimeout(() => setCopiedCta(false), 2000);
    }
  };

  return (
    <div id="design-studio-root" className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans text-slate-200">
      
      {/* Premium Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5" /> Design Studio Premium
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${generationsLeft > 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
              Criações Restantes Hoje: {generationsLeft} / 3
            </span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Estúdio de Postagens do Designer IA</h1>
          <p className="text-xs text-slate-500 font-semibold">Crie artes limpas, luxuosas e estilosas para suas redes sociais integrando inteligência artificial e design moderno de alta costura empresarial.</p>
        </div>

        <button
          id="btn-designer-trigger-gen-top"
          onClick={handleGeneratePost}
          disabled={isGenerating}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Gerar Arte de Luxo com IA</span>
        </button>
      </div>

      {/* Daily limit error notification */}
      {generationLimitError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs flex items-start gap-2.5 shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wide text-rose-200">Aviso do Sistema</p>
            <p>{generationLimitError}</p>
          </div>
        </div>
      )}

      {/* Editor Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: AI Post Briefing & Setup (Lg: col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Generator Panel */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              1. Briefing de Conteúdo IA
            </h3>

            {/* Smart Suggestions */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Sugestões para {profile.segmento}</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {topicsList.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTopic(item)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold leading-relaxed transition-all border ${
                      topic === item 
                        ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-200" 
                        : "bg-slate-900/40 border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Ou Digite seu Próprio Tema/Objetivo</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Dar uma dica valiosa sobre o nicho para construir autoridade..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Brand Tone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tom da Identidade Visual</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Luxuoso/Elegante">👑 Luxuoso & Minimalista</option>
                <option value="Inovador/Tech">⚡ Inovador, Digital & Moderno</option>
                <option value="Direto/Prático">🎯 Direto, Estratégico & Comercial</option>
                <option value="Emocional/Humanizado">🌸 Humanizado, Acolhedor & Autêntico</option>
              </select>
            </div>

            <button
              id="btn-designer-trigger-gen-main"
              onClick={handleGeneratePost}
              disabled={isGenerating || !topic}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Criando Peça de Alta Costura...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Ideia & Layout IA</span>
                </>
              )}
            </button>
          </div>

          {/* Design Controls Panel */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 space-y-5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              2. Ajustes Finos do Design
            </h3>

            {/* Brand Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Nome da Marca (Topo)</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all uppercase"
              />
            </div>

            {/* Interactive Style Presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Estilo de Gráfico (Preset)</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Sleek Obsidian', 'Minimalist Marble', 'Royal Emerald', 'Deep Sapphire', 'Warm Terracotta'] as StylePreset[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setActiveStyle(style)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeStyle === style 
                        ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-200" 
                        : "bg-slate-900/50 border-slate-900 hover:border-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="text-xs font-extrabold block">{style}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                      {style === 'Sleek Obsidian' ? 'Luxo escuro' : style === 'Minimalist Marble' ? 'Minimal limpo' : style === 'Royal Emerald' ? 'Esmeralda rico' : style === 'Deep Sapphire' ? 'Futurista azul' : 'Earthy rústico'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Decorations */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Elementos de Fundo</label>
              <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl">
                {(['none', 'grid', 'circles', 'glow'] as BgDecoration[]).map((dec) => (
                  <button
                    key={dec}
                    onClick={() => setBgDecoration(dec)}
                    className={`py-1.5 px-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                      bgDecoration === dec 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {dec === 'none' ? 'Limpo' : dec === 'grid' ? 'Grade' : dec === 'circles' ? 'Anéis' : 'Brilho'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Icon Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Ícone Decorativo Central</label>
              <div className="grid grid-cols-6 gap-1.5 bg-slate-900 p-1.5 rounded-xl">
                {(['None', 'Sparkles', 'Trophy', 'Target', 'TrendingUp', 'Bookmark'] as SelectedIconOption[]).map((iconOpt) => (
                  <button
                    key={iconOpt}
                    onClick={() => setSelectedIcon(iconOpt)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex justify-center items-center ${
                      selectedIcon === iconOpt 
                        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" 
                        : "text-slate-500 hover:text-slate-300 border border-transparent"
                    }`}
                    title={iconOpt}
                  >
                    {iconOpt === 'None' && <span className="text-[10px] font-bold uppercase">Off</span>}
                    {iconOpt === 'Sparkles' && <Sparkles className="w-4 h-4" />}
                    {iconOpt === 'Trophy' && <Trophy className="w-4 h-4" />}
                    {iconOpt === 'Target' && <Target className="w-4 h-4" />}
                    {iconOpt === 'TrendingUp' && <TrendingUp className="w-4 h-4" />}
                    {iconOpt === 'Bookmark' && <Bookmark className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Border thickness */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Espessura da Moldura</span>
                <span className="text-indigo-400">{borderThickness}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={borderThickness}
                onChange={(e) => setBorderThickness(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Typography controls */}
            <div className="space-y-3.5 pt-2 border-t border-slate-900">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Combinação de Fontes</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl">
                  {(['Modern Serif', 'Bold Tech', 'Elegant Sans'] as FontStyleOption[]).map((pairing) => (
                    <button
                      key={pairing}
                      onClick={() => setFontPairing(pairing)}
                      className={`py-1.5 text-[9px] font-extrabold uppercase rounded-lg transition-all ${
                        fontPairing === pairing 
                          ? "bg-indigo-600 text-white shadow" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {pairing === 'Modern Serif' ? 'Serifada' : pairing === 'Bold Tech' ? 'Negrito' : 'Sans-Serif'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Scale range */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Tamanho</span>
                    <span className="text-indigo-400">{textScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="130"
                    value={textScale}
                    onChange={(e) => setTextScale(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Alignment */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Alinhamento</label>
                  <div className="flex gap-1 bg-slate-900 p-1 rounded-xl">
                    {(['left', 'center', 'right'] as TextAlignment[]).map((align) => (
                      <button
                        key={align}
                        onClick={() => setTextAlign(align)}
                        className={`flex-1 py-1 flex items-center justify-center rounded-lg transition-all ${
                          textAlign === align 
                            ? "bg-indigo-600 text-white shadow" 
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                        {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                        {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vertical position */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Posição Vertical do Bloco</label>
                <div className="flex gap-1 bg-slate-900 p-1 rounded-xl">
                  {(['top', 'center', 'bottom'] as TextVerticalPosition[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setTextPosition(pos)}
                      className={`flex-1 py-1 text-[9px] font-bold uppercase rounded-lg transition-all ${
                        textPosition === pos 
                          ? "bg-indigo-600 text-white shadow" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {pos === 'top' ? 'Topo' : pos === 'center' ? 'Centro' : 'Base'}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Center/Right: Visual Preview & Legend output (Lg: col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Visual Canvas Card Frame (Md: col-span-7) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-indigo-400" /> Canvas Preview (1:1)</span>
                <span>1080 x 1080 px</span>
              </div>

              {/* Responsive 1:1 Square block that visually matches the canvas logic */}
              <div 
                id="post-canvas-preview"
                className={`w-full aspect-square bg-gradient-to-br ${activeStyles.bg} relative p-12 flex flex-col justify-between border ${activeStyles.border} overflow-hidden shadow-2xl rounded-3xl transition-all`}
              >
                {/* Background Decorations overlays matching state */}
                {bgDecoration === 'grid' && (
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none opacity-[0.04]">
                    {Array.from({ length: 144 }).map((_, i) => (
                      <div key={i} className="border-t border-l border-slate-300" />
                    ))}
                  </div>
                )}

                {bgDecoration === 'circles' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <div className="w-[80%] aspect-square rounded-full border-2 border-slate-200" />
                    <div className="w-[60%] aspect-square rounded-full border-2 border-slate-200 absolute" />
                    <div className="w-[40%] aspect-square rounded-full border-2 border-slate-200 absolute" />
                  </div>
                )}

                {bgDecoration === 'glow' && (
                  <div className="absolute inset-0 bg-radial pointer-events-none opacity-[0.12] from-indigo-500 via-transparent to-transparent" />
                )}

                {/* Double frame overlay logic mimicking canvas */}
                {borderThickness > 0 && (
                  <>
                    <div 
                      className="absolute pointer-events-none" 
                      style={{ 
                        inset: '16px', 
                        border: `${borderThickness}px solid ${activeStyles.borderRaw}`,
                        opacity: 0.95
                      }} 
                    />
                    <div 
                      className="absolute pointer-events-none" 
                      style={{ 
                        inset: '20px', 
                        border: `1px solid ${activeStyles.borderRaw}`, 
                        opacity: 0.4
                      }} 
                    />
                  </>
                )}

                {/* Brand Header */}
                <div className="text-center relative z-10 pt-4">
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] block ${activeStyles.textMuted}`}>
                    {brandName || "MINHA EMPRESA"}
                  </span>
                  <div className="w-10 h-[1px] mx-auto mt-2.5" style={{ backgroundColor: activeStyles.borderRaw }} />
                </div>

                {/* Center Core Typography Block */}
                <div 
                  className={`flex-1 flex flex-col relative z-10 px-4`}
                  style={{ 
                    justifyContent: textPosition === 'top' ? 'flex-start' : textPosition === 'bottom' ? 'flex-end' : 'center',
                    paddingTop: textPosition === 'top' ? '20px' : '0px',
                    paddingBottom: textPosition === 'bottom' ? '20px' : '0px',
                  }}
                >
                  <div 
                    className="space-y-4"
                    style={{ 
                      textAlign: textAlign === 'center' ? 'center' : textAlign === 'left' ? 'left' : 'right',
                    }}
                  >
                    {/* Selected Decorative Icon */}
                    {selectedIcon !== 'None' && (
                      <div className="flex justify-center mb-2">
                        <span className="text-xl md:text-2xl block" style={{ color: activeStyles.textAccentRaw }}>
                          {selectedIcon === 'Sparkles' && "✦"}
                          {selectedIcon === 'Trophy' && "🏆"}
                          {selectedIcon === 'Target' && "🎯"}
                          {selectedIcon === 'TrendingUp' && "📈"}
                          {selectedIcon === 'Bookmark' && "🔖"}
                        </span>
                      </div>
                    )}

                    {/* Headline text (direct typeable or auto-updated) */}
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className={`w-full bg-transparent border-none text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/20 rounded-xl leading-tight text-white font-extrabold focus:bg-slate-900/30 p-1.5`}
                      style={{
                        textAlign: textAlign === 'center' ? 'center' : textAlign === 'left' ? 'left' : 'right',
                        fontSize: `${Math.round(24 * (textScale / 100))}px`,
                        fontFamily: fontPairing === 'Modern Serif' ? 'Georgia, serif' : fontPairing === 'Bold Tech' ? 'sans-serif' : 'system-ui',
                        fontWeight: fontPairing === 'Bold Tech' ? 900 : fontPairing === 'Modern Serif' ? 800 : 200,
                        color: activeStyle === 'Minimalist Marble' || activeStyle === 'Warm Terracotta' ? activeStyles.textPrimaryRaw : '#ffffff'
                      }}
                      placeholder="Título da Arte"
                    />

                    {/* Subheadline (direct typeable or auto-updated) */}
                    <textarea
                      value={subheadline}
                      onChange={(e) => setSubheadline(e.target.value)}
                      rows={3}
                      className={`w-full bg-transparent border-none text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/20 rounded-xl text-xs md:text-sm leading-relaxed ${activeStyles.textMuted} font-medium focus:bg-slate-900/30 p-1.5 resize-none`}
                      style={{
                        textAlign: textAlign === 'center' ? 'center' : textAlign === 'left' ? 'left' : 'right',
                        fontFamily: activeStyles.fontFamily === 'font-serif' ? 'Georgia, serif' : 'sans-serif'
                      }}
                      placeholder="Texto de apoio da postagem..."
                    />
                  </div>
                </div>

                {/* Call to Action Footer */}
                <div className="text-center relative z-10 pb-4">
                  <span className={`text-[9px] md:text-xs font-black uppercase tracking-[0.2em] block`} style={{ color: activeStyles.textAccentRaw }}>
                    {cta || "Leia a legenda"}
                  </span>
                  <span className="text-[10px] md:text-xs mt-1 block" style={{ color: activeStyles.textAccentRaw }}>▼</span>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  id="btn-designer-download-png"
                  onClick={handleDownloadImage}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arte em Alta Resolução (PNG)</span>
                </button>
              </div>
            </div>

            {/* AI Copywriting Column: Legend/Caption (Md: col-span-5) */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1.5"><Send className="w-4 h-4 text-emerald-400" /> Copacabana & Copywriting</span>
                <span className="text-[10px] text-indigo-400">Pronto para Instagram</span>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 space-y-4 shadow-xl relative min-h-[460px] flex flex-col justify-between">
                
                {/* Text editor for legend/caption */}
                <div className="space-y-3.5 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legenda do Post</span>
                    <button
                      id="btn-designer-copy-caption"
                      onClick={() => copyToClipboard(caption, 'caption')}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      {copiedCaption ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiada</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Legenda</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={16}
                    className="w-full bg-slate-900/60 border border-slate-900/80 rounded-2xl px-3.5 py-3 text-xs font-medium text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all leading-relaxed"
                    placeholder="Legenda da sua postagem..."
                  />
                </div>

                {/* Micro instructions */}
                <div className="bg-slate-900/30 border border-slate-900/60 p-3.5 rounded-2xl text-[10px] leading-normal text-slate-500 font-semibold space-y-1">
                  <span className="text-indigo-400 font-bold block uppercase tracking-wider mb-1">Como Publicar no Feed:</span>
                  <p>1. Clique em "Baixar Arte" para fazer download do gráfico em formato 1080x1080 px.</p>
                  <p>2. Copie a legenda clicando no botão de copiar acima.</p>
                  <p>3. Abra seu Instagram/WhatsApp e crie um novo post com a imagem baixada e cole a legenda copiada!</p>
                </div>

              </div>
            </div>

          </div>

          {/* Prompt/Visual Preset Quick Reference Guide */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">⚜ Curadoria Premium</span>
              <p className="leading-relaxed font-medium">As paletas e o design geométrico foram planejados de acordo com as tendências europeias de design corporativo minimalista e de marcas de grife (boutique).</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">✏ Totalmente Editável</span>
              <p className="leading-relaxed font-medium">Você pode clicar diretamente em qualquer caixa de texto na tela do Canvas Preview para customizar os títulos, subtítulos e chamadas sem travar seu fluxo.</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">💡 Multi-Canais</span>
              <p className="leading-relaxed font-medium">Use os posts de luxo gerados tanto no feed do seu Instagram quanto no status do seu WhatsApp Business para fechar novos negócios corporativos de alto valor.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
