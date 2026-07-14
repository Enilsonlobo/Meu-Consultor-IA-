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
    questionText: "Como você monitora a satisfação, necessidades e reclamações dos seus clientes?",
    options: [
      { label: "Nível Reativo", score: 25, description: "Só sei quando o cliente reclama diretamente ou para de comprar." },
      { label: "Nível Informal", score: 55, description: "Pergunto de forma verbal no dia a dia, sem documentação oficial." },
      { label: "Nível Estruturado", score: 85, description: "Utilizo pesquisas de satisfação recorrentes (ex: NPS) de forma periódica." },
      { label: "Nível Avançado", score: 100, description: "Tenho banco de dados unificado com histórico de hábitos e feedbacks estruturados de cada cliente." }
    ]
  },
  {
    id: "q-relacionamento-2",
    pillar: "relacionamento",
    questionText: "De que forma sua empresa mantém contato pós-venda com clientes via canais digitais?",
    options: [
      { label: "Nulo ou Raro", score: 20, description: "Não fazemos pós-venda. O foco é apenas na próxima atração de clientes." },
      { label: "Canal Passivo", score: 50, description: "Apenas respondemos dúvidas quando entram em contato pelo WhatsApp." },
      { label: "Ativo Mensal", score: 80, description: "Enviamos mensagens de novidades, cupons de aniversário e ofertas direcionadas." },
      { label: "Relacionamento VIP", score: 100, description: "Funil personalizado pós-venda automatizado no CRM com réguas de nutrição e suporte ativo." }
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
