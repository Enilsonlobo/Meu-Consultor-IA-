/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CrescerPillars } from "../types";
import { 
  Sparkles, 
  FileText, 
  Printer, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Activity, 
  Award, 
  RefreshCw,
  TrendingDown
} from "lucide-react";

interface ReportViewerProps {
  pillars: CrescerPillars;
  score: number;
  empresa: string;
  segmento: string;
  cidade: string;
  onRestart: () => void;
  savedReportMarkdown?: string;
}

const renderMarkdownToReact = (markdown: string) => {
  const lines = markdown.split("\n");
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const renderedElements: React.ReactNode[] = [];

  const parseBoldText = (text: string) => {
    const parts = text.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-white font-extrabold">{part}</strong>;
      }
      return part;
    });
  };

  const flushTable = (index: number) => {
    if (tableRows.length > 0 || tableHeaders.length > 0) {
      renderedElements.push(
        <div key={`table-${index}`} className="my-6 overflow-x-auto border border-slate-900 rounded-2xl bg-slate-900/20">
          <table className="w-full text-left text-xs">
            {tableHeaders.length > 0 && (
              <thead className="bg-slate-900/80 text-slate-400 font-extrabold uppercase tracking-wider">
                <tr>
                  {tableHeaders.map((th, i) => (
                    <th key={i} className="px-5 py-3.5 border-b border-slate-900">{parseBoldText(th)}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-900 font-semibold text-slate-300">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-5 py-3.5">{parseBoldText(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
    }
    inTable = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check if we are inside a table
    if (trimmed.startsWith("|")) {
      inTable = true;
      const parts = trimmed.split("|").map(p => p.trim()).filter((p, i, arr) => i > 0 && i < arr.length - 1);
      
      // Skip separator row (e.g. | :--- | :--- |)
      if (parts.every(p => p.startsWith(":") || p.startsWith("-") || p.endsWith("-") || p === "")) {
        return;
      }

      if (tableHeaders.length === 0) {
        tableHeaders = parts;
      } else {
        tableRows.push(parts);
      }
      return;
    } else if (inTable) {
      flushTable(index);
    }

    // Headers
    if (trimmed.startsWith("###")) {
      const text = trimmed.replace("###", "").trim();
      renderedElements.push(
        <h4 key={index} className="text-xs font-black text-indigo-400 uppercase tracking-widest mt-6 mb-2">
          {parseBoldText(text)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("##")) {
      const text = trimmed.replace("##", "").trim();
      renderedElements.push(
        <h3 key={index} className="text-sm font-extrabold text-white border-l-4 border-indigo-500 pl-3 uppercase tracking-wider mt-8 mb-4 print:text-slate-950">
          {parseBoldText(text)}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("#") || trimmed.startsWith("📊")) {
      const text = trimmed.replace("#", "").trim();
      renderedElements.push(
        <h2 key={index} className="text-base md:text-lg font-black text-white uppercase tracking-wider border-b border-slate-900 pb-2.5 mt-8 mb-4 print:text-slate-950 print:border-slate-200">
          {parseBoldText(text)}
        </h2>
      );
      return;
    }

    // Task items/Checklists
    if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
      const checked = trimmed.startsWith("- [x]");
      const text = trimmed.replace(checked ? "- [x]" : "- [ ]", "").trim();
      renderedElements.push(
        <div key={index} className="flex items-start gap-3 p-3.5 my-2 bg-slate-900/40 border border-slate-900 rounded-xl">
          <div className="shrink-0 mt-0.5">
            {checked ? (
              <span className="text-emerald-400 font-bold">✓</span>
            ) : (
              <div className="w-4 h-4 rounded border border-slate-700 bg-slate-950 flex items-center justify-center text-[10px] text-slate-500 font-black">☐</div>
            )}
          </div>
          <p className="text-xs text-slate-300 font-semibold leading-relaxed">{parseBoldText(text)}</p>
        </div>
      );
      return;
    }

    // Star/Rating line
    if (trimmed.includes("★")) {
      renderedElements.push(
        <p key={index} className="text-xs text-amber-400 font-bold my-1 tracking-wider">
          {trimmed}
        </p>
      );
      return;
    }

    // Bullet list items
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const text = trimmed.substring(1).trim();
      renderedElements.push(
        <div key={index} className="flex items-start gap-2 text-xs text-slate-300 font-semibold my-1.5 pl-2 leading-relaxed">
          <span className="text-indigo-400 shrink-0">•</span>
          <span>{parseBoldText(text)}</span>
        </div>
      );
      return;
    }

    // Separators or double separators
    if (trimmed.startsWith("===") || trimmed.startsWith("---") || trimmed.startsWith("___")) {
      renderedElements.push(
        <hr key={index} className="border-slate-900 my-6 print:border-slate-200" />
      );
      return;
    }

    // Blank lines
    if (trimmed === "") {
      return;
    }

    renderedElements.push(
      <p key={index} className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed my-3 print:text-slate-800">
        {parseBoldText(line)}
      </p>
    );
  });

  if (inTable) {
    flushTable(lines.length);
  }

  return <div className="space-y-4">{renderedElements}</div>;
};

export const ReportViewer: React.FC<ReportViewerProps> = ({
  pillars,
  score,
  empresa,
  segmento,
  cidade,
  onRestart,
  savedReportMarkdown
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Dynamically analyze pillars to pick strengths and weaknesses
  const pillarArray = Object.entries(pillars).map(([key, val]) => ({ key, val: val as number }));
  const sortedPillars = [...pillarArray].sort((a, b) => b.val - a.val);
  const strengths = sortedPillars.slice(0, 2);
  const weaknesses = sortedPillars.slice(-2);

  const getPillarLabel = (key: string) => {
    const labels: Record<string, string> = {
      conhecimento: "Conhecimento (Cliente)",
      relacionamento: "Relacionamento (Pós-Venda)",
      estrategia: "Estratégia (Metas)",
      sistema: "Sistema (Controle/Finanças)",
      comunicacao: "Comunicação (Presença Ativa)",
      eficiencia: "Eficiência (Processos)",
      resultados: "Resultados (Lucratividade)"
    };
    return labels[key] || key;
  };

  const getWeaknessRecommendation = (key: string) => {
    const recs: Record<string, string> = {
      conhecimento: "Implementar uma pesquisa regular NPS mensal automática pós-compra e arquivar feedbacks de comportamento.",
      relacionamento: "Construir uma régua de pós-venda ativa via WhatsApp Business oferecendo ofertas e novidades recorrentes a cada 20 dias.",
      estrategia: "Sentar com a liderança para projetar o faturamento-alvo dos próximos 6 meses com limites rígidos de custos fixos.",
      sistema: "Migrar o fluxo de caixa físico ou planilha básica para um sistema de gestão integrado ERP (como Conta Azul ou Bling) com conciliação diária.",
      comunicacao: "Montar calendário de postagens estruturado (2 postagens/semana no Instagram) e obter de forma ativa 3 avaliações novas no Google Business por semana.",
      eficiencia: "Padronizar as duas tarefas operacionais mais recorrentes em playbooks visuais de no máximo 1 página para treinar a equipe.",
      resultados: "Calcular a margem real de contribuição de cada produto/serviço considerando taxas, impostos e custos indiretos, reajustando os preços com menor margem."
    };
    return recs[key] || "Otimizar processos operacionais diários.";
  };

  return (
    <div id="report-viewer-root" className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 printing:bg-white printing:text-slate-900">
      
      {/* Top Menu Actions - Invisible during print */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-4 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-extrabold text-white">Relatório Corporativo de Auditoria</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
          
          <button
            id="btn-restart-diagnostico"
            onClick={onRestart}
            className="px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-xs font-bold border border-indigo-500/10 flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Nova Auditoria</span>
          </button>
        </div>
      </div>

      {/* Main Corporate Document Styling */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-8 md:p-12 space-y-10 shadow-2xl relative overflow-hidden print:bg-white print:border-none print:shadow-none print:p-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Corporate Letterhead Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-900 pb-8 print:border-slate-200">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-2.5 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-black text-white text-xl tracking-tight print:text-slate-950">Meu Consultor IA®</span>
            </div>
            <p className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">
              Relatório Executivo Premium — Método CRESCER™
            </p>
          </div>

          <div className="text-xs text-slate-400 space-y-1 text-left sm:text-right font-medium">
            <p className="text-white font-bold print:text-slate-900">Empresa: {empresa || "Não Informada"}</p>
            <p>Segmento: {segmento || "Não Informado"}</p>
            <p>Cidade: {cidade || "Não Informada"}</p>
            <p>Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Executive Summary Metrics Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-900 rounded-2xl space-y-1.5 print:bg-slate-100 print:border-slate-200">
            <div className="flex items-center gap-2 text-slate-400">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Índice Geral de Maturidade</span>
            </div>
            <p className="text-3xl font-black text-white print:text-slate-950">{score}%</p>
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mt-1">Método CRESCER™</span>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-900 rounded-2xl space-y-1.5 print:bg-slate-100 print:border-slate-200">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Pilar de Destaque</span>
            </div>
            <p className="text-sm font-extrabold text-emerald-400 truncate capitalize">{getPillarLabel(strengths[0].key)}</p>
            <span className="text-xs text-slate-400 font-semibold">{strengths[0].val}% de aproveitamento</span>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-900 rounded-2xl space-y-1.5 print:bg-slate-100 print:border-slate-200">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Ponto Crítico</span>
            </div>
            <p className="text-sm font-extrabold text-rose-400 truncate capitalize">{getPillarLabel(weaknesses[0].key)}</p>
            <span className="text-xs text-slate-400 font-semibold">{weaknesses[0].val}% de aproveitamento</span>
          </div>
        </div>

        {savedReportMarkdown ? (
          <div className="space-y-6 pt-4">
            {renderMarkdownToReact(savedReportMarkdown)}
          </div>
        ) : (
          <>
            {/* Section 1: Executive Summary Text */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-white border-l-4 border-indigo-500 pl-3 print:text-slate-950 print:border-slate-800 uppercase tracking-wider">
                1. Resumo Executivo
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium print:text-slate-800">
                A empresa <strong>{empresa}</strong> passou pela auditoria empresarial baseada no Método CRESCER™, pontuando <strong>{score}%</strong> no índice geral de maturidade. 
                {score >= 80 
                  ? " O negócio demonstra uma infraestrutura operacional e estratégica sólida, com processos bem delimitados. Os próximos passos residem na automação avançada de processos e estratégias inovadoras de canais digitais de tração."
                  : score >= 50 
                  ? " A organização se encontra em um patamar intermediário de estruturação empresarial. Embora possua canais comerciais funcionais, há gargalos latentes de processos em marketing digital ativo e reconciliação financeira sistêmica."
                  : " O resultado acende um sinal de alerta operacional crítico. A empresa opera sob forte dependência de intuição operacional, carecendo de playbooks básicos de equipe, controle sistêmico de fluxo de caixa e automação pós-venda ativa."
                }
              </p>
            </div>

            {/* Section 2: Core Diagnostic Breakdown */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-white border-l-4 border-indigo-500 pl-3 print:text-slate-950 print:border-slate-800 uppercase tracking-wider">
                2. Detalhamento dos Pilares (Método CRESCER™)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(pillars).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center justify-between text-xs print:bg-slate-50 print:border-slate-200">
                    <span className="font-bold text-slate-300 capitalize print:text-slate-800">{getPillarLabel(key)}</span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0 print:bg-slate-200">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${value}%` }} />
                      </div>
                      <span className="font-extrabold text-white print:text-slate-900">{value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3.5">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Pontos Fortes
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800 font-medium">
                  {strengths.map(s => (
                    <li key={s.key} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl leading-relaxed">
                      <strong>{getPillarLabel(s.key)}:</strong> Sua empresa demonstra competência superior nesta vertical, com maturidade operacional pontuada em {s.val}%. Use este pilar como alavanca de diferenciação.
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3.5">
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Gargalos & Pontos Fracos
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800 font-medium">
                  {weaknesses.map(w => (
                    <li key={w.key} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl leading-relaxed">
                      <strong>{getPillarLabel(w.key)} ({w.val}%):</strong> Esta vertical atua como um limitador de crescimento direto do faturamento. Requer ação estratégica corretiva com prioridade imediata.
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 4: Action Plan & Quick Wins */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-white border-l-4 border-indigo-500 pl-3 print:text-slate-950 print:border-slate-800 uppercase tracking-wider">
                3. Plano de Ação & Cronograma de 30 Dias (Quick Wins)
              </h3>
              
              <div className="space-y-3">
                <div className="p-5 bg-slate-900 border border-slate-900 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
                  <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest block">Cronograma Imediato (Dias 1 a 15)</span>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed print:text-slate-800">
                    <strong>Foco em {getPillarLabel(weaknesses[0].key)}:</strong> {getWeaknessRecommendation(weaknesses[0].key)}
                  </p>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-900 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
                  <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest block">Próximos Passos (Dias 16 a 30)</span>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed print:text-slate-800">
                    <strong>Foco em {getPillarLabel(weaknesses[1].key)}:</strong> {getWeaknessRecommendation(weaknesses[1].key)}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: KPIs and Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Indicadores de Desempenho (KPIs)</h4>
                <div className="p-4 bg-slate-900/60 border border-slate-900 rounded-xl text-xs text-slate-300 print:bg-slate-50 print:border-slate-200">
                  <ul className="list-disc pl-4 space-y-1.5 leading-relaxed font-medium">
                    <li>Taxa de conversão de leads no WhatsApp</li>
                    <li>NPS médio de satisfação do cliente ({'>'} 75)</li>
                    <li>Margem líquida por canal de atração</li>
                    <li>Redução de tempo gasto em rotinas operacionais</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Próximos Passos Recomendados</h4>
                <div className="p-4 bg-slate-900/60 border border-slate-900 rounded-xl text-xs text-slate-300 print:bg-slate-50 print:border-slate-200">
                  <p className="leading-relaxed font-medium">
                    Sugerimos acionar seu <strong>Consultor IA®</strong> no menu lateral informando o resultado da vertical <strong>{getPillarLabel(weaknesses[0].key)}</strong> para detalhar o roteiro passo a passo e o roteiro de scripts de equipe de forma imediata.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Closing Signature Footer */}
        <div className="border-t border-slate-900 pt-8 flex justify-between items-center text-[10px] text-slate-500 font-bold print:border-slate-200">
          <span>DOCUMENTO OFICIAL DE AUDITORIA EMPRESARIAL</span>
          <span>SaaS MEU CONSULTOR IA®</span>
        </div>

      </div>

    </div>
  );
};
