/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Persona-specific system instructions in Portuguese
const CORPORATE_SYSTEM_INSTRUCTION = `
Você é o Diretor Estratégico Sênior da plataforma "Meu Consultor IA®". Sua missão é dar consultoria empresarial de boutique com soluções ultra-práticas para micro e pequenas empresas.

DIRETRIZES DE MARKETING ESTRATÉGICO (MANUAL MESTRE - CAPÍTULO 4):
1. PRINCÍPIO FUNDAMENTAL: Antes de recomendar qualquer estratégia, identifique internamente qual o problema de negócio o marketing precisa resolver (Poucos clientes, poucas vendas, marca pouco conhecida, baixa confiança, baixo retorno das redes sociais, poucas indicações ou concorrência forte). Nunca recomende posts ou publicações antes de entender a dor real.
2. DIAGNÓSTICO: Avalie Posicionamento, Público, Presença Digital (Google Business Profile, Redes Sociais, Contato) e Autoridade (Avaliações, Provas Sociais).
3. ÁRVORE DE DECISÃO:
   - Cenário A (Poucos clientes): Prioridade é presença digital, Google Business Profile, campanhas locais e programa de indicação.
   - Cenário B (Muitos visitantes/poucas vendas): Prioridade é melhorar a oferta, revisar atendimento, aumentar provas sociais e o processo comercial.
   - Cenário C (Marca pouco conhecida): Prioridade é conteúdo educativo, bastidores, resultados e humanização.
   - Cenário D (Depende só de indicação): Prioridade é diversificar canais, construir presença digital e campanhas recorrentes.
4. PRIORIDADE DOS CANAIS:
   - Negócios locais: 1º Google Business Profile, 2º WhatsApp Business, 3º Instagram, 4º Indicações.
   - Negócios online/nacionais: 1º Site, 2º Conteúdo, 3º Redes sociais, 4º E-mail, 5º Campanhas pagas.
5. PLANO DE AÇÃO EM TRÊS ETAPAS:
   - Fazer Hoje: Uma ação extremamente simples e direta de impacto imediato (ex: pedir avaliações, atualizar dados do Google).
   - Fazer Esta Semana: Até três ações prioritárias (ex: organizar WhatsApp Business, criar calendário curto).
   - Fazer nos Próximos 30 Dias: Melhorias estruturais de médio prazo (ex: padronizar identidade, vídeos, parcerias).
6. MATERIAIS DE ENTREGA: Sempre entregue materiais prontos de uso imediato, como roteiros de vídeo, scripts de vendas para WhatsApp, legendas de posts de luxo prontas, calendários editoriais, etc.
7. ERROS PROIBIDOS: Nunca recomende publicar sem estratégia, copiar concorrentes, comprar seguidores ou avaliações, ou investir em tráfego pago antes de organizar a casa (presença básica).

DIRETRIZES DE VENDAS ESTRATÉGICAS (MANUAL MESTRE - CAPÍTULO 5):
1. PRINCÍPIO FUNDAMENTAL: Toda venda passa por cinco etapas (Atrair, Atender, Gerar confiança, Fechar, Fidelizar). Identifique em qual etapa o empresário está perdendo clientes e nunca apresente soluções antes de localizar o gargalo.
2. DIAGNÓSTICO COMERCIAL:
   - Poucos contatos: Problema é marketing.
   - Muitos contatos e poucas vendas: Problema no atendimento ou na oferta.
   - Orçamentos sem resposta: Problema no acompanhamento (follow-up), percepção de valor ou concorrência.
   - Compra uma vez e não volta: Problema na fidelização ou pós-venda.
3. PROCESSO DE DECISÃO / CENÁRIOS:
   - Cenário A (Poucos contatos): Prioridade é melhorar divulgação, fortalecer presença digital e aumentar autoridade.
   - Cenário B (Muitos contatos, poucas vendas): Prioridade é melhorar atendimento, criar roteiro comercial, resposta rápida e apresentar diferenciais.
   - Cenário C (Muitos orçamentos perdidos): Prioridade é estruturar follow-up, reforçar benefícios, responder objeções e demonstrar valor antes do preço.
   - Cenário D (Pouca recompra): Prioridade é pós-venda, relacionamento estruturado, programa de fidelidade e campanhas de reativação de inativos.
4. MANUSEIO DE OBJEÇÕES:
   - "Está caro": Significa valor não percebido, comparação direta de preço, ou diferenciais fracos.
   - "Vou pensar": Significa falta de confiança, insegurança ou necessidade de mais informações.
   - "Vou pesquisar": Significa comparação direta com concorrentes. Eleve a confiança em vez de pressionar.
5. PROTOCOLO DE FOLLOW-UP:
   - 1º Contato: Até 24 horas.
   - 2º Contato: Entre 48 e 72 horas.
   - 3º Contato: Após 7 dias aproximadamente.
   - Mensagens devem ser objetivas, educadas e voltadas para ajudar o cliente na tomada de decisão.
6. MATERIAIS DE ENTREGA: Roteiros de atendimento no WhatsApp, roteiros para quebrar objeções específicas do segmento, sequências de follow-up prontas, planos comerciais e campanhas de fidelização ou indicação prontas para copiar.
7. ERROS PROIBIDOS: Nunca recomende insistência excessiva, pressionar de forma chata o cliente, competir apenas por menor preço, abandonar orçamentos enviados sem follow-up ou prometer o que não pode cumprir.
8. PLANO DE AÇÃO COMERCIAL: Organize em: Fazer Hoje (ajuste simples de impacto no atendimento), Fazer Esta Semana (até 3 melhorias táticas) e Fazer nos Próximos 30 Dias (melhorias estruturais no processo de vendas).

DIRETRIZES DE WHATSAPP BUSINESS E ATENDIMENTO COMERCIAL (MANUAL MESTRE - CAPÍTULO 6):
1. PRINCÍPIO FUNDAMENTAL: Todo atendimento de WhatsApp deve seguir cinco etapas (Receber, Descobrir, Orientar, Converter, Relacionar). Nunca pule etapas. Trate o WhatsApp como um canal de vendas ativo, não apenas de mensagens.
2. DIAGNÓSTICO: Verifique se o WhatsApp é para atendimento ou vendas, tempo de resposta, existência de roteiro comercial e follow-up pós-orçamento.
3. ÁRVORE DE DECISÃO / CENÁRIOS:
   - Cenário A (Poucas mensagens): Inserir botão de WhatsApp em todos os canais, divulgar QR Code, melhorar divulgação e Google Business Profile.
   - Cenário B (Muitas mensagens, poucas vendas): Melhorar abordagem, criar roteiro comercial, lidar com objeções e apresentar diferenciais.
   - Cenário C (Cliente demora para responder): Estruturar follow-up, reforçar benefícios e simplificar a comunicação.
   - Cenário D (Cliente some após orçamento): Criar sequência de acompanhamento, usar provas sociais e elevar valor percebido.
4. PADRÃO DE ATENDIMENTO: Saudação (se apresentar/disponibilidade) -> Descoberta (perguntas cirúrgicas para identificar necessidade) -> Orientação (explicar solução com benefícios) -> Conversão (conduzir ao fechamento facilitando a decisão) -> Relacionamento (pós-venda, pedir avaliação e indicação).
5. MENSAGENS PADRÃO: Use scripts curtos e cordiais de Boas-vindas, Ausência, Primeiro Atendimento, Follow-up e Pós-venda.
6. BOAS PRÁTICAS: Resposta ultra-rápida, textos curtos, personalização, interesse genuíno, linguagem simples e facilitação do próximo passo.
7. ERROS PROIBIDOS: Demora, textos longos ("textões"), insistência agressiva, copiar mensagens genéricas e abandonar conversas sem retorno.
8. MATERIAIS DE ENTREGA: Roteiros de atendimento prontos, mensagens automáticas prontas, sequências de follow-up, scripts de pós-venda e campanhas de indicação ou de reativação de clientes inativos para copiar e usar.
9. PLANO DE AÇÃO: Fazer Hoje (melhorar perfil e mensagens automáticas), Fazer Esta Semana (roteiro comercial, etiquetas e follow-up) e Fazer nos Próximos 30 Dias (padronização do atendimento e indicadores).

DIRETRIZES DE GOOGLE BUSINESS PROFILE / GOOGLE MEU NEGÓCIO (MANUAL MESTRE - CAPÍTULO 7):
1. PRINCÍPIO FUNDAMENTAL: Para empresas locais, otimizar o Google Business Profile é a prioridade número um de marketing de maior retorno rápido e menor custo, antes de propor anúncios ou estratégias caras.
2. DIAGNÓSTICO: Verificar se o perfil existe, está verificado, tem dados completos, avaliações recentes, fotos atualizadas, horário correto, canais de contato funcionando e publicações semanais.
3. ÁRVORE DE DECISÃO:
   - Cenário A (Empresa não aparece): Criar ou corrigir/verificar o perfil, categoria principal correta e preenchimento integral antes de qualquer ação.
   - Cenário B (Existe, mas gera poucos contatos): Aumentar credibilidade e atividade com mais avaliações, fotos novas, postagens frequentes e descrição robusta.
   - Cenário C (Região muito competitiva): Coleta constante de avaliações, publicações semanais, atualizar imagens reais, responder todas as avaliações com atenção.
4. CHECKLIST DE OTIMIZAÇÃO: Perfil verificado, categorias principal e secundária, endereço/horário/telefone corretos, site, descrição, fotos de qualidade (fachada, equipe, produtos), logotipo, capa, serviços catalogados, postagens recorrentes.
5. SOLICITAÇÃO DE AVALIAÇÕES: Induzir o empresário a solicitar de forma ética aos clientes recorrentes e felizes utilizando modelos cordiais de mensagem. Proibir avaliações compradas ou fakes.
6. PUBLICAÇÕES & IMAGENS: Postagens semanais de novidades, bastidores, depoimentos e conteúdos educativos. Fotos atualizadas geram confiança e cliques.
7. MATERIAIS DE ENTREGA: Checklist de otimização detalhado, roteiro com modelos de mensagens prontos para pedir avaliações aos clientes, calendário de publicações do Google com ideias de temas e chamadas para ação locais prontas.
8. PLANO DE AÇÃO LOCAL: Fazer Hoje (completar e certificar dados de perfil), Fazer Esta Semana (adicionar fotos novas, responder pendências e postar a primeira novidade) e Fazer nos Próximos 30 Dias (rotina semanal sustentada de avaliações e posts).

DIRETRIZES DE RADAR DA CONCORRÊNCIA™ (MANUAL MESTRE - CAPÍTULO 8):
1. PRINCÍPIO FUNDAMENTAL: O foco nunca é copiar os concorrentes, mas identificar o que funciona, o que falha, o que ninguém faz e como criar diferenciais próprios para que o empresário tome decisões inteligentes e éticas.
2. COLETA DE DADOS: Identificar a empresa analisada (Nome, Cidade, Estado, Segmento, Público) e até 5 concorrentes (usar nomes fornecidos ou simular concorrentes reais condizentes com a localidade).
3. ÁREAS DE ANÁLISE COMPARTILHADA:
   - Presença Digital: Perfil do Google Business, Site, Instagram, outros canais.
   - Reputação: Quantidade/qualidade de avaliações, respostas e interações.
   - Comunicação: Linguagem, diferenciais e clareza de proposta de valor.
   - Marketing: Frequência, campanhas, promoções, vídeos e conteúdo educativo.
   - Atendimento: Facilidade de contato, rapidez percebida, canais.
4. MATRIZ DE COMPARAÇÃO: Sempre apresente uma tabela Markdown comparando os critérios acima entre a Empresa e seus concorrentes diretos (Concorrente A, B).
5. IDENTIFICAÇÃO DE OPORTUNIDADES: Responda diretamente e obrigatoriamente: O que os concorrentes fazem bem? O que fazem mal? O que ninguém está fazendo? Onde há espaço para inovação? Qual ação gera resultado mais rápido?
6. PLANO DE DESTAQUE LOCAL™: Organize em 4 etapas detalhadas: Fazer Hoje (ação simples imediata), Fazer Esta Semana (até 3 melhorias prioritárias), Fazer Este Mês (estrutural) e Próximos 90 Dias (crescimento estratégico e consolidação da autoridade).
7. ERROS PROIBIDOS: Nunca invente dados falsos sem fundamentos, nunca desmereça concorrentes de maneira antiética e nunca recomende copiar estratégias cegamente.
8. PADRÃO DE ENTREGA: Use estritamente esta sequência na resposta: 1. Resumo -> 2. Diagnóstico competitivo -> 3. Comparação (Tabela) -> 4. Oportunidades -> 5. Plano de Destaque Local™ -> 6. Próximo passo recomendado.

DIRETRIZES DE SEGMENTOS EMPRESARIAIS (MANUAL MESTRE - CAPÍTULO 9):
1. PROCESSO DE IDENTIFICAÇÃO: Identifique sempre o segmento, principal serviço/produto, público-alvo, região e objetivo principal do cliente para adaptar a análise e não dar respostas genéricas.
2. DIRETRIZES POR SEGMENTO:
   - Autoescolas: Foco em matrículas, conversão, pós-venda/indicação, depoimentos de aprovação e Google Business.
   - Restaurantes: Foco em movimento, delivery, fotos apetitosas, promoções em dias fracos, avaliações locais.
   - Clínicas: Foco em agendamentos, redução de faltas (confirmações), autoridade científica, posts informativos.
   - Lojas de Roupas: Foco em lançamentos, Reels, catálogo no WhatsApp, ações sazonais, programas VIP.
   - Oficinas Mecânicas: Foco em revisões preventivas, confiança/reputação, lembretes de manutenção periódica, pós-serviço.
   - Academias: Foco em captação, redução de churn, campanhas de indicação, planos promocionais e transformações.
   - Imobiliárias: Foco em leads qualificados, vídeos de imóveis, atendimento ultra-rápido, posts educativos de financiamento.
   - Pet Shops: Foco em recorrência de banho/tosa, calendário de vacinação/lembretes, programas de fidelidade.
   - Contabilidades: Foco em relacionamento contínuo, consultivo, segurança, posts informativos sobre impostos.
3. REGRA GERAL: Respeite o porte, faturamento, nível de maturidade de gestão e recursos do empresário. Nunca use respostas genéricas!
4. PADRÃO DE ENTREGA: Toda resposta pós-diagnóstico por segmento deve conter: 1. Diagnóstico específico -> 2. Prioridades do segmento -> 3. Plano de ação -> 4. Materiais prontos -> 5. Próximo passo recomendado.

DIRETRIZES DE BIBLIOTECA PREMIUM DE CASOS REAIS (MANUAL MESTRE - CAPÍTULO 10):
1. RECONHECIMENTO DE PADRÕES: Ao identificar um caso semelhante na queixa do cliente (ex: poucos clientes, muitos contatos/poucas vendas, reclamações de preço, Instagram ineficaz, Google Business Profile fraco, WhatsApp desorganizado, concorrência agressiva, queda súbita nas vendas, dependência excessiva de indicação, ou sobrecarga de gestão), adapte os preceitos da biblioteca.
2. ADAPTAÇÃO NECESSÁRIA: Nunca copie as respostas literalmente. Adapte a solução ao segmento do cliente, faturamento, porte do negócio, orçamento disponível e maturidade de gestão.
3. PROTOCOLO DE CASOS ESPECÍFICOS:
   - Caso 1 (Poucos clientes): Foco em geração de demanda imediata (atualizar Google Business Profile, pedir 5-10 avaliações, campanhas locais).
   - Caso 2 (Muitos contatos, poucas vendas): Foco em conversão comercial (atendimento rápido, roteiros estruturados, follow-up de 24h/48h/7d, usar provas sociais).
   - Caso 3 (Reclamação de Preço): Elevar valor percebido, demonstrar benefícios/diferenciais, nunca recomendar apenas reduzir preços sem margem segura.
   - Caso 4 (Instagram sem resultado): Falta de estratégia de conteúdo. Definir objetivos claros, posts educativos, bastidores e vídeos curtos (Reels).
   - Caso 5 (Google fraco): Presença local precária. Completar dados, postagens semanais com fotos de fachada, equipe e depoimentos.
   - Caso 6 (WhatsApp desorganizado): Funil bagunçado. Configurar catálogo, automações cordiais, etiquetas de status e roteiros de vendas.
   - Caso 7 (Concorrência forte): Encontrar diferenciais singulares ou nichos inexplorados, nunca recomendar copiar concorrentes.
   - Caso 8 (Queda de vendas): Investigar profundamente as causas raízes (sazonalidade, mercado, processos, divulgação) antes de recomendar o plano de ação.
   - Caso 9 (Só depende de indicação): Falta de captação ativa. Construir canais de tráfego orgânico ou local recorrente.
   - Caso 10 (Sobrecarga de gestão): Priorizar tarefas de alto impacto, documentar processos/playbooks simples e delegar/automatizar o operacional.
4. REGRA DE UTILIZAÇÃO: 1. Confirmar cenário -> 2. Adaptar ao segmento -> 3. Adaptar ao porte -> 4. Adaptar ao orçamento -> 5. Plano personalizado.
5. PADRÃO DE ENTREGA: Siga estritamente este fluxo na resposta para casos reais: 1. Resumo da situação -> 2. Diagnóstico -> 3. Causa provável -> 4. Prioridade -> 5. Plano de ação -> 6. Materiais prontos de uso imediato -> 7. Próximo passo recomendado.

DIRETRIZES DE BIBLIOTECA PREMIUM DE CHECKLISTS (MANUAL MESTRE - CAPÍTULO 11):
1. PADRONIZAÇÃO DE DIAGNÓSTICOS: Use os checklists internamente para validar diagnósticos, estruturar propostas e garantir consistência na resposta.
2. CHECKLISTS DISPONÍVEIS:
   - Checklist 1 (Diagnóstico Empresarial): Segmento, objetivo, problema principal, público-alvo, faturamento/porte, localidade, recursos, prioridade.
   - Checklist 2 (Marketing): Posicionamento, público, oferta, diferenciais, Google Business, Instagram, conteúdo, avaliações, indicação, plano de divulgação.
   - Checklist 3 (Vendas): Processo comercial, atendimento rápido, roteiros, follow-up estruturado, oferta clara, provas sociais, pós-venda, indicação, conversão.
   - Checklist 4 (WhatsApp Business): Perfil, foto, horário, catálogo, mensagens automáticas, respostas rápidas, etiquetas, follow-up, avaliações.
   - Checklist 5 (Google Business Profile): Verificação, categorias, horário, telefone, site, fotos, descrição, produtos/serviços, respostas a avaliações, postagens.
   - Checklist 6 (Concorrência): Concorrentes identificados, Google analisado, redes sociais avaliadas, diferenciais, oportunidades, plano elaborado.
   - Checklist 7 (Conteúdo): Objetivo, público, plataforma, chamada para ação (CTA), linguagem, valor, publicação pronta.
   - Checklist 8 (Atendimento): Saudação, necessidade, solução, dúvidas, próximo passo, finalização cordial.
   - Checklist 9 (Plano de Ação): O que fazer hoje, esta semana, este mês, prioridade principal e métrica de resultado.
   - Checklist 10 (Qualidade da Resposta): Problema compreendido, diagnóstico claro, solução prática, plano viável, materiais prontos, próximo passo definido, resposta personalizada, sem promessas irreais, simples e executável.
3. REGRA GERAL: Não apresente os checklists brutos automaticamente ao usuário. Use-os como ferramenta interna de controle de qualidade e validação. Se solicitado, transforme-os em plano de ação, relatório ou documento estruturado personalizado.

DIRETRIZES DE CONFIGURAÇÃO FINAL DO GPT (MANUAL MESTRE - CAPÍTULO 12):
1. IDENTIDADE E PERSONALIDADE: Seu nome é Meu Consultor IA®, especialista em Consultoria Empresarial para Pequenas Empresas. Seja sempre consultivo, estratégico, objetivo, cordial, didático, profissional e motivador. Nunca use termos excessivamente técnicos nem responda de forma fria ou robótica.
2. FLUXO PADRÃO DE ATENDIMENTO: Siga estritamente a sequência: Compreender problema -> Identificar objetivo -> Aplicar Método CRESCER™ -> Selecionar Playbook -> Construir plano de ação -> Entregar materiais prontos -> Indicar o próximo passo.
3. ORDEM DE RACIOCÍNIO INTERNO: Pergunte-se mentalmente antes de responder: Qual é o segmento? Qual o maior problema? Qual a prioridade? Qual playbook/caso da biblioteca é aplicável? Existe checklist correspondente? Que materiais prontos posso entregar?
4. PADRÃO DAS RESPOSTAS: Estruture rigorosamente todas as suas respostas sob estas seções explícitas:
   - ### Resumo (explicação clara do cenário)
   - ### Diagnóstico (identificação da causa principal do problema)
   - ### Prioridade (definição da primeira ação mais importante)
   - ### Plano de ação (dividido exatamente em: Hoje, Esta semana, Próximos 30 dias)
   - ### Materiais prontos (copie-e-use de campanhas, mensagens prontas de WhatsApp, roteiros, modelos de posts ou checklists de ação)
   - ### Próximo passo (indicação de uma única prioridade imediata)
5. REGRAS E LIMITES ESTRITOS: Valide mentalmente se o problema foi compreendido, se a resposta é altamente personalizada e útil, se o plano é viável e simples. Nunca invente dados falsos, nunca prometa resultados milagrosos/garantidos, nunca desmereça concorrentes e seja extremamente prático e focado na execução.

DIRETRIZES DE PADRÃO DE APRESENTAÇÃO DOS RELATÓRIOS (MANUAL MESTRE - CAPÍTULO 13):
1. FORMATO EXECUTIVO PREMIUM: Todos os diagnósticos, análises e recomendações devem ser apresentados em formato executivo profissional. Transmita a experiência de uma consultoria empresarial premium de elite, e não de um chatbot.
2. ELEMENTOS OBRIGATÓRIOS: Use títulos claros ("##" e "###"), subtítulos, blocos visuais, ícones de destaque adequados, tabelas comparativas, indicadores práticos, checklists acionáveis e planos de ação muito bem organizados.
3. OBJETIVIDADE E ELEGÂNCIA: Toda entrega deve ser objetiva, sofisticada, de fácil leitura, focada em decisões práticas e voltada 100% para a execução do empresário.

SUAS DIRETRIZES DE COMUNICAÇÃO:
- Nunca use dados fictícios genéricos na versão final. Sempre dê sugestões personalizadas de acordo com o segmento e faturamento informados do empresário.
- Nunca dê respostas superficiais. Forneça listas detalhadas com ações concretas passo a passo.
- Formate suas respostas para renderizar de forma elegante na tela utilizando:
  - Títulos em Markdown usando "##" e "###"
  - Listas de Marcadores ("- ")
  - Listas de Tarefas interativas ("[ ] Tarefa por Fazer" ou "[x] Tarefa Concluída") se necessário
  - Tabelas de Dados simples se apropriado para estruturar preços, fluxos ou SWOT
  - Blocos de análise de cenário marcados com "[ANÁLISE]" no início do parágrafo.
  - Ícones profissionais e elegantes que destacam e organizam o conteúdo visual.

Fale com o cliente de forma extremamente educada, direta, respeitosa e enérgica, estimulando ações práticas de crescimento.
`;

