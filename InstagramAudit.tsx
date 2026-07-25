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
  BookOpen, 
  Award, 
  Info,
  Trash2,
  FileText,
  Share2,
  Lock,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { db } from "../firebase";
import { InstagramAuditSession, UserProfile } from "../types";

interface InstagramAuditProps {
  profile: UserProfile;
}

const LOADING_STEPS = [
  "Estabelecendo conexão segura com o Instagram...",
  "Analisando integridade da Bio, Foto e Links do perfil...",
  "Calculando Índice de Posicionamento e Proposta de Valor...",
  "Sinalizando gargalos de engajamento e vazamentos de funil...",
  "Gerando exatamente 20 ganchos irresistíveis (exatamente 10 palavras)...",
  "Desenvolvendo 20 ideias práticas de posts de alta performance...",
  "Mapeando 5 tendências virais customizadas para o seu nicho...",
  "Estruturando plano de conteúdo diário para os próximos 30 dias..."
];

export const InstagramAudit: React.FC<InstagramAuditProps> = ({ profile }) => {
  // Form state
  const [username, setUsername] = useState("@" + (profile.empresa.toLowerCase().replace(/\s+/g, "") || "empresa"));
  const [empresa, setEmpresa] = useState(profile.empresa || "");
  const [segmento, setSegmento] = useState(profile.segmento || "");
  const [publicoAlvo, setPublicoAlvo] = useState(profile.objetivos || "");
  const [desafio, setDesafio] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'geral' | 'gargalos' | 'conteudo' | 'hooks' | 'tendencias' | 'plano' | 'raw'>('geral');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Audits data state
  const [sessions, setSessions] = useState<InstagramAuditSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InstagramAuditSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load audit history for this tenant/user
  useEffect(() => {
    loadSessions();
  }, [profile.uid]);

  // Loading steps animation
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadSessions = async () => {
    try {
      const docs = await db.getDocs("instagram_audits", [{ field: "userId", val: profile.uid }]);
      // Sort newest first
      const sorted = (docs as InstagramAuditSession[]).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSessions(sorted);
      if (sorted.length > 0 && !selectedSession) {
        setSelectedSession(sorted[0]);
      }
    } catch (err) {
      console.error("Erro ao carregar auditorias:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectedSession(null);

    const cleanUsername = username.startsWith("@") ? username : "@" + username;

    try {
      const response = await fetch("/api/instagram-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          empresa,
          segmento,
          publicoAlvo,
          desafio
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro de rede ao processar auditoria.");
      }

      const data = await response.json();

      // Save audit session in our mock DB
      const newAudit: InstagramAuditSession = {
        id: "audit-" + Math.random().toString(36).substring(7),
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
        rawReportMarkdown: data.rawReportMarkdown
      };

      await db.addDoc("instagram_audits", newAudit);
      await loadSessions();
      setSelectedSession(newAudit);
      setActiveTab('geral');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao processar sua auditoria de Instagram. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja remover esta auditoria do seu histórico?")) return;
    
    try {
      await db.deleteDoc("instagram_audits", id);
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      if (selectedSession?.id === id) {
        setSelectedSession(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error("Erro ao deletar sessão:", err);
    }
  };

  const triggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  const handleTogglePublish = async () => {
    if (!selectedSession) return;
    setIsPublishing(true);
    try {
      const nextPublishedState = !selectedSession.published;
      await db.updateDoc("instagram_audits", selectedSession.id, {
        published: nextPublishedState
      });
      
      const updatedSession = { ...selectedSession, published: nextPublishedState };
      setSelectedSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === selectedSession.id ? updatedSession : s));
    } catch (err) {
      console.error("Erro ao publicar auditoria:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 50) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  return (
    <div id="instagram-audit-module" className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Module Header card */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 text-indigo-400">
          <Instagram className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">MÓDULO ESPECIALISTA – AUDITORIA DE INSTAGRAM</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1.5">Auditor e Estrategista de Crescimento Orgânico</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Nossa inteligência simula a análise de um <strong>Consultor Sênior em Growth Marketing e SEO de Redes Sociais</strong>. 
          Identifique gargalos de funil, pontos fracos na bio, receba 20 ganchos inéditos de conversão, 20 ideias de posts e um cronograma editorial completo de 30 dias.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & History (5/12 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Audit Request Form */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 md:p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Nova Auditoria
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username do Perfil</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: @minhaempresa"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome do Negócio</label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ex: Clinica Odonto Premium"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Segmento de Atuação</label>
                <input
                  type="text"
                  value={segmento}
                  onChange={(e) => setSegmento(e.target.value)}
                  placeholder="Ex: Odontologia Estética"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Público-Alvo (Persona)</label>
                <textarea
                  value={publicoAlvo}
                  onChange={(e) => setPublicoAlvo(e.target.value)}
                  placeholder="Ex: Homens e mulheres de 25 a 45 anos que buscam melhorar a autoestima com lentes de contato dentais."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200 resize-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Principal Desafio no Instagram</label>
                <textarea
                  value={desafio}
                  onChange={(e) => setDesafio(e.target.value)}
                  placeholder="Ex: Recebemos muitas visitas mas ninguém manda direct ou clica no link do WhatsApp."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200 resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>{loading ? "Iniciando Auditoria..." : "Auditar Perfil Agora"}</span>
              </button>
            </form>
          </div>

          {/* Audit History Card */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
              <FileText className="w-4 h-4 text-slate-400" />
              Auditorias Anteriores ({sessions.length})
            </h3>

            {sessions.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-4 text-center">Nenhuma auditoria realizada ainda.</p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => setSelectedSession(sess)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      selectedSession?.id === sess.id
                        ? "bg-indigo-950/20 border-indigo-500/40 text-white"
                        : "bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 truncate block">{sess.username}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          sess.scoreGeral >= 80 ? "bg-emerald-500/10 text-emerald-400" : sess.scoreGeral >= 50 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {sess.scoreGeral}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                        {new Date(sess.createdAt).toLocaleDateString('pt-BR')} — {sess.segmento}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                      title="Deletar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Loading States or Report View (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active loader state */}
          {loading && (
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-xl flex flex-col items-center justify-center space-y-6 min-h-[450px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-white animate-pulse">
                  Meu Consultor IA® está avaliando seu perfil...
                </h3>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest max-w-md mx-auto transition-all duration-500">
                  {LOADING_STEPS[loadingStep]}
                </p>
              </div>

              <div className="max-w-md text-slate-500 text-[11px] leading-relaxed font-semibold">
                Nossa IA sênior está executando análises estruturais de posicionamento competitivo de marca, aplicando as diretrizes de marketing e conversão comercial exclusivas. Este diagnóstico profundo leva cerca de 20-30 segundos.
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-rose-950/15 border border-rose-900/40 rounded-3xl p-6 md:p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-base">Falha na Conexão Neural</h3>
                <p className="text-xs text-rose-300 max-w-md mx-auto font-semibold">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Initial State (No session loaded) */}
          {!selectedSession && !loading && !error && (
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-xl space-y-6 min-h-[450px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-900 text-indigo-400 rounded-3xl flex items-center justify-center border border-slate-800 shadow-inner">
                <Instagram className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="font-extrabold text-white text-base">Nenhum perfil de Instagram auditado</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Preencha o formulário estratégico ao lado para submeter o perfil do seu negócio à nossa auditoria especializada. 
                  Você receberá uma nota geral, listagem de pontos de conversão críticos, além de ganchos prontos, ideias de posts, tendências e plano de 30 dias.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full text-left pt-4">
                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Foco Comercial</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">Não analisamos curtidas, analisamos a capacidade de gerar leads qualificados e cliques.</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Materiais Prontos</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">Ganchos, legendas estratégicas, abordagens e roteiros para Reels e Stories.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Display Board */}
          {selectedSession && !loading && !error && (
            <div className="space-y-6">
              
              {/* Audit Stats Banner */}
              <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shrink-0">
                    <Instagram className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">{selectedSession.username}</span>
                      <span className="text-[10px] text-slate-500 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                        {selectedSession.empresa}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5 font-semibold">
                      Auditoria realizada em: {new Date(selectedSession.createdAt).toLocaleDateString('pt-BR')} às {new Date(selectedSession.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={handleTogglePublish}
                    disabled={isPublishing}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      selectedSession.published 
                        ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/40"
                        : "bg-indigo-600 hover:bg-indigo-500 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    }`}
                  >
                    {isPublishing ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : selectedSession.published ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                        <span>Publicado</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Publicar</span>
                      </>
                    )}
                  </button>

                  <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 shrink-0 ${getScoreColor(selectedSession.scoreGeral)}`}>
                    <BarChart3 className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider block">SCORE GERAL</span>
                      <span className="text-xl font-black block leading-none mt-0.5">{selectedSession.scoreGeral} <span className="text-xs text-slate-500">/ 100</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shareable Link panel when Published */}
              {selectedSession.published && (
                <div className="bg-indigo-950/15 border border-indigo-500/10 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Sua auditoria de Instagram está publicada e ativa!</span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-semibold leading-relaxed">Qualquer pessoa com o link de compartilhamento poderá visualizar este relatório estratégico completo sem precisar fazer login.</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto items-center">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/?audit=${selectedSession.id}`}
                      className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-indigo-300 font-mono font-medium focus:outline-none w-full md:w-56 shadow-inner"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <a
                      href={`${window.location.origin}/?audit=${selectedSession.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center shrink-0 cursor-pointer"
                      title="Abrir em Nova Aba"
                    >
                      <ExternalLink className="w-4 h-4 text-indigo-400" />
                    </a>
                    <button
                      onClick={() => triggerCopy(`${window.location.origin}/?audit=${selectedSession.id}`, "share-link")}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-600/10"
                    >
                      {copiedTextId === "share-link" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Compartilhar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Dashboard Tabs */}
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
                      className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'geral' && (
                <div className="space-y-6">
                  
                  {/* Diagnosis Rating list */}
                  <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      Diagnóstico de Critérios (Notas 0 a 10)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                      {[
                        { label: "Foto do Perfil", value: selectedSession.diagnostico.foto, desc: "Identificação rápida, contraste e profissionalismo" },
                        { label: "Nome do Perfil", value: selectedSession.diagnostico.nomePerfil, desc: "SEO e clareza da proposta de valor" },
                        { label: "Nome de Usuário (@)", value: selectedSession.diagnostico.nomeUsuario, desc: "Legibilidade e facilidade de pesquisa" },
                        { label: "Texto da Bio", value: selectedSession.diagnostico.bio, desc: "Diferenciação clara e chamada para clique" },
                        { label: "Destaques", value: selectedSession.diagnostico.destaques, desc: "Funil passivo estruturado de conversão" },
                        { label: "Frequência de Postagem", value: selectedSession.diagnostico.frequencia, desc: "Consistência e presença ativa" },
                        { label: "Identidade Visual", value: selectedSession.diagnostico.identidadeVisual, desc: "Profissionalismo, ritmo e paleta de cores" },
                        { label: "Posicionamento de Marca", value: selectedSession.diagnostico.posicionamento, desc: "Autoridade e autorreconhecimento" },
                        { label: "Clareza da Oferta", value: selectedSession.diagnostico.clarezaOferta, desc: "Facilidade de compreender o produto" },
                        { label: "Chamada para Ação (CTA)", value: selectedSession.diagnostico.cta, desc: "Direcionamento claro para canais comerciais" },
                        { label: "Proposta de Valor", value: selectedSession.diagnostico.propostaValor, desc: "Qual problema de negócio é resolvido" }
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
                          <p className="text-[9px] text-slate-500 font-medium leading-none mt-1">{item.desc}</p>
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
                        {selectedSession.pontosFortes.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                            <span className="leading-relaxed">{p}</span>
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
                        {selectedSession.pontosAtencao.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                            <span className="leading-relaxed">{p}</span>
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
                  
                  {/* General recommended strategy */}
                  <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Compass className="w-4 h-4" />
                      Estratégia Recomendada para o Segmento
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {selectedSession.estrategiaRecomendada}
                    </p>
                  </div>

                  {/* Key bottlenecks list */}
                  <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-400" />
                      Mapeamento de Gargalos Críticos
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Estes são os principais obstáculos identificados no seu perfil que estão limitando o seu alcance orgânico ou a conversão de novos contatos qualificados.
                    </p>
                    <div className="space-y-4 pt-2">
                      {selectedSession.gargalos.map((gar, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl flex gap-3.5">
                          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">{gar.titulo}</span>
                            <span className="text-xs text-slate-400 block mt-1 leading-relaxed">{gar.impacto}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Avenidas de Oportunidades & Formatos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {selectedSession.oportunidades.map((op, idx) => (
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

              {/* TAB 3: POSTS POTENCIAIS */}
              {activeTab === 'conteudo' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      Mapeamento de Conteúdos de Maior Performance
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Nossa consultoria identificou estas 5 estruturas e abordagens de posts que carregam a maior probabilidade de gerar engajamento, tráfego qualificado e compartilhamentos imediatos no seu setor.
                    </p>

                    <div className="space-y-6 pt-4">
                      {selectedSession.conteudosPerformance.map((post, idx) => (
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
                              <p className="text-slate-300 leading-relaxed font-medium">{post.motivo}</p>
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
                </div>
              )}

              {/* TAB 4: HOOKS & IDEIAS */}
              {activeTab === 'hooks' && (
                <div className="space-y-6">
                  
                  {/* Exactly 20 hooks card */}
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
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Cole as frases exatas abaixo nos primeiros 3 segundos do seu Reels ou como título do seu post em carrossel. 
                      Todos foram meticulosamente desenhados com exatamente 10 palavras para abrir loops de curiosidade imediata no cérebro.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                      {selectedSession.hooks.map((hook, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 bg-slate-900/30 hover:bg-slate-900/50 border border-slate-900/60 hover:border-slate-800 rounded-2xl flex items-center justify-between gap-4 group transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-slate-900 text-slate-500 font-bold text-[10px] flex items-center justify-center border border-slate-800 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-200 font-bold font-sans italic truncate" title={hook}>
                              &ldquo;{hook}&rdquo;
                            </span>
                          </div>
                          <button
                            onClick={() => triggerCopy(hook, `hook-${idx}`)}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-indigo-600 border border-slate-900 hover:border-indigo-500 text-slate-400 hover:text-white transition-all shrink-0 cursor-pointer"
                            title="Copiar gancho"
                          >
                            {copiedTextId === `hook-${idx}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exactly 20 Content Ideas */}
                  <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        20 Ideias de Postagens Prontas para Uso
                      </h4>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-950 font-extrabold px-2 py-0.5 rounded-full">
                        Funil Ativo
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pt-2">
                      {selectedSession.ideiasConteudo.map((id, idx) => (
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

              {/* TAB 5: TENDÊNCIAS */}
              {activeTab === 'tendencias' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      5 Tendências de Alto Potencial Viral
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Estruturas de conteúdo dinâmicas, áudios em alta ou tendências de engajamento do mercado traduzidos e adaptados especificamente para a realidade operacional da sua empresa.
                    </p>

                    <div className="space-y-6 pt-4">
                      {selectedSession.tendencias.map((trend, idx) => (
                        <div key={idx} className="p-5 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-3 shadow-sm">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                              <h5 className="text-xs font-bold text-slate-200">{trend.titulo}</h5>
                            </div>
                            <span className="text-[9px] font-extrabold bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">{trend.formato}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
                </div>
              )}

              {/* TAB 6: PLANO 30 DIAS */}
              {activeTab === 'plano' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        Plano Editorial Estratégico de 30 Dias
                      </h4>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-400 font-extrabold px-2 py-0.5 rounded-md">
                        Execução Integrada
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Siga o cronograma diário abaixo. A ordem de publicação foi estruturada estrategicamente para alternar objetivos de atração (descoberta), retenção (relacionamento/autoridade) e conversão em leads comerciais (prova social/venda).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3">
                      {selectedSession.plano30Dias.map((day, idx) => (
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
                </div>
              )}

              {/* TAB 7: RAW REPORT MARKDOWN */}
              {activeTab === 'raw' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        Relatório Executivo Oficial (Markdown)
                      </h4>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => triggerCopy(selectedSession.rawReportMarkdown || "", "report-raw")}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedTextId === "report-raw" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Relatório</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-950/80 border border-slate-900 rounded-2xl overflow-x-auto text-slate-300 font-semibold text-xs leading-relaxed max-h-[600px] overflow-y-auto">
                      <div className="markdown-body">
                        <Markdown>{selectedSession.rawReportMarkdown || ""}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
