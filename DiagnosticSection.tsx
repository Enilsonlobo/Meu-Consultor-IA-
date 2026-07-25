/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { DIAG_QUESTIONS, DiagnosticQuestion } from "../data";
import { CrescerPillars } from "../types";
import { db } from "../firebase";
import { Target, CheckCircle2, AlertCircle, Save, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

interface DiagnosticSectionProps {
  userId: string;
  onComplete: (pillars: CrescerPillars, score: number, answers: Record<string, string>) => void;
  savedAnswers?: Record<string, string>;
}

export const DiagnosticSection: React.FC<DiagnosticSectionProps> = ({ 
  userId, 
  onComplete,
  savedAnswers = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      setAnswers(savedAnswers);
    }
  }, [savedAnswers]);

  const currentQuestion = DIAG_QUESTIONS[currentStep];
  const totalSteps = DIAG_QUESTIONS.length;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const handleSelectOption = (optionLabel: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionLabel
    }));
    setError(null);
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      setError("Por favor, selecione uma opção para continuar.");
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveLater = async () => {
    setError(null);
    setStatusMessage(null);
    try {
      await db.addDoc("diagnostics", {
        userId,
        currentStep,
        answers,
        completed: false,
        updatedAt: new Date().toLocaleDateString('pt-BR')
      });
      setStatusMessage("Progresso salvo com sucesso! Você poderá retomar a qualquer momento.");
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar o progresso temporário.");
    }
  };

  const handleSubmit = async () => {
    if (!answers[currentQuestion.id]) {
      setError("Por favor, responda à última pergunta.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate scores dynamically per pillar
      const compiledPillars: CrescerPillars = {
        conhecimento: 50,
        relacionamento: 50,
        estrategia: 50,
        sistema: 50,
        comunicacao: 50,
        eficiencia: 50,
        resultados: 50
      };

      DIAG_QUESTIONS.forEach(q => {
        const answerLabel = answers[q.id];
        const selectedOption = q.options.find(o => o.label === answerLabel);
        if (selectedOption) {
          compiledPillars[q.pillar] = selectedOption.score;
        }
      });

      // Overall Score is simple average of all pillars
      const totalScore = Math.round(
        (compiledPillars.conhecimento +
          compiledPillars.relacionamento +
          compiledPillars.estrategia +
          compiledPillars.sistema +
          compiledPillars.comunicacao +
          compiledPillars.eficiencia +
          compiledPillars.resultados) / 7
      );

      // Invoke parent handler to sync state, save in database, and trigger report generation
      onComplete(compiledPillars, totalScore, answers);
    } catch (err) {
      console.error(err);
      setError("Erro ao processar as respostas da auditoria.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="diagnostic-section-root" className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Question Progress Header Panel */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400">
              <Target className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">MÉTODO CRESCER™ — Auditoria Executiva</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Avaliação de Maturidade Empresarial</h2>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-widest">Pergunta</span>
            <span className="text-2xl font-black text-white">{currentStep + 1} <span className="text-slate-600 text-sm">/ {totalSteps}</span></span>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Progresso da Auditoria</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 border border-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {statusMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Actual Question & Multiple Choices Grid */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest px-2.5 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/15">
            Pilar: {currentQuestion.pillar}
          </span>
          <h3 className="text-lg md:text-xl font-bold text-white leading-snug pt-1">
            {currentQuestion.questionText}
          </h3>
        </div>

        {/* Options choices list */}
        <div className="space-y-3.5">
          {currentQuestion.options.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.label;
            return (
              <button
                id={`diag-option-${opt.label}`}
                key={opt.label}
                onClick={() => handleSelectOption(opt.label)}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all outline-none ${
                  isSelected 
                    ? "bg-indigo-600/10 border-indigo-500 text-white shadow-md shadow-indigo-600/5" 
                    : "bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? "border-indigo-500 text-indigo-500" : "border-slate-700"
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-sm leading-none">{opt.label}</p>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Save Later Action */}
        <button
          id="btn-diag-save-later"
          onClick={handleSaveLater}
          className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-bold rounded-xl border border-slate-800 flex items-center justify-center gap-2 transition-all order-3 sm:order-1"
        >
          <Save className="w-4 h-4" />
          <span>Salvar para Continuar Depois</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
          {/* Back button */}
          <button
            id="btn-diag-back"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex-1 sm:flex-initial px-5 py-3 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-950 text-slate-400 disabled:text-slate-700 text-xs font-bold rounded-xl border border-slate-800 disabled:border-slate-950 flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {/* Next / Submit button */}
          {currentStep < totalSteps - 1 ? (
            <button
              id="btn-diag-next"
              onClick={handleNext}
              className="flex-1 sm:flex-initial px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-diag-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? "Processando..." : "Concluir Diagnóstico"}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
