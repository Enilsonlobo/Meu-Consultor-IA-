/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, ArrowRight, CheckCircle, Award, Target, Landmark, Shield, BarChart3, Users } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">
      
      {/* Decorative gradient background blur effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <header className="border-b border-slate-800/80 px-6 py-4 relative z-10 backdrop-blur-md bg-slate-900/60 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block leading-none">
                Meu Consultor IA<span className="text-indigo-500">®</span>
              </span>
              <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block mt-1">
                Estratégia Empresarial Premium
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-nav-login"
              onClick={onLogin}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Área do Cliente
            </button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative z-10 py-20 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/5 text-indigo-400 text-xs font-semibold border border-indigo-500/10 tracking-wide"
          >
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>SISTEMA EXCLUSIVO PARA MICRO E PEQUENAS EMPRESAS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white"
          >
            Empresas não crescem <span className="font-serif italic font-normal text-slate-400 block sm:inline">por acaso.</span><br />
            <span className="text-xl sm:text-2xl md:text-3xl font-semibold block text-indigo-400 mt-4 max-w-3xl mx-auto leading-relaxed">
              Crescem quando tomam decisões melhores.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed font-semibold tracking-wide"
          >
            O <strong>Meu Consultor IA®</strong> é um ecossistema inteligente de alta performance. Analise gargalos operacionais no método CRESCER™, automatize o padrão de atendimento do seu WhatsApp e domine o Google Meu Negócio de forma prática e descomplicada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              id="btn-hero-cta"
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2.5 group transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <span>Acessar Plataforma</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 py-16 bg-slate-950/60 border-y border-slate-800/60 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Tecnologia Corporativa ao seu Alcance</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Tudo que sua empresa precisa para otimizar vendas, processos, margem e atração em canais digitais.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all space-y-4">
              <div className="p-3 bg-indigo-600/10 text-indigo-400 w-12 h-12 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Método CRESCER™</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Avalie os 7 pilares fundamentais do seu negócio: Conhecimento, Relacionamento, Estratégia, Sistema, Comunicação, Eficiência e Resultados.
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all space-y-4">
              <div className="p-3 bg-purple-600/10 text-purple-400 w-12 h-12 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Conselhos de Elite</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Interaja com uma inteligência especializada em WhatsApp Business, Google Business, fluxo de caixa e gestão operacional de varejo e serviços.
              </p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all space-y-4">
              <div className="p-3 bg-pink-600/10 text-pink-400 w-12 h-12 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Relatórios Executivos</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Após diagnosticar, gere planos de ação detalhados com prioridades estratégicas, Cronograma de 30 dias e KPIs acionáveis imediatos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing table */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Acesso Completo & Sem Complicações</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Apenas um formato de plano simples e transparente para impulsionar sua jornada rumo ao topo.</p>
          </div>

          <div className="max-w-md mx-auto">
            {/* Single Premium plan */}
            <div className="p-8 bg-indigo-950/30 border-2 border-indigo-500 rounded-3xl flex flex-col justify-between relative shadow-2xl shadow-indigo-500/10">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-indigo-600 text-[10px] font-bold uppercase tracking-widest text-white rounded-full">
                ACESSO TOTAL
              </span>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-xl text-white">Plano Consultor IA Premium</h3>
                    <p className="text-slate-400 text-xs mt-1">Todas as ferramentas estratégicas e gerador de artes premium em um só lugar.</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-1.5 py-2">
                  <span className="text-4xl font-black text-white">R$ 49,90</span>
                  <span className="text-xs text-slate-500 font-bold">/mês</span>
                </div>
                
                <hr className="border-indigo-900/60" />
                
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Diagnóstico da empresa</strong> completo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Consultor de IA corporativo</strong> (24/7)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Método CRESCER™</strong> em 7 pilares</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Marketing Estratégico</strong> direcionado</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Vendas Estratégicas</strong> de alta conversão</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>WhatsApp Business</strong> e roteiros comerciais</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Google Business Profile</strong> otimizado</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Radar da Concorrência</strong> local</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Estúdio de posts de luxo</strong> com IA</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Planos de ação de 30 dias</strong> práticos</span>
                  </li>
                </ul>
              </div>
              
              <button
                id="btn-pricing-premium-single"
                onClick={onLogin}
                className="mt-8 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 uppercase tracking-wider cursor-pointer"
              >
                Acessar Plataforma
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Meu Consultor IA®. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>Segurança garantida via Firebase Authentication</span>
          </p>
        </div>
      </footer>

    </div>
  );
};