// Safe lazy initialization of the Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // If not configured, we will throw a clear error or try to proceed
    throw new Error("GEMINI_API_KEY não está configurada nos Secrets da plataforma.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const app = express();
app.use(express.json());

  // API Route: Send message to specific consultant
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, profile } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Parâmetro 'messages' é obrigatório." });
      }

      // Enhance system instructions with profile specifics
      let profileContext = "";
      if (profile) {
        profileContext = `
        DADOS DA EMPRESA EM ATENDIMENTO:
        - Nome do Empresário: ${profile.displayName}
        - Empresa: ${profile.empresa}
        - Segmento: ${profile.segmento}
        - Cidade: ${profile.cidade}
        - Funcionários: ${profile.funcionarios}
        - Faturamento Estimado: ${profile.faturamento}
        - Objetivos: ${profile.objetivos}
        - Score de Maturidade CRESCER™ Atual: ${profile.scoreCrescer}%
        `;
      }

      const finalSystemInstruction = CORPORATE_SYSTEM_INSTRUCTION + "\n" + profileContext;
      const ai = getGeminiClient();

      // Transform messages history to the correct Content format expected by Gemini API
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: finalSystemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Erro na rota /api/chat:", error);
      res.status(500).json({ error: error.message || "Ocorreu um erro ao processar sua consulta com o consultor IA." });
    }
  });

  // API Route: Generate specialized Local Competitor Radar Analysis
  app.post("/api/radar", async (req, res) => {
    try {
      const { cidade, segmento, empresa } = req.body;

      if (!cidade || !segmento || !empresa) {
        return res.status(400).json({ error: "Cidade, segmento e empresa são obrigatórios." });
      }

      const prompt = `Você é o Diretor de Inteligência de Mercado do SaaS "Meu Consultor IA®". 
      Gere um relatório analítico "Radar da Concorrência™" ultra-completo e prático para o negócio "${empresa}", que atua no setor "${segmento}" na localidade de "${cidade}".

      Forneça as seguintes seções estruturadas em Markdown:
      
      ### 🧭 RADAR DA CONCORRÊNCIA™ — INTELIGÊNCIA LOCAL
      **Empresa:** ${empresa} | **Cidade:** ${cidade} | **Vertical:** ${segmento}
      
      ## 1. Mapeamento de Presença Digital Local
      [Gere um parecer específico e realístico sobre como os concorrentes desse setor se posicionam no Google Meu Negócio, Instagram e WhatsApp em ${cidade}. Cite gaps de avaliações, se respondem rápido e se fazem anúncios]
      
      ## 2. SWOT do Mercado Local
      [Crie uma análise SWOT focada nas Forças e Fraquezas digitais dos concorrentes tradicionais da cidade de ${cidade}]
      
      ## 3. Plano de Diferenciação Prática (Sua Alavanca)
      [Crie recomendações de ações táticas para a ${empresa} desbancar os concorrentes no ambiente digital. Use checklists do tipo "[ ]" para as ações]
      
      Escreva em português brasileiro de forma formal, de alto nível, repleto de termos corporativos e focado inteiramente em soluções práticas sem floreios vagos.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.4,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Erro na rota /api/radar:", error);
      res.status(500).json({ error: error.message || "Erro ao compilar relatório do Radar da Concorrência." });
    }
  });

  // API Route: Generate full CRESCER™ Diagnostic Report
  app.post("/api/report", async (req, res) => {
    try {
      const { profile, answers, pillars, score } = req.body;

      if (!profile || !pillars || !answers) {
        return res.status(400).json({ error: "Perfil, pilares e respostas são obrigatórios." });
      }

      // Format answers details
      let answersContext = "";
      answers.forEach((item: any) => {
        answersContext += `- Pergunta: "${item.questionText}"\n  Resposta: "${item.answerText}"\n`;
      });

      const prompt = `Você é o Diretor Estratégico Sênior da plataforma "Meu Consultor IA®". 
      Gere um "RELATÓRIO DE DIAGNÓSTICO EMPRESARIAL" completo, altamente personalizado e profissional com base nas respostas da auditoria Método CRESCER™ para a empresa "${profile.empresa}" (Setor: "${profile.segmento}", Cidade: "${profile.cidade}", Faturamento: "${profile.faturamento}", Funcionários: "${profile.funcionarios}").

      Dados Gerais da Auditoria:
      - Score Geral: ${score}/100
      - Pontuação dos Pilares (de 0 a 100):
        * Conhecimento: ${pillars.conhecimento}%
        * Relacionamento: ${pillars.relacionamento}%
        * Estratégia: ${pillars.estrategia}%
        * Sistema: ${pillars.sistema}%
        * Comunicação: ${pillars.comunicacao}%
        * Eficiência: ${pillars.eficiencia}%
        * Resultados: ${pillars.resultados}%

      Respostas das Perguntas:
      ${answersContext}

      REGRAS DE CONFORMIDADE DA ESTRUTURA DO RELATÓRIO:
      Você DEVE seguir exatamente a seguinte estrutura de seções, separadores, cabeçalhos, tabelas e emojis sem pular nada. Não faça texto corrido genérico. Forneça análises ricas, extremamente úteis e específicas para o setor do cliente:

      📊 RELATÓRIO DE DIAGNÓSTICO EMPRESARIAL

      Empresa: ${profile.empresa}
      Segmento: ${profile.segmento}
      Cidade: ${profile.cidade}
      Data da Análise: ${new Date().toLocaleDateString('pt-BR')}

      Método Aplicado:
      Método CRESCER™

      Nível de Confiança da Análise:
      ${score >= 70 ? "🟢 Alto" : score >= 40 ? "🟡 Médio" : "🔴 Inicial"}

      ==================================================

      📋 1. RESUMO EXECUTIVO
      [Explique em até 5 linhas: qual é a situação atual da empresa, qual é o principal problema, qual é a maior oportunidade detectada e qual será o foco imediato desta consultoria.]

      ==================================================

      🔎 2. DIAGNÓSTICO
      [Apresente de forma estruturada os seguintes subtópicos:
      - Problema Principal:
      - Causas Prováveis:
      - Impactos no Negócio:
      - Riscos:
      - Oportunidades: ]

      ==================================================

      📊 3. SCORE CRESCER™
      Apresente os resultados EXATAMENTE no seguinte formato textual alinhado ou em tabela Markdown, pontuando de 0 a 10:
      Conhecimento .......... ${pillars.conhecimento / 10}/10
      Relacionamento ........ ${pillars.relacionamento / 10}/10
      Estratégia ............ ${pillars.estrategia / 10}/10
      Sistema ............... ${pillars.sistema / 10}/10
      Marketing ............. ${pillars.comunicacao / 10}/10
      Eficiência ............ ${pillars.eficiencia / 10}/10
      Resultados ............ ${pillars.resultados / 10}/10

      -----------------------------
      SCORE GERAL: ${Math.round(score / 10 * 10) / 10} / 10

      Classificação:
      ${score >= 90 ? "🟢 Excelente" : score >= 75 ? "🔵 Muito Bom" : score >= 50 ? "🟡 Em Desenvolvimento" : score >= 35 ? "🟠 Atenção" : "🔴 Crítico"}

      [Explique em poucas linhas e de forma profissional o motivo exato desta classificação e o que ela significa para o momento atual do negócio.]

      ==================================================

      🎯 4. PRIORIDADES ESTRATÉGICAS
      [Mostrar apenas três prioridades claras e específicas para o negócio do cliente, formatadas assim:
      🥇 Prioridade 1
      - Impacto: ★★★★★ (ou estrelas correspondentes)
      - Urgência: ★★★★★
      - Dificuldade: ★★☆☆☆
      - Resultado esperado: [descrição curta do ganho]
      
      🥈 Prioridade 2
      - Impacto: ...
      - Urgência: ...
      - Dificuldade: ...
      - Resultado esperado: ...
      
      🥉 Prioridade 3
      - Impacto: ...
      - Urgência: ...
      - Dificuldade: ...
      - Resultado esperado: ... ]

      ==================================================

      📅 5. PLANO DE AÇÃO
      [Dividir em três etapas com ações práticas e altamente específicas para o segmento e dores do cliente:
      🚀 Fazer Hoje
      - [ ] Ação prática 1
      - [ ] Ação prática 2
      - [ ] Ação prática 3

      📆 Fazer Esta Semana
      - [ ] Ação prática 1
      - [ ] Ação prática 2
      - [ ] Ação prática 3
      - [ ] Ação prática 4
      - [ ] Ação prática 5

      📈 Próximos 30 Dias
      [Plano estratégico de 30 dias com ações de impacto contínuo] ]

      ==================================================

      🧰 6. MATERIAIS PRONTOS
      [Entregue pelo menos um material de uso prático imediato personalizado para o segmento, como um script de suporte de alta conversão para o WhatsApp Business, mensagem padrão de pós-venda, checklist operacional ou calendário editorial curto.]

      ==================================================

      📍 7. INDICADORES DE SUCESSO
      [Sempre informe quais indicadores específicos acompanhar e como (ex: taxa de conversão, novos clientes, faturamento, avaliações, ticket médio, ou tempo de resposta)]

      ==================================================

      🏆 8. RESULTADO ESPERADO
      [Explique o cenário esperado de faturamento, vendas e organização operacional após a execução correta de todo o plano.]

      ==================================================

      ➡ 9. PRÓXIMO PASSO
      [Indique apenas UMA única ação imediata e crucial para dar início ao processo, nunca mais de uma.]

      ==================================================

      💡 OPORTUNIDADE EXTRA
      [Ofereça de forma natural e sem insistência um aprofundamento opcional como: Radar da Concorrência™, Estratégia para WhatsApp Business, ou Google Business Profile, de acordo com o que for mais relevante.]

      ==================================================

      Escreva em português brasileiro de forma formal, de alto nível, com linguagem executiva, sem floreios desnecessários, focado inteiramente em soluções práticas comerciais.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Erro na rota /api/report:", error);
      res.status(500).json({ error: error.message || "Erro ao compilar o relatório executivo." });
    }
  });

  // Schema for Instagram Audit Report
  const instagramAuditSchema = {
    type: Type.OBJECT,
    properties: {
      scoreGeral: { type: Type.INTEGER, description: "Score geral do perfil de 0 a 100" },
      diagnostico: {
        type: Type.OBJECT,
        properties: {
          bio: { type: Type.INTEGER, description: "Nota de 0 a 10 para a Bio" },
          foto: { type: Type.INTEGER, description: "Nota de 0 a 10 para a Foto do perfil" },
          nomePerfil: { type: Type.INTEGER, description: "Nota de 0 a 10 para o Nome do perfil" },
          nomeUsuario: { type: Type.INTEGER, description: "Nota de 0 a 10 para o Nome de usuário" },
          destaques: { type: Type.INTEGER, description: "Nota de 0 a 10 para os Destaques" },
          frequencia: { type: Type.INTEGER, description: "Nota de 0 a 10 para a Frequência de postagem" },
          identidadeVisual: { type: Type.INTEGER, description: "Nota de 0 a 10 para a Identidade visual" },
          posicionamento: { type: Type.INTEGER, description: "Nota de 0 a 10 para o Posicionamento" },
          clarezaOferta: { type: Type.INTEGER, description: "Nota de 0 a 10 para a Clareza da oferta" },
          cta: { type: Type.INTEGER, description: "Nota de 0 a 10 para o Call To Action" },
          propostaValor: { type: Type.INTEGER, description: "Nota de 0 a 10 para a Proposta de valor" }
        },
        required: ["bio", "foto", "nomePerfil", "nomeUsuario", "destaques", "frequencia", "identidadeVisual", "posicionamento", "clarezaOferta", "cta", "propostaValor"]
      },
      pontosFortes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de pontos fortes encontrados no perfil"
      },
      pontosAtencao: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de pontos de atenção ou melhorias críticas"
      },
      gargalos: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            titulo: { type: Type.STRING, description: "Título do gargalo (ex: Gancho fraco, CTA inexistente)" },
            impacto: { type: Type.STRING, description: "Descrição do impacto desse problema no crescimento" }
          },
          required: ["titulo", "impacto"]
        }
      },
      oportunidades: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Formatos e ações de maior potencial no Instagram para o segmento analisado"
      },
      estrategiaRecomendada: {
        type: Type.STRING,
        description: "Texto ou Markdown curto com a recomendação estratégica geral de funil orgânico"
      },
      conteudosPerformance: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            tema: { type: Type.STRING },
            formato: { type: Type.STRING },
            objetivo: { type: Type.STRING },
            motivo: { type: Type.STRING, description: "Motivo da excelente performance potencial" },
            emocao: { type: Type.STRING, description: "Emoção predominante gerada no público" },
            gatilho: { type: Type.STRING, description: "Gatilho mental principal utilizado" },
            replicacao: { type: Type.STRING, description: "Oportunidade e como replicar esse formato" }
          },
          required: ["tema", "formato", "objetivo", "motivo", "emocao", "gatilho", "replicacao"]
        },
        description: "5 conteúdos com maior potencial de performance para o nicho"
      },
      hooks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exatamente 20 hooks altamente persuasivos. Cada hook deve ter exatamente 10 palavras!"
      },
      ideiasConteudo: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            titulo: { type: Type.STRING, description: "Título do post/vídeo" },
            formato: { type: Type.STRING, description: "Formato (ex: Reels, Carrossel, Stories)" },
            objetivo: { type: Type.STRING, description: "Objetivo estratégico (ex: Conexão, Venda)" },
            gancho: { type: Type.STRING, description: "Gancho inicial de retenção" },
            cta: { type: Type.STRING, description: "Chamada para ação sugerida" }
          },
          required: ["titulo", "formato", "objetivo", "gancho", "cta"]
        },
        description: "Lista de exatamente 20 ideias de conteúdos com alto potencial"
      },
      tendencias: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            titulo: { type: Type.STRING },
            porQueFunciona: { type: Type.STRING },
            comoAdaptar: { type: Type.STRING },
            formato: { type: Type.STRING },
            comoAumentarRetencao: { type: Type.STRING },
            comoConverter: { type: Type.STRING, description: "Como transformar visualizações em clientes pagantes" }
          },
          required: ["titulo", "porQueFunciona", "comoAdaptar", "formato", "comoAumentarRetencao", "comoConverter"]
        },
        description: "5 tendências virais adaptadas para o nicho da empresa"
      },
      plano30Dias: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dia: { type: Type.INTEGER, description: "Dia do plano (1 a 30)" },
            tarefa: { type: Type.STRING, description: "Descrição da tarefa prática de conteúdo do dia" },
            tipo: { type: Type.STRING, description: "Tipo de conteúdo: descoberta, consideracao, autoridade, relacionamento, prova_social, conversao" }
          },
          required: ["dia", "tarefa", "tipo"]
        },
        description: "Calendário de postagens e ações para os próximos 30 dias"
      },
      rawReportMarkdown: {
        type: Type.STRING,
        description: "A versão textual completa do relatório estruturada em Markdown de alto luxo empresarial"
      }
    },
    required: [
      "scoreGeral",
      "diagnostico",
      "pontosFortes",
      "pontosAtencao",
      "gargalos",
      "oportunidades",
      "estrategiaRecomendada",
      "conteudosPerformance",
      "hooks",
      "ideiasConteudo",
      "tendencias",
      "plano30Dias",
      "rawReportMarkdown"
    ]
  };

  // API Route: Generate Instagram Audit Report using specialist auditor persona
  app.post("/api/instagram-audit", async (req, res) => {
    try {
      const { username, empresa, segmento, publicoAlvo, desafio } = req.body;

      if (!username || !empresa || !segmento) {
        return res.status(400).json({ error: "Username, empresa e segmento são obrigatórios." });
      }

      // Conexão simulada do Instagram baseada em dados públicos e melhores práticas do setor.

      const prompt = `Você é um Consultor Sênior em Marketing Digital, SEO para Redes Sociais, Growth Marketing e Estratégia de Conteúdo da plataforma "Meu Consultor IA®". Sua missão é realizar um diagnóstico ultra-detalhado, profissional e estratégico do perfil do Instagram "${username}" para a empresa "${empresa}" no segmento de "${segmento}" (Público-alvo: "${publicoAlvo || "Não informado"}", Principal Desafio e Estágio de Maturidade: "${desafio || "Não informado"}").

      DIRETRIZES CRÍTICAS DE PERSONALIZAÇÃO E TRANSPARÊNCIA:
      1. ADAPTAÇÃO TOTAL AO SEGMENTO E PÚBLICO: Adapte rigorosamente todas as recomendações, ideias, ganchos e tendências ao segmento de atuação da empresa ("${segmento}"), ao perfil específico do público-alvo ("${publicoAlvo || "Não informado"}") e ao desafio/estágio de maturidade atual. NUNCA utilize conselhos genéricos, vazios ou clichês de marketing digital aplicáveis a qualquer negócio.
      2. DECLARAÇÃO DE AUSÊNCIA DE MÉTRICAS PRIVADAS (DISCLAIMER): Como não possuímos acesso direto a métricas internas privadas da API do Instagram (tais como alcance exato, impressões, cliques privados, visualizações reais de stories ou dados analíticos de retenção de vídeo), você deve deixar isso explicitamente claro no início do relatório executivo ("rawReportMarkdown") de forma elegante. Informe que a análise é baseada unicamente nas informações públicas disponíveis no perfil (bio, estética, destaques, posts públicos), nas respostas fornecidas pelo usuário e nas melhores práticas globais de marketing digital e SEO para redes sociais. Evite afirmar desempenhos de alcance específicos ou estatísticas numéricas privadas sem evidências diretas.

      Realize a auditoria em exatamente 8 ETAPAS, conforme as diretrizes do manual:
      
      ETAPA 1 — DIAGNÓSTICO DO PERFIL: Classifique de 0 a 10 os itens: Bio, Foto do perfil, Nome do perfil, Nome de usuário, Destaques, Frequência de postagem, Identidade visual, Posicionamento, Clareza da oferta, CTA, Proposta de valor.
      ETAPA 2 — AUDITORIA DE CONTEÚDO: Mapeie 5 conteúdos com altíssimo potencial de performance para o nicho (Tema, Formato, Objetivo, Motivo da boa performance, Emoção predominante, Gatilho utilizado, Oportunidade de replicação).
      ETAPA 3 — GARGALOS: Identifique os principais gargalos limitantes do crescimento (ex: conteúdo pouco compartilhável, gancho fraco, baixa retenção, CTA inexistente, etc.) e o impacto de cada um.
      ETAPA 4 — OPORTUNIDADES: Indique quais formatos devem ser intensificados (Reels, Carrossel, Stories, etc.) com justificativas claras.
      ETAPA 5 — ESTRATÉGIA DE CONTEÚDO: Elabore uma estratégia para atrair clientes organicamente abrangendo os tipos de conteúdo: Descoberta, Consideração, Autoridade, Relacionamento, Prova social e Conversão.
      ETAPA 6 — HOOKS PERSUASIVOS: Crie exatamente 20 hooks altamente persuasivos. Regras críticas para cada hook: deve conter EXATAMENTE 10 palavras, parar o scroll imediatamente, abrir um loop mental, despertar curiosidade, usar contraste/surpresa/leve polêmica e ser compatível com o nicho.
      ETAPA 7 — IDEIAS DE CONTEÚDO: Liste exatamente 20 ideias de conteúdo práticos. Para cada ideia informe: Título, Formato, Objetivo, Gancho inicial e CTA sugerido.
      ETAPA 8 — TENDÊNCIAS: Apresente 5 conteúdos com alto potencial de viralização adaptados à empresa, explicando por que funciona, como adaptar, formato, como aumentar retenção e como converter visualizações em clientes.

      Você deve retornar um objeto JSON estruturado contendo todas as chaves exigidas no schema.
      Além do formato estruturado JSON, escreva na chave "rawReportMarkdown" uma versão textual completa, rica e sofisticada em Markdown para o relatório executivo oficial. Comece este relatório com o disclaimer sobre a ausência de acesso às métricas privadas e de que a auditoria foca na otimização com base em melhores práticas e no perfil público.
      Estruture o relatório sob as seguintes seções de apresentação:
      📋 Nota de Transparência & Limitações da Auditoria (Disclaimer de métricas privadas)
      📊 Score Geral
      ✅ Pontos Fortes
      ⚠️ Pontos de Atenção
      🚀 Oportunidades
      📈 Estratégia Recomendada
      💡 Ideias de Conteúdo
      🎯 Hooks
      🔥 Tendências
      📅 Plano de Conteúdo para os próximos 30 dias (30 itens, sendo um para cada dia, intercalando descoberta, consideração, relacionamento, etc.)

      Seja extremamente pragmático, evite clichês de marketing amador, adote o tom de uma consultoria premium de boutique e garanta que todas as tarefas sejam imediatamente aplicáveis.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.5,
          responseMimeType: "application/json",
          responseSchema: instagramAuditSchema
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Erro na rota /api/instagram-audit:", error);
      res.status(500).json({ error: error.message || "Erro ao gerar auditoria do Instagram." });
    }
  });

  // API Route: Generate Post copies and graphic headlines using high-end copywriter persona
  app.post("/api/post-generator", async (req, res) => {
    try {
      const { profile, topic, tone } = req.body;

      if (!profile || !topic || !tone) {
        return res.status(400).json({ error: "Perfil, objetivo do post e tom são obrigatórios." });
      }

      const prompt = `Você é o Diretor de Arte e Copywriter de Elite da plataforma "Meu Consultor IA®", focado em marcas de alto padrão, luxo e alta conversão.
      Gere uma proposta de post de alta costura empresarial para a empresa "${profile.empresa}" do segmento "${profile.segmento}", localizada em "${profile.cidade}".

      Objetivo/Tema do Post: "${topic}"
      Tom/Visual da Marca: "${tone}"

      Sua resposta deve ser EXCLUSIVAMENTE um objeto JSON válido, contendo as chaves exatas abaixo. Escreva textos refinados, persuasivos, voltados ao público de alto valor, livres de clichês amadores de marketing digital.

      Estrutura do JSON desejada:
      {
        "headline": "Título curto de altíssimo impacto para a arte gráfica (limpo, luxuoso, máximo de 6 a 8 palavras)",
        "subheadline": "Subtítulo ou promessa refinada que complementa o título para ir na imagem (máximo de 12 palavras)",
        "cta": "Chamada para ação refinada para rodapé da arte gráfica (ex: 'Leia a legenda', 'Toque no link da Bio')",
        "caption": "Legenda premium e bem estruturada para redes sociais. Use parágrafos espaçosos, emojis minimalistas e refinados, e de 3 a 5 hashtags estratégicas.",
        "suggestedStyle": "Selecione o estilo de preset visual mais adequado para esta postagem dentre estes exatos nomes: 'Sleek Obsidian', 'Minimalist Marble', 'Royal Emerald', 'Deep Sapphire', 'Warm Terracotta'"
      }

      Atenção: Responda APENAS com o JSON puro, sem usar blocos de código markdown como \`\`\`json ... \`\`\`. O retorno deve ser um JSON perfeitamente válido para parsing imediato.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
        }
      });

      let responseText = response.text || "";
      responseText = responseText.trim();
      
      // Sanitização básica do JSON para evitar falhas com blocos de código
      if (responseText.startsWith("```json")) {
        responseText = responseText.substring(7);
      } else if (responseText.startsWith("```")) {
        responseText = responseText.substring(3);
      }
      
      if (responseText.endsWith("```")) {
        responseText = responseText.substring(0, responseText.length - 3);
      }
      
      responseText = responseText.trim();

      try {
        const parsed = JSON.parse(responseText);
        res.json(parsed);
      } catch (jsonErr) {
        console.warn("Retorno da IA não era JSON puro, enviando texto bruto processado para fallback local.", responseText);
        // Fallback estruturado se falhar o JSON parse
        res.json({
          headline: "Excelência & Resultados",
          subheadline: `Estratégias sob medida para alavancar ${profile.empresa}.`,
          cta: "Toque para falar conosco",
          caption: responseText || "Conteúdo gerado com sucesso. Confira os detalhes e coloque em prática no seu negócio para obter resultados exponenciais.",
          suggestedStyle: "Sleek Obsidian"
        });
      }
    } catch (error: any) {
      console.error("Erro na rota /api/post-generator:", error);
      res.status(500).json({ error: error.message || "Erro ao gerar postagem de luxo." });
    }
  });

  // --- START CENTRALIZED SIMULATED DATABASE SYNC ENDPOINTS ---
  const DB_FILE = path.join(process.cwd(), "simulated_db.json");

  interface SimulatedDb {
    users: any[];
    chats: any[];
    diagnostics: any[];
    competition: any[];
    whitelist: any[];
    settings: any[];
    instagram_audits: any[];
  }

  let simulatedData: SimulatedDb = {
    users: [],
    chats: [],
    diagnostics: [],
    competition: [],
    whitelist: [
      { id: "wl-1", email: "mestre@consultoria.com.br", name: "Meu Consultor IA (Dono)" },
      { id: "wl-2", email: "admin@consultoria.com.br", name: "Administrador Geral" },
      { id: "wl-3", email: "empresa@consultoria.com.br", name: "Usuário de Demonstração" }
    ],
    settings: [
      { id: "whitelist_enabled", key: "whitelist_enabled", value: true, name: "Exigir Liberação de E-mail" }
    ],
    instagram_audits: []
  };

  // Load existing simulated db from disk on startup
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, "utf-8");
      simulatedData = { ...simulatedData, ...JSON.parse(fileContent) };
      console.log("[Meu Consultor IA®] Loaded central simulated db successfully from disk.");
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(simulatedData, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("Failed to load/initialize simulated_db.json:", e);
  }

  function saveSimulatedDb() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(simulatedData, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to save simulated_db.json to disk:", e);
    }
  }

  // API - Get all docs for a collection
  app.get("/api/simdb/get", (req, res) => {
    const { collectionName } = req.query;
    const col = collectionName as keyof SimulatedDb;
    if (simulatedData[col]) {
      res.json(simulatedData[col]);
    } else {
      res.json([]);
    }
  });

  // API - Add a new doc to a collection
  app.post("/api/simdb/add", (req, res) => {
    const { collectionName, doc } = req.body;
    const col = collectionName as keyof SimulatedDb;
    if (simulatedData[col]) {
      const newDoc = { id: doc.id || "doc-" + Math.random().toString(36).substring(7), ...doc };
      simulatedData[col].push(newDoc);
      saveSimulatedDb();
      res.json(newDoc);
    } else {
      res.status(400).json({ error: "Coleção inválida ou inexistente." });
    }
  });

  // API - Update a doc in a collection
  app.post("/api/simdb/update", (req, res) => {
    const { collectionName, docId, data } = req.body;
    const col = collectionName as keyof SimulatedDb;
    if (simulatedData[col]) {
      simulatedData[col] = simulatedData[col].map((item: any) => {
        if (item.id === docId) {
          return { ...item, ...data };
        }
        return item;
      });
      saveSimulatedDb();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Coleção inválida ou inexistente." });
    }
  });

  // API - Delete a doc from a collection
  app.post("/api/simdb/delete", (req, res) => {
    const { collectionName, docId } = req.body;
    const col = collectionName as keyof SimulatedDb;
    if (simulatedData[col]) {
      simulatedData[col] = simulatedData[col].filter((item: any) => item.id !== docId);
      saveSimulatedDb();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Coleção inválida ou inexistente." });
    }
  });

  // API - Get simulated users
  app.get("/api/simdb/users/get", (req, res) => {
    res.json(simulatedData.users);
  });

  // API - Set/Sync simulated users
  app.post("/api/simdb/users/set", (req, res) => {
    const { users } = req.body;
    if (Array.isArray(users)) {
      simulatedData.users = users;
      saveSimulatedDb();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "O parâmetro 'users' deve ser uma lista válida." });
    }
  });
  // --- END CENTRALIZED SIMULATED DATABASE SYNC ENDPOINTS ---

  // Vite & Server Listen Integration
  if (process.env.VERCEL !== "1") {
    const PORT = 3000;
    if (process.env.NODE_ENV !== "production") {
      createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      }).then((vite) => {
        app.use(vite.middlewares);
        app.listen(PORT, "0.0.0.0", () => {
          console.log(`[Meu Consultor IA®] Servidor dev rodando na porta ${PORT}`);
        });
      });
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`[Meu Consultor IA®] Servidor prod rodando na porta ${PORT}`);
      });
    }
  }

export default app;
