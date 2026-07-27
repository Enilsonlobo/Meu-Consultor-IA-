/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Consultant {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatarColor: string;
  iconName: string;
  bio: string;
  suggestedPrompts: string[];
  initialMessage: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface CrescerPillars {
  conhecimento: number;
  relacionamento: number;
  estrategia: number;
  sistema: number;
  comunicacao: number;
  eficiencia: number;
  resultados: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  empresa: string;
  segmento: string;
  cidade: string;
  telefone: string;
  funcionarios: string;
  faturamento: string;
  objetivos: string;
  scoreCrescer: number;
  ultimoAcesso: string;
  ultimoDiagnostico: string;
  plan: 'Membro' | 'Premium' | 'Enterprise';
  createdAt: string;
  pillars?: CrescerPillars;
  hasCompletedInitialDiag?: boolean;
  initialDiagAnswers?: {
    empresa: string;
    segmento: string;
    mercado: string;
    cidade: string;
    uf: string;
    publicoPredominante: string;
    principalObjetivo: string;
    maiorGargalo: string;
    nivelMaturidadeDigital: number;
    nivelOrganizacaoComercial: number;
    prioridadeEstrategica: string;
  };
  initialDiagReport?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  lastUpdated: string;
  messages: Message[];
}

export interface DiagnosticSession {
  id: string;
  userId: string;
  currentStep: number;
  answers: Record<string, string>;
  scoreCrescer: number;
  pillars: CrescerPillars;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  report?: string;
}

export interface CompetitionAnalysis {
  id: string;
  userId: string;
  empresa: string;
  segmento: string;
  cidade: string;
  analysisText: string;
  createdAt: string;
}

export type ActionTaskStatus = 'todo' | 'doing' | 'done';
export type ActionTaskPriority = 'alta' | 'media' | 'baixa';
export type ActionTaskSource = 'diagnostico' | 'instagram' | 'manual';

export interface ActionPlanTask {
  id: string;
  userId: string;
  title: string;
  description: string;
  pillar: keyof CrescerPillars | 'marketing' | 'vendas' | 'gestao';
  status: ActionTaskStatus;
  priority: ActionTaskPriority;
  source: ActionTaskSource;
  dueDate: string;
  checklist: Array<{ id: string; text: string; done: boolean }>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface InstagramAuditSession {
  id: string;
  userId: string;
  username: string;
  empresa: string;
  segmento: string;
  publicoAlvo: string;
  desafio: string;
  scoreGeral: number;
  diagnostico: {
    bio: number;
    foto: number;
    nomePerfil: number;
    nomeUsuario: number;
    destaques: number;
    frequencia: number;
    identidadeVisual: number;
    posicionamento: number;
    clarezaOferta: number;
    cta: number;
    propostaValor: number;
  };
  pontosFortes: string[];
  pontosAtencao: string[];
  oportunidades: string[];
  estrategiaRecomendada: string;
  conteudosPerformance: Array<{
    tema: string;
    formato: string;
    objetivo: string;
    motivo: string;
    emocao: string;
    gatilho: string;
    replicacao: string;
  }>;
  hooks: string[];
  ideiasConteudo: Array<{
    titulo: string;
    formato: string;
    objetivo: string;
    gancho: string;
    cta: string;
  }>;
  tendencias: Array<{
    titulo: string;
    porQueFunciona: string;
    comoAdaptar: string;
    formato: string;
    comoAumentarRetencao: string;
    comoConverter: string;
  }>;
  plano30Dias: Array<{
    dia: number;
    tarefa: string;
    tipo: 'descoberta' | 'consideracao' | 'autoridade' | 'relacionamento' | 'prova_social' | 'conversao';
  }>;
  gargalos: Array<{
    titulo: string;
    impacto: string;
  }>;
  published: boolean;
  createdAt: string;
  rawReportMarkdown?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDiagnostics: number;
  totalChats: number;
  aiTokensUsed: number;
  planPremiumCount: number;
  planEnterpriseCount: number;
  planMembroCount: number;
}
