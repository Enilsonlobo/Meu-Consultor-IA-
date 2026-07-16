/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Consultant } from "./types";

export interface DiagnosticQuestion {
  id: string;
  pillar: 'conhecimento' | 'relacionamento' | 'estrategia' | 'sistema' | 'comunicacao' | 'eficiencia' | 'resultados';
  questionText: string;
  options: {
    label: string;
    score: number;
    description: string;
  }[];
}

export const DIAG_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "q-conhecimento-1",
    pillar: "conhecimento",
    questionText: "1. Monitoramento do Cliente: Como a sua empresa monitora e gerencia ativamente a satisfação, necessidades latentes e reclamações do público-alvo?",
    options: [
      { label: "Nível Reativo / Nulo", score: 25, description: "Inexistência de canais de escuta ativa. Só tomamos conhecimento de falhas ou insatisfação quando há reclamações públicas ou quando o cliente interrompe as compras definitivamente." },
      { label: "Nível Informal / Verbal", score: 55, description: "Feedback coletado de maneira verbal e esporádica durante o atendimento presencial ou WhatsApp, sem qualquer arquivamento, cruzamento de dados ou padronização de tratamento de insatisfações." },
      { label: "Nível Estruturado / NPS", score: 85, description: "Pesquisas de satisfação periódicas e estruturadas (ex: Net Promoter Score - NPS) enviadas de forma recorrente e documentada, gerando relatórios de melhoria para os processos internos." },
      { label: "Nível de Elite / CRM Omnichannel", score: 100, description: "Banco de dados e CRM unificados com registro completo de hábitos de consumo, feedbacks detalhados de cada cliente e inteligência preditiva para identificar e solucionar dores antes de uma reclamação." }
    ]
  },
  {
    id: "q-relacionamento-2",
    pillar: "relacionamento",
    questionText: "2. Relacionamento & Pós-Venda: De que forma sua empresa cultiva a fidelização, relacionamento e recompra através de canais digitais ativos?",
    options: [
      { label: "Nulo ou Inexistente", score: 20, description: "Não realizamos pós-venda estratégico. Todo o foco operacional, de tempo e de orçamento está voltado exclusivamente para atrair o próximo cliente de primeira compra." },
      { label: "Suporte Reativo", score: 50, description: "Mantemos contato passivo; apenas respondemos a dúvidas ou solicitações se o próprio cliente entrar em contato de forma espontânea pelo WhatsApp ou Redes Sociais." },
      { label: "Relacionamento Ativo Planejado", score: 80, description: "Iniciativa ativa periódica de contato por meio de listas de transmissão organizadas, enviando cupons de aniversário personalizados, ofertas específicas de recompra e novidades mensais." },
      { label: "Fidelidade VIP Multicanal", score: 100, description: "Régua automatizada de pós-venda integrada no CRM com acompanhamento pós-entrega, pesquisas de satisfação individuais, clube de benefícios VIP exclusivo e programa de indicação ativo e bonificado." }
    ]
  },
  {
    id: "q-estrategia-3",
    pillar: "estrategia",
    questionText: "Sua empresa possui metas claras de faturamento e custos para os próximos 6 meses?",
    options: [
      { label: "Intuição Pura", score: 20, description: "Não temos metas definidas. Apenas trabalhamos para pagar as contas." },
      { label: "Metas de Cabeça", score: 50, description: "Temos ideias do que faturar, mas nada escrito ou planejado em planilhas." },
      { label: "Planejado e Compartilhado", score: 85, description: "Metas definidas em planilha, divididas por metas diárias/semanais de vendas." },
      { label: "Engrenagem de Metas", score: 100, description: "Metas divididas por canal e produto, com plano de ação desenhado para atingir cada KPI de faturamento." }
    ]
  },
  {
    id: "q-sistema-4",
    pillar: "sistema",
    questionText: "Como é feito o controle do fluxo de caixa e finanças diárias no seu negócio?",
    options: [
      { label: "Caótico ou Papel", score: 15, description: "Não há registro estruturado ou uso caderno de anotações misturando contas pessoais e da empresa." },
      { label: "Planilha Básica", score: 60, description: "Planilha de Excel básica onde registro as saídas e entradas principais no fim da semana." },
      { label: "Sistema de Gestão (ERP)", score: 85, description: "Utilizamos software de gestão financeira integrada (ex: Conta Azul, Bling, etc.) diariamente." },
      { label: "Gestão de Caixa de Elite", score: 100, description: "Sistema online completo atualizado diariamente com conciliação bancária rigorosa e DRE gerado automaticamente." }
    ]
  },
  {
    id: "q-comunicacao-5",
    pillar: "comunicacao",
    questionText: "Qual o nível de presença ativa da sua empresa no Google Business, Instagram e redes sociais?",
    options: [
      { label: "Fantasma Digital", score: 10, description: "Temos o perfil criado mas quase nunca postamos ou o Google Business está abandonado/sem avaliações." },
      { label: "Presença Esporádica", score: 50, description: "Postamos quando sobra tempo e respondemos o direct em até 24 horas." },
      { label: "Presença Planejada", score: 80, description: "Postagens estruturadas 2 a 3 vezes por semana e canal do Google Business atualizado e respondido." },
      { label: "Máquina de Conteúdo", score: 100, description: "Calendário de conteúdo magnético, Google Business com notas altas e avaliações semanais, e anúncios ativos nas redes." }
    ]
  },
  {
    id: "q-eficiencia-6",
    pillar: "eficiencia",
    questionText: "De que forma a equipe ou você organiza as atividades diárias para evitar gargalos e perda de tempo?",
    options: [
      { label: "Bombeiro Diário", score: 20, description: "Apenas 'apagamos incêndios'. Não há padrão de tarefas claras." },
      { label: "Listas de Tarefas", score: 50, description: "Cada um anota o que fazer no dia, mas sem controle unificado de gargalos." },
      { label: "Gestão Visual", score: 85, description: "Utilizamos quadros Kanban (Trello, ClickUp ou físico) com fluxos claros de demandas." },
      { label: "Processos Padronizados", score: 100, description: "Processos documentados em manuais (playbooks) fáceis de treinar com responsabilidade clara de cada colaborador." }
    ]
  },
  {
    id: "q-resultados-7",
    pillar: "resultados",
    questionText: "Sua empresa acompanha regularmente a margem de lucro real de cada produto ou serviço vendido?",
    options: [
      { label: "Apenas Preço do Concorrente", score: 15, description: "Cobro o valor baseado puramente no mercado, sem saber minha margem real." },
      { label: "Estimativa Vaga", score: 50, description: "Acho que ganho cerca de 20% a 30%, mas não coloco todos os custos fixos no cálculo." },
      { label: "Cálculo Preciso", score: 85, description: "Sei exatamente a margem de contribuição de cada linha de produtos ou horas de serviço." },
      { label: "Preço Estratégico", score: 100, description: "Precificação dinâmica de alta performance considerando impostos, comissões, reinvestimento e custos indiretos." }
    ]
  }
];

