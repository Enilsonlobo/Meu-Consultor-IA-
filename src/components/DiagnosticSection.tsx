import React, { useEffect, useMemo, useState } from "react";
import { DIAG_QUESTIONS } from "../data";
import type { CrescerPillars } from "../types";
import { db } from "../firebase";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

interface DiagnosticSectionProps {
  userId: string;
  onComplete: (pillars: CrescerPillars, score: number, answers: Record<string, string>) => void;
  savedAnswers?: Record<string, string>;
}

const pillarNames: Record<keyof CrescerPillars, string> = {
  conhecimento: "Conhecimento do cliente",
  relacionamento: "Relacionamento",
  estrategia: "Estratégia comercial",
  sistema: "Gestão e sistemas",
  comunicacao: "Comunicação e marketing",
  eficiencia: "Eficiência operacional",
  resultados: "Resultados e lucratividade",
};

export const DiagnosticSection: React.FC<DiagnosticSectionProps> = ({
  userId,
  onComplete,
  savedAnswers = {},
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (Object.keys(savedAnswers).length > 0) setAnswers(savedAnswers);
  }, [savedAnswers]);

  const currentQuestion = DIAG_QUESTIONS[currentStep];
  const totalSteps = DIAG_QUESTIONS.length;
  const answeredCount = Object.keys(answers).filter((id) => Boolean(answers[id])).length;
  const progressPercent = Math.round((answeredCount / totalSteps) * 100);
  const isLastQuestion = currentStep === totalSteps - 1;
  const selectedAnswer = answers[currentQuestion.id];

  const answeredSteps = useMemo(
    () => DIAG_QUESTIONS.map((question) => Boolean(answers[question.id])),
    [answers]
  );

  function handleSelectOption(optionLabel: string) {
    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: optionLabel }));
    setError(null);
    setStatusMessage(null);
  }

  function handleNext() {
    if (!selectedAnswer) {
      setError("Selecione a alternativa que melhor representa a realidade atual da empresa.");
      return;
    }
    if (!isLastQuestion) {
      setCurrentStep((step) => step + 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSaveLater() {
    setError(null);
    setStatusMessage(null);
    setIsSaving(true);
    try {
      await db.addDoc("diagnostics", {
        userId,
        currentStep,
        answers,
        completed: false,
        updatedAt: new Date().toLocaleDateString("pt-BR"),
      });
      setStatusMessage("Progresso salvo. Você poderá continuar o diagnóstico depois.");
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar o progresso neste momento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit() {
    if (!selectedAnswer) {
      setError("Responda à última pergunta para concluir o diagnóstico.");
      return;
    }

    const missingQuestion = DIAG_QUESTIONS.find((question) => !answers[question.id]);
    if (missingQuestion) {
      const missingIndex = DIAG_QUESTIONS.findIndex((question) => question.id === missingQuestion.id);
      setCurrentStep(missingIndex);
      setError("Existe uma pergunta sem resposta. Complete-a para gerar o relatório.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const totals: Record<keyof CrescerPillars, number[]> = {
        conhecimento: [],
        relacionamento: [],
        estrategia: [],
        sistema: [],
        comunicacao: [],
        eficiencia: [],
        resultados: [],
      };

      DIAG_QUESTIONS.forEach((question) => {
        const selectedOption = question.options.find((option) => option.label === answers[question.id]);
        if (selectedOption) totals[question.pillar].push(selectedOption.score);
      });

      const compiledPillars = Object.keys(totals).reduce((result, key) => {
        const pillar = key as keyof CrescerPillars;
        const values = totals[pillar];
        result[pillar] = values.length
          ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
          : 0;
        return result;
      }, {} as CrescerPillars);

      const pillarScores = Object.values(compiledPillars).map(Number);
      const totalScore = Math.round(
        pillarScores.reduce((sum, value) => sum + value, 0) / pillarScores.length
      );

      await Promise.resolve(onComplete(compiledPillars, totalScore, answers));
    } catch (err) {
      console.error(err);
      setError("Não foi possível concluir o diagnóstico. Tente novamente.");
      setIsSubmitting(false);
    }
  }

  return (
    <div id="diagnostic-section-root" className="max-w-6xl mx-auto p-5 md:p-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="relative z-10 grid lg:grid-cols-[1fr_280px] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">
              <Target className="h-3.5 w-3.5" /> Método CRESCER™ 2.0
            </div>
            <h1 className="mt-4 text-2xl md:text-4xl font-black tracking-tight text-white">
              Diagnóstico de maturidade empresarial
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              Responda com sinceridade. O sistema analisará sete áreas do negócio e criará um relatório executivo com prioridades e plano de ação.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-[11px] font-bold text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Respostas privadas
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                <ClipboardCheck className="h-4 w-4 text-indigo-400" /> Relatório personalizado
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Progresso geral</p>
                <p className="mt-2 text-3xl font-black text-white">{progressPercent}%</p>
              </div>
              <p className="text-xs font-bold text-indigo-300">{answeredCount} de {totalSteps}</p>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Tempo estimado restante: {Math.max(1, totalSteps - answeredCount)} minuto(s).
            </p>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">
        <aside className="rounded-3xl border border-slate-800 bg-slate-950 p-4 lg:sticky lg:top-6">
          <p className="px-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Etapas da análise</p>
          <div className="mt-4 space-y-2">
            {DIAG_QUESTIONS.map((question, index) => {
              const active = index === currentStep;
              const completed = answeredSteps[index];
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-transparent hover:border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                      completed ? "bg-emerald-500/10 text-emerald-400" : active ? "bg-indigo-500 text-white" : "bg-slate-900 text-slate-600"
                    }`}>
                      {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className={`text-[11px] font-bold leading-tight ${active ? "text-white" : "text-slate-500"}`}>
                      {pillarNames[question.pillar]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          {statusMessage && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {statusMessage}
            </div>
          )}

          <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                {pillarNames[currentQuestion.pillar]}
              </span>
              <span className="text-xs font-black text-slate-500">Pergunta {currentStep + 1} de {totalSteps}</span>
            </div>

            <h2 className="mt-5 text-xl md:text-2xl font-black leading-snug text-white">
              {currentQuestion.questionText.replace(/^\d+\.\s*/, "")}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Escolha a alternativa mais próxima da realidade atual, não da situação ideal.
            </p>

            <div className="mt-7 grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option.label;
                return (
                  <button
                    id={`diag-option-${currentQuestion.id}-${index}`}
                    key={option.label}
                    type="button"
                    onClick={() => handleSelectOption(option.label)}
                    className={`group w-full rounded-2xl border p-4 md:p-5 text-left transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-600/5"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-black ${
                        isSelected ? "border-indigo-400 bg-indigo-500 text-white" : "border-slate-700 text-slate-500"
                      }`}>
                        {isSelected ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                      </span>
                      <div>
                        <p className={`text-sm font-black ${isSelected ? "text-white" : "text-slate-300"}`}>{option.label}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">{option.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <button
              id="btn-diag-save-later"
              type="button"
              onClick={handleSaveLater}
              disabled={isSaving || isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-xs font-bold text-slate-400 transition hover:border-slate-700 hover:text-white disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar e continuar depois"}
            </button>

            <div className="flex gap-3">
              <button
                id="btn-diag-back"
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-xs font-black text-slate-400 transition hover:text-white disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>

              {!isLastQuestion ? (
                <button
                  id="btn-diag-next"
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-black text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  id="btn-diag-submit"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-black text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isSubmitting ? "Gerando relatório..." : "Concluir e gerar relatório"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
