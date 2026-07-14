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
  conhecimento: number;    // 0-100
  relacionamento: number;  // 0-100
  estrategia: number;      // 0-100
  sistema: number;         // 0-100
  comunicacao: number;     // 0-100
  eficiencia: number;      // 0-100
  resultados: number;      // 0-100
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
  scoreCrescer: number; // overall average of the pillars
  ultimoAcesso: string;
  ultimoDiagnostico: string;
  plan: 'Membro' | 'Premium' | 'Enterprise';
  createdAt: string;
  pillars?: CrescerPillars;
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
  answers: Record<string, string>; // questionId -> response value
  scoreCrescer: number;
  pillars: CrescerPillars;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  report?: string; // Markdown formatted corporate report
}

export interface CompetitionAnalysis {
  id: string;
  userId: string;
  empresa: string;
  segmento: string;
  cidade: string;
  analysisText: string; // Markdown formatted report
  createdAt: string;
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