export const CONSULTANTS: Consultant[] = [
  {
    id: 'business',
    name: "Consultoria Meu Consultor IA®",
    role: "Central de Inteligência Corporativa",
    specialty: "Gestão Empresarial, Vendas & Métricas de Negócios",
    avatarColor: "bg-indigo-100 border-indigo-300 text-indigo-900 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-200",
    iconName: "Briefcase",
    bio: "Sua central unificada de aconselhamento estratégico para micro e pequenas empresas. Especialista em resolver problemas de Marketing, Vendas, Finanças, Atendimento e Produtividade.",
    suggestedPrompts: [
      "Como treinar meu time para melhorar o atendimento no WhatsApp Business?",
      "Quero dicas práticas para estruturar a contratação do meu primeiro vendedor.",
      "Qual estratégia para aumentar o ticket médio da minha loja física?",
      "Como reverter reclamações recorrentes de atraso na entrega?"
    ],
    initialMessage: "Olá! Seja muito bem-vindo ao painel consultivo Meu Consultor IA®. Sou sua inteligência corporativa central, com foco em destravar o potencial de vendas, liderança e caixa de pequenas empresas. O que vamos resolver hoje?",
    accentColor: "blue",
    gradientFrom: "from-slate-900",
    gradientTo: "to-indigo-950"
  }
];
