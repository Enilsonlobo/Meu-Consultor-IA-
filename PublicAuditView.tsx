/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Instagram, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Flame, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Compass, 
  Award, 
  FileText,
  Lock,
  ArrowRight,
  ShieldAlert,
  BookOpen
} from "lucide-react";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { db } from "../supabase";
import { InstagramAuditSession } from "../types";

interface PublicAuditViewProps {
  auditId: string;
  onBackToApp: () => void;
}

export const PublicAuditView: React.FC<PublicAuditViewProps> = ({ auditId, onBackToApp }) => {
  const [audit, setAudit] = useState<InstagramAuditSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'geral' | 'gargalos' | 'conteudo' | 'hooks' | 'tendencias' | 'plano' | 'raw'>('geral');
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setLoading(true);
        // Direct document retrieval via database ID
        const docs = await db.getDocs("instagram_audits", [{ field: "id", val: auditId }]);
        if (docs && docs.length > 0) {
          setAudit(docs[0] as InstagramAuditSession);
        } else {
          setError("Auditoria não encontrada ou o link expirou.");
        }
      } catch (err) {
        console.error("Erro ao carregar auditoria pública:", err);
        setError("Ocorreu um erro ao carregar esta auditoria.");
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [auditId]);

  const triggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 50) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-4 text-slate-100 font-sans">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Carregando Relatório Executivo...</p>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="w-14 h-14 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Relatório Indisponível</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          {error || "Esta auditoria de Instagram não foi localizada ou não está configurada para compartilhamento público."}
        </p>
        <button
          onClick={onBackToApp}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Ir para o MCI
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      
      {/* 1. Branding Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-900 sticky top-0 z-40 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-white tracking-tight uppercase block leading-none">Meu Consultor IA®</span>
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest block mt-1 leading-none">Parecer Técnico de Posicionamento</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900/40 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Documento Compartilhado
            </span>
            <button
              onClick={onBackToApp}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
            >
              Ir para o MCI
            </button>
          </div>
        </div>
      </header>

      {/* 2. Page Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-8">
        
        {/* Audit Stats Banner */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shrink-0">
              <Instagram className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">{audit.username}</span>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                  {audit.empresa}
                </span>
              </div>
              <span className="text-xs text-slate-500 block mt-0.5 font-semibold">
                Auditoria realizada em: {new Date(audit.createdAt).toLocaleDateString('pt-BR')} às {new Date(audit.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
              </span>
            </div>
          </div>

          <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 shrink-0 ${getScoreColor(audit.scoreGeral)}`}>
            <BarChart3 className="w-5 h-5 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider block">SCORE GERAL</span>
              <span className="text-xl font-black block leading-none mt-0.5">{audit.scoreGeral} <span className="text-xs text-slate-500">/ 100</span></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-2.5 shadow-xl flex overflow-x-auto gap-1">
          {[
            { id: 'geral', label: 'Overview', icon: Compass },
            { id: 'gargalos', label: 'Gargalos & Funil', icon: Target },
            { id: 'conteudo', label: 'Postagens Potenciais', icon: Award },
            { id: 'hooks', label: 'Ganchos & Ideias', icon: Flame },
            { id: 'tendencias', label: 'Tendências', icon: TrendingUp },
            { id: 'plano', label: 'Calendário 30 Dias', icon: Calendar },
            { id: 'raw', label: 'Relatório Completo', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main tabs content viewer */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* TAB 1: GERAL OVERVIEW */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              
              {/* Score indicators */}
              <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Diagnóstico de Critérios (Notas 0 a 10)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                  {[
                    { label: "Foto do Perfil", value: audit.diagnostico.foto, desc: "Identificação rápida, contraste e profissionalismo" },
                    { label: "Nome do Perfil", value: audit.diagnostico.nomePerfil, desc: "SEO e clareza da proposta de valor" },
                    { label: "Nome de Usuário (@)", value: audit.diagnostico.nomeUsuario, desc: "Legibilidade e facilidade de pesquisa" },
                    { label: "Texto da Bio", value: audit.diagnostico.bio, desc: "Diferenciação clara e chamada para clique" },
                    { label: "Destaques", value: audit.diagnostico.destaques, desc: "Funil passivo estruturado de conversão" },
                    { label: "Frequência de Postagem", value: audit.diagnostico.frequencia, desc: "Consistência e presença ativa" },
                    { label: "Identidade Visual", value: audit.diagnostico.identidadeVisual, desc: "Profissionalismo, ritmo e paleta de cores" },
                    { label: "Posicionamento de Marca", value: audit.diagnostico.posicionamento, desc: "Autoridade e autorreconhecimento" },
                    { label: "Clareza da Oferta", value: audit.diagnostico.clarezaOferta, desc: "Facilidade de compreender o produto" },
                    { label: "Chamada para Ação (CTA)", value: audit.diagnostico.cta, desc: "Direcionamento claro para canais comerciais" },
                    { label: "Proposta de Valor", value: audit.diagnostico.propostaValor, desc: "Qual problema de negócio é resolvido" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1 bg-slate-900/20 border border-slate-900/40 p-3 rounded-2xl">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">{item.label}</span>
                        <span className={`font-black px-1.5 py-0.5 rounded ${
                          item.value >= 8 ? "text-emerald-400 bg-emerald-500/10" : item.value >= 5 ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10"
                        }`}>{item.value}/10</span>
                      </div>
                      <div className="w-full bg-slate-800/40 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            item.value >= 8 ? "bg-emerald-500" : item.value >= 5 ? "bg-amber-500" : "bg-rose-500"
                          }`} 
                          style={{ width: `${item.value * 10}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 font-semibold leading-none mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strong points & improvement points cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Pontos Fortes (Ativos de Marca)
                  </h4>
                  <ul className="space-y-3 pt-1">
                    {audit.pontosFortes.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                        <span className="leading-relaxed font-semibold">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Pontos de Atenção (Vazamentos de Funil)
                  </h4>
                  <ul className="space-y-3 pt-1">
                    {audit.pontosAtencao.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                        <span className="leading-relaxed font-semibold">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GARGALOS */}
          {activeTab === 'gargalos' && (
            <div className="space-y-6">
              
              <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  Estratégia Recomendada para o Segmento
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pt-1 font-semibold">
                  {audit.estrategiaRecomendada}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Mapeamento de Gargalos Críticos
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Estes são os principais obstáculos identificados no seu perfil que estão limitando o seu alcance orgânico ou a conversão de novos contatos qualificados.
                </p>
                <div className="space-y-4 pt-2">
                  {audit.gargalos.map((gar, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl flex gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{gar.titulo}</span>
                        <span className="text-xs text-slate-400 block mt-1 leading-relaxed font-semibold">{gar.impacto}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Avenidas de Oportunidades & Formatos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {audit.oportunidades.map((op, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-slate-300 leading-relaxed font-semibold">{op}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CONTEUDO */}
          {activeTab === 'conteudo' && (
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                Mapeamento de Conteúdos de Maior Performance
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Nossa consultoria identificou estas estruturas e abordagens de posts que carregam a maior probabilidade de gerar engajamento e tráfego qualificado.
              </p>

              <div className="space-y-6 pt-4">
                {audit.conteudosPerformance.map((post, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-md">
                    <div className="bg-indigo-950/25 px-4 py-3 border-b border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                        <h5 className="text-xs font-bold text-slate-200">{post.tema}</h5>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">{post.formato}</span>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900">{post.objetivo}</span>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                      <div className="md:col-span-2 space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Por que funciona?</span>
                        <p className="text-slate-300 leading-relaxed font-semibold">{post.motivo}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Fatores Psicológicos</span>
                        <div className="space-y-1 font-semibold">
                          <p className="text-slate-300 leading-none">Emoção: <span className="text-indigo-400">{post.emocao}</span></p>
                          <p className="text-slate-300 leading-none mt-1.5">Gatilho: <span className="text-indigo-400">{post.gatilho}</span></p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Como Replicar</span>
                        <p className="text-slate-300 leading-relaxed font-semibold text-[11px]">{post.replicacao}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HOOKS */}
          {activeTab === 'hooks' && (
            <div className="space-y-6">
              
              <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Flame className="w-4 h-4 text-indigo-400" />
                    20 Ganchos (Hooks) de Alta Retenção (Exatamente 10 Palavras)
                  </h4>
                  <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900 font-extrabold px-2 py-0.5 rounded-full">
                    Scroll-Stoppers
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {audit.hooks.map((hk, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-slate-500">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="text-xs text-slate-200 font-bold leading-relaxed">{hk}</span>
                      </div>
                      <button
                        onClick={() => triggerCopy(hk, `hk-${idx}`)}
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                        title="Copiar Gancho"
                      >
                        {copiedTextId === `hk-${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  20 Ideias de Postagens Prontas para Uso
                </h4>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pt-2">
                  {audit.ideiasConteudo.map((id, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                          <h5 className="text-xs font-extrabold text-slate-200">{id.titulo}</h5>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <span className="text-[8px] font-extrabold bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">{id.formato}</span>
                          <span className="text-[8px] font-extrabold bg-indigo-950/60 border border-indigo-900 px-1.5 py-0.5 rounded text-indigo-300">{id.objetivo}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] font-semibold">
                        <div className="p-2 bg-slate-950/50 rounded-xl border border-slate-900/60 relative group">
                          <span className="text-[8px] text-slate-500 block uppercase tracking-wider mb-1">Frase de Gancho Inicial</span>
                          <p className="text-slate-300 italic pr-6">&ldquo;{id.gancho}&rdquo;</p>
                          <button
                            onClick={() => triggerCopy(id.gancho, `idgancho-${idx}`)}
                            className="absolute right-2 top-2 p-1 rounded hover:bg-indigo-600 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            title="Copiar gancho"
                          >
                            {copiedTextId === `idgancho-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="p-2 bg-slate-950/50 rounded-xl border border-slate-900/60 relative group">
                          <span className="text-[8px] text-slate-500 block uppercase tracking-wider mb-1">Chamada para Ação (CTA)</span>
                          <p className="text-indigo-400 pr-6">{id.cta}</p>
                          <button
                            onClick={() => triggerCopy(id.cta, `idcta-${idx}`)}
                            className="absolute right-2 top-2 p-1 rounded hover:bg-indigo-600 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            title="Copiar CTA"
                          >
                            {copiedTextId === `idcta-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: TENDENCIAS */}
          {activeTab === 'tendencias' && (
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                5 Tendências de Alto Potencial Viral
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Estruturas de conteúdo dinâmicas, áudios em alta ou tendências de engajamento do mercado traduzidos e adaptados especificamente para a realidade operacional da sua empresa.
              </p>

              <div className="space-y-6 pt-4">
                {audit.tendencias.map((trend, idx) => (
                  <div key={idx} className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                        <h5 className="text-xs font-bold text-slate-200">{trend.titulo}</h5>
                      </div>
                      <span className="text-[9px] font-extrabold bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">{trend.formato}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Por que funciona?</span>
                        <p className="text-slate-300 leading-relaxed font-semibold">{trend.porQueFunciona}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Como adaptar para sua empresa</span>
                        <p className="text-indigo-400 leading-relaxed font-semibold">{trend.comoAdaptar}</p>
                      </div>
                      <div className="space-y-1 border-t border-slate-900/60 pt-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Retenção de Audiência</span>
                        <p className="text-slate-400 leading-relaxed font-semibold">{trend.comoAumentarRetencao}</p>
                      </div>
                      <div className="space-y-1 border-t border-slate-900/60 pt-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Estratégia de Conversão</span>
                        <p className="text-slate-400 leading-relaxed font-semibold">{trend.comoConverter}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PLANO */}
          {activeTab === 'plano' && (
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Plano Editorial Estratégico de 30 Dias
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Siga o cronograma diário abaixo. A ordem de publicação foi estruturada estrategicamente para alternar objetivos de atração (descoberta), retenção (relacionamento/autoridade) e conversão em leads comerciais (prova social/venda).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3">
                {audit.plano30Dias.map((day, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/40 border border-slate-900/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-slate-800 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-sans font-black text-white text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-lg leading-none">
                        Dia {day.dia}
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded leading-none shrink-0 border ${
                        day.tipo === 'descoberta' ? "bg-purple-500/10 text-purple-400 border-purple-500/10" :
                        day.tipo === 'consideracao' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/10" :
                        day.tipo === 'autoridade' ? "bg-amber-500/10 text-amber-400 border-amber-500/10" :
                        day.tipo === 'relacionamento' ? "bg-rose-500/10 text-rose-400 border-rose-500/10" :
                        day.tipo === 'prova_social' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" :
                        "bg-pink-500/10 text-pink-400 border-pink-500/10" // conversao
                      }`}>
                        {day.tipo.replace("_", " ")}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed flex-1">
                      {day.tarefa}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: RAW */}
          {activeTab === 'raw' && (
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-6">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Relatório Técnico Consolidado em Markdown
                </h4>
                <button
                  onClick={() => triggerCopy(audit.rawReportMarkdown || "", "raw-md")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedTextId === "raw-md" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <div className="markdown-body text-slate-300 leading-relaxed max-w-none text-xs space-y-4">
                <Markdown>{audit.rawReportMarkdown || ""}</Markdown>
              </div>
            </div>
          )}
        </motion.div>

        {/* 3. Promotional Footer CTA */}
        <div className="bg-gradient-to-r from-indigo-950/20 to-slate-950/40 border border-indigo-500/10 rounded-3xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/10 shadow-lg shadow-indigo-600/5">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-lg font-black text-white">Gostaria de auditar seu próprio perfil do Instagram de graça?</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              O <strong>Meu Consultor IA®</strong> é o ecossistema estratégico completo para pequenas empresas. Faça diagnósticos de negócio, configure seu WhatsApp comercial, mapeie concorrentes locais e crie conteúdos de alta performance com inteligência artificial avançada.
            </p>
          </div>
          <div>
            <button
              onClick={onBackToApp}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <span>Gerar Minha Auditoria Grátis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
