import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://fldhvvwcjxwnutkjanud.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_UJRx_Z0EDrVQI6zCLMDyZg_zd9WDkk-";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const diagnosticKeys = [
  "bio",
  "foto",
  "nomePerfil",
  "nomeUsuario",
  "destaques",
  "frequencia",
  "identidadeVisual",
  "posicionamento",
  "clarezaOferta",
  "cta",
  "propostaValor",
] as const;

function safeText(value: unknown, fallback = "Não informado") {
  const text = String(value || "").trim();
  return text || fallback;
}

function clampScore(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 50;
}

function list(value: unknown, minimum = 1) {
  const items = Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : [];
  return items.length >= minimum ? items : ["Revise esta área com dados reais do perfil antes de executar mudanças."];
}

function buildMarkdown(data: any, context: { username: string; empresa: string; segmento: string }) {
  const lines = [
    `# Auditoria Estratégica de Instagram — ${context.empresa}`,
    "",
    `**Perfil informado:** ${context.username}`,
    `**Segmento:** ${context.segmento}`,
    `**Índice estratégico geral:** ${data.scoreGeral}/100`,
    "",
    "## Diagnóstico por categoria",
    ...diagnosticKeys.map((key) => `- **${key}:** ${data.diagnostico[key]}/100`),
    "",
    "## Pontos fortes",
    ...data.pontosFortes.map((item: string) => `- ${item}`),
    "",
    "## Pontos de atenção",
    ...data.pontosAtencao.map((item: string) => `- ${item}`),
    "",
    "## Oportunidades",
    ...data.oportunidades.map((item: string) => `- ${item}`),
    "",
    "## Estratégia recomendada",
    data.estrategiaRecomendada,
    "",
    "## Gargalos prioritários",
    ...data.gargalos.map((item: any) => `- **${item.titulo}:** ${item.impacto}`),
    "",
    "## Ganchos prontos",
    ...data.hooks.map((item: string, index: number) => `${index + 1}. ${item}`),
    "",
    "## Plano de 30 dias",
    ...data.plano30Dias.map((item: any) => `- **Dia ${item.dia}:** ${item.tarefa} (${item.tipo})`),
    "",
    "> Esta auditoria é orientativa e foi criada apenas com os dados fornecidos. Ela não afirma ter acessado automaticamente o perfil real do Instagram.",
  ];
  return lines.join("\n");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada na Vercel.");

    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Sessão não encontrada. Entre novamente." });
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return res.status(401).json({ error: "Sessão inválida ou expirada." });

    const username = safeText(req.body?.username);
    const empresa = safeText(req.body?.empresa);
    const segmento = safeText(req.body?.segmento);
    const publicoAlvo = safeText(req.body?.publicoAlvo);
    const desafio = safeText(req.body?.desafio);

    if (empresa === "Não informado" || segmento === "Não informado") {
      return res.status(400).json({ error: "Informe o nome da empresa e o segmento." });
    }

    const prompt = `Crie uma auditoria estratégica ORIENTATIVA de Instagram para uma pequena empresa brasileira.

REGRAS DE CONFIABILIDADE:
- Você NÃO acessou o Instagram e NÃO pode afirmar que viu posts, métricas, seguidores, bio, foto, destaques ou links reais.
- As notas representam um índice estratégico estimado com base somente nas informações fornecidas.
- Quando faltarem evidências, use nota entre 45 e 60 e apresente como hipótese a validar.
- Não invente números de alcance, engajamento, seguidores, concorrentes ou tendências atuais específicas.
- Seja prático, comercial e adaptado ao negócio.

DADOS FORNECIDOS:
Perfil informado: ${username}
Empresa: ${empresa}
Segmento: ${segmento}
Público-alvo: ${publicoAlvo}
Principal desafio: ${desafio}

Retorne EXCLUSIVAMENTE um objeto JSON válido com esta estrutura exata:
{
  "scoreGeral": número inteiro de 0 a 100,
  "diagnostico": {
    "bio": número, "foto": número, "nomePerfil": número, "nomeUsuario": número,
    "destaques": número, "frequencia": número, "identidadeVisual": número,
    "posicionamento": número, "clarezaOferta": número, "cta": número, "propostaValor": número
  },
  "pontosFortes": [4 textos],
  "pontosAtencao": [5 textos],
  "oportunidades": [5 textos],
  "estrategiaRecomendada": "texto estruturado e direto com prioridade, posicionamento e conversão",
  "conteudosPerformance": [
    {"tema":"", "formato":"", "objetivo":"", "motivo":"", "emocao":"", "gatilho":"", "replicacao":""}
  ],
  "hooks": [20 ganchos em português, cada um com exatamente 10 palavras],
  "ideiasConteudo": [
    {"titulo":"", "formato":"", "objetivo":"", "gancho":"", "cta":""}
  ],
  "tendencias": [
    {"titulo":"", "porQueFunciona":"", "comoAdaptar":"", "formato":"", "comoAumentarRetencao":"", "comoConverter":""}
  ],
  "plano30Dias": [30 objetos, um por dia, com {"dia":1, "tarefa":"", "tipo":"descoberta|consideracao|autoridade|relacionamento|prova_social|conversao"}],
  "gargalos": [5 objetos com {"titulo":"", "impacto":""}]
}

Quantidades obrigatórias: 5 conteudosPerformance, 20 hooks, 20 ideiasConteudo, 5 tendencias, 30 dias e 5 gargalos.`;

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Você é um estrategista brasileiro de marketing para pequenos negócios. Retorne somente JSON válido e nunca alegue acesso a dados que não recebeu.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");
    const diagnostico = diagnosticKeys.reduce((result, key) => {
      result[key] = clampScore(raw.diagnostico?.[key]);
      return result;
    }, {} as Record<string, number>);

    const allowedTypes = new Set(["descoberta", "consideracao", "autoridade", "relacionamento", "prova_social", "conversao"]);
    const data: any = {
      scoreGeral: clampScore(raw.scoreGeral),
      diagnostico,
      pontosFortes: list(raw.pontosFortes),
      pontosAtencao: list(raw.pontosAtencao),
      oportunidades: list(raw.oportunidades),
      estrategiaRecomendada: safeText(raw.estrategiaRecomendada, "Priorize clareza de oferta, prova social e chamadas para ação mensuráveis."),
      conteudosPerformance: Array.isArray(raw.conteudosPerformance) ? raw.conteudosPerformance.slice(0, 5) : [],
      hooks: Array.isArray(raw.hooks) ? raw.hooks.map((item: unknown) => String(item || "").trim()).filter(Boolean).slice(0, 20) : [],
      ideiasConteudo: Array.isArray(raw.ideiasConteudo) ? raw.ideiasConteudo.slice(0, 20) : [],
      tendencias: Array.isArray(raw.tendencias) ? raw.tendencias.slice(0, 5) : [],
      plano30Dias: Array.isArray(raw.plano30Dias)
        ? raw.plano30Dias.slice(0, 30).map((item: any, index: number) => ({
            dia: index + 1,
            tarefa: safeText(item?.tarefa, "Executar e medir uma ação de conteúdo."),
            tipo: allowedTypes.has(item?.tipo) ? item.tipo : "descoberta",
          }))
        : [],
      gargalos: Array.isArray(raw.gargalos) ? raw.gargalos.slice(0, 5) : [],
    };

    while (data.hooks.length < 20) data.hooks.push(`Mostre por que sua solução transforma escolhas em resultados melhores`);
    while (data.ideiasConteudo.length < 20) data.ideiasConteudo.push({ titulo: "Dúvida frequente do cliente", formato: "Reels", objetivo: "Educar", gancho: "Você ainda acredita nisso?", cta: "Envie sua dúvida no direct." });
    while (data.conteudosPerformance.length < 5) data.conteudosPerformance.push({ tema: "Bastidores", formato: "Reels", objetivo: "Autoridade", motivo: "Humaniza a marca", emocao: "Confiança", gatilho: "Prova", replicacao: "Mostre uma etapa real do atendimento." });
    while (data.tendencias.length < 5) data.tendencias.push({ titulo: "Conteúdo educativo curto", porQueFunciona: "Entrega valor rapidamente", comoAdaptar: "Responda uma dúvida comum", formato: "Reels", comoAumentarRetencao: "Abra com uma pergunta direta", comoConverter: "Finalize com convite para o WhatsApp." });
    while (data.plano30Dias.length < 30) data.plano30Dias.push({ dia: data.plano30Dias.length + 1, tarefa: "Publicar conteúdo educativo e medir respostas.", tipo: "descoberta" });
    while (data.gargalos.length < 5) data.gargalos.push({ titulo: "Falta de evidência", impacto: "Sem dados reais, decisões podem ser baseadas em percepção. Valide no Instagram Insights." });

    data.rawReportMarkdown = buildMarkdown(data, { username, empresa, segmento });
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("/api/instagram-audit", error);
    return res.status(500).json({ error: error.message || "Erro ao gerar auditoria de Instagram." });
  }
}
