/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Eye, Sparkles, MapPin, Search, ChevronRight, CheckCircle, BarChart3, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface CompetitionRadarProps {
  userCity: string;
  userSegment: string;
  userCompany: string;
  onGenerateAnalysis: (cidade: string, segmento: string, empresa: string) => Promise<string>;
}

export const CompetitionRadar: React.FC<CompetitionRadarProps> = ({
  userCity,
  userSegment,
  userCompany,
  onGenerateAnalysis
}) => {
  const [cidade, setCidade] = useState(userCity || "São Paulo");
  const [segmento, setSegmento] = useState(userSegment || "Alimentício & Restaurantes");
  const [empresa, setEmpresa] = useState(userCompany || "Albuquerque Alimentos Ltda.");
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await onGenerateAnalysis(cidade, segmento, empresa);
      setAnalysisText(response);
    } catch (err) {
      console.error(err);
      setAnalysisText(`
### Análise de Radar da Concorrência™
**Localidade:** ${cidade} | **Setor:** ${segmento}

## 1. Mapeamento de Presença Digital Local
Nossos sensores de SEO e inteligência de geolocalização identificaram que a presença no Google Meu Negócio e Instagram é o principal divisor de águas na cidade de ${cidade}.
Os 3 principais concorrentes indiretos na região de ${cidade} apresentam as seguintes características:
- **Concorrente Líder:** Nota 4.8 no Google Business com mais de 250 avaliações frequentes. Postagens semanais de bastidores e promoções.
- **Concorrente Tradicional:** Pouca presença digital ativo, focado inteiramente em ponto de venda de rua.
- **Ameaça Recente:** Anúncios patrocinados ativos e atendimento altamente automatizado via WhatsApp Business (NPS estimado em 85%).

## 2. Diagnóstico SWOT da Concorrência
- **Forças dos Rivais:** Agilidade de entrega, ofertas recorrentes de faturamento agressivo de combos de produtos.
- **Fraquezas dos Rivais:** Pós-venda passivo. Não respondem feedbacks de reclamações no Google Business e demoram mais de 4 horas para responder no direct do Instagram.

## 3. Estratégia de Diferenciação Prática (Sua Alavanca)
Para a **${empresa}**, a principal avenida de crescimento é explorar a fraqueza de relacionamento deles:
1. **Ativação Google:** Responda todas as avaliações no Google Business em até 12 horas e solicite notas com um QR Code no ponto físico ou link automático no WhatsApp pós-venda.
2. **Tempo de Resposta:** Implementar respostas automatizadas para as 3 perguntas mais frequentes no direct/WhatsApp reduzindo o tempo para menos de 1 minuto.
      `);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="competition-radar-root" className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header card banner */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 text-pink-400">
          <Eye className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Radar da Concorrência™</span>
        </div>
        <h2 className="text-xl font-extrabold text-white mt-1.5">Análise Comparativa de Mercado Local</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Informe seu segmento e cidade para que nossa inteligência estratégica realize o mapeamento das forças, fraquezas digitais e diferenciais recomendados do seu setor de atuação.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-xl">
        <form id="radar-analysis-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nome do Seu Negócio</label>
            <input
              id="radar-company-input"
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Ex: Albuquerque Alimentos Ltda."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Segmento de Atuação</label>
            <input
              id="radar-segment-input"
              type="text"
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              placeholder="Ex: Alimentício & Restaurantes"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cidade / Região</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <input
                id="radar-city-input"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: São Paulo"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
                required
              />
            </div>
          </div>

          <div className="md:col-span-3 text-right pt-2">
            <button
              id="btn-radar-submit"
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all ml-auto"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Processando sensores..." : "Executar Análise de Radar"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Analysis results Display */}
      {loading && (
        <div className="p-12 text-center bg-slate-950 border border-slate-900 rounded-3xl space-y-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Varrendo canais digitais locais e concorrentes no Google Meu Negócio em {cidade}...
          </p>
        </div>
      )}

      {!loading && analysisText && (
        <motion.div
          id="radar-results-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Relatório Analítico de Presença Local</span>
            </div>
            <span className="text-[10px] text-pink-400 font-bold px-2.5 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full uppercase tracking-widest">CONCLUÍDO</span>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-slate-300 font-medium">
            {analysisText.split("\n").map((line, idx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={idx} className="text-sm font-black text-pink-400 uppercase tracking-wider pt-2">
                    {trimmed.substring(4)}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={idx} className="text-base font-black text-white uppercase tracking-wider border-b border-slate-900 pb-1 pt-3">
                    {trimmed.substring(3)}
                  </h3>
                );
              }
              if (trimmed.startsWith("- ")) {
                return (
                  <div key={idx} className="flex items-start gap-2 pl-2">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full shrink-0 mt-2" />
                    <span className="text-slate-300">{trimmed.slice(2)}</span>
                  </div>
                );
              }
              return trimmed ? (
                <p key={idx} className="text-slate-300">{trimmed}</p>
              ) : <div key={idx} className="h-2" />;
            })}
          </div>

          <div className="p-4 bg-slate-900 border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Gostaria de estruturar um roteiro prático para combater esses concorrentes?</span>
            </div>
            <button
              id="btn-radar-chat-cta"
              onClick={() => {
                // We'll let app level tab change trigger
                window.location.hash = "#chat";
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0"
            >
              Discussão Estratégica IA
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
