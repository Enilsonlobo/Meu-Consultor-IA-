import express, { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "8mb" }));

const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseServer = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada na Vercel.");
  return new OpenAI({ apiKey });
}

const SYSTEM = `Você é o Meu Consultor IA®, consultor empresarial para pequenas empresas brasileiras. Responda sempre em português do Brasil, com linguagem clara, profissional e prática. Personalize pelo segmento, cidade, porte, faturamento e objetivo informados. Não invente fatos, métricas ou pesquisas. Estruture respostas importantes em: Resumo, Diagnóstico, Prioridade, Plano de ação (Hoje, Esta semana, Próximos 30 dias), Materiais prontos e Próximo passo. Entregue scripts, mensagens, roteiros e checklists prontos para uso quando forem úteis.`;

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!supabaseServer) return res.status(500).json({ error: "Supabase não configurado no servidor." });
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Sessão não encontrada. Entre novamente." });
  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Sessão inválida ou expirada." });
  (req as any).user = data.user;
  next();
}

async function textCompletion(prompt: string, system = SYSTEM) {
  const result = await getOpenAI().chat.completions.create({
    model,
    temperature: 0.55,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });
  return result.choices[0]?.message?.content?.trim() || "Não foi possível gerar a resposta.";
}

async function jsonCompletion<T>(prompt: string): Promise<T> {
  const result = await getOpenAI().chat.completions.create({
    model,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `${SYSTEM}\nRetorne exclusivamente JSON válido, sem markdown.` },
      { role: "user", content: prompt },
    ],
  });
  return JSON.parse(result.choices[0]?.message?.content || "{}") as T;
}

app.get("/api/health", (_req, res) => res.json({
  ok: true,
  provider: process.env.OPENAI_API_KEY ? "openai-configured" : "openai-missing",
  database: supabaseServer ? "supabase-configured" : "supabase-missing",
}));

app.post("/api/chat", requireAuth, async (req, res) => {
  try {
    const { messages, profile } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: "Mensagens inválidas." });
    const context = profile ? `Empresa: ${profile.empresa || "não informada"}\nSegmento: ${profile.segmento || "não informado"}\nCidade: ${profile.cidade || "não informada"}\nFaturamento: ${profile.faturamento || "não informado"}\nObjetivos: ${profile.objetivos || "não informados"}` : "";
    const history = messages.slice(-16).map((m: any) => `${m.role === "model" ? "CONSULTOR" : "CLIENTE"}: ${String(m.text || "")}`).join("\n\n");
    res.json({ text: await textCompletion(`${context}\n\nCONVERSA:\n${history}`) });
  } catch (error: any) {
    console.error("/api/chat", error);
    res.status(500).json({ error: error.message || "Erro ao consultar a IA." });
  }
});

app.post("/api/report", requireAuth, async (req, res) => {
  try {
    const { profile, answers, pillars, score } = req.body || {};
    const text = await textCompletion(`Crie um relatório executivo de diagnóstico empresarial completo em Markdown.\nPerfil: ${JSON.stringify(profile)}\nPontuação geral: ${score}\nPilares: ${JSON.stringify(pillars)}\nRespostas: ${JSON.stringify(answers)}\nInclua análise dos pontos fortes, gargalos, riscos, prioridades e plano executável.`);
    res.json({ text });
  } catch (error: any) {
    console.error("/api/report", error);
    res.status(500).json({ error: error.message || "Erro ao gerar relatório." });
  }
});

app.post("/api/radar", requireAuth, async (req, res) => {
  try {
    const { cidade, segmento, empresa } = req.body || {};
    if (!cidade?.trim() || !segmento?.trim()) return res.status(400).json({ error: "Informe cidade e segmento." });
    const text = await textCompletion(`Produza um radar estratégico de concorrência para a empresa ${empresa || "informada"}, segmento ${segmento}, em ${cidade}. Não afirme ter pesquisado concorrentes reais. Apresente padrões de mercado, oportunidades de diferenciação, checklist de pesquisa local, comparação estratégica e plano de 30 dias.`);
    res.json({ text });
  } catch (error: any) {
    console.error("/api/radar", error);
    res.status(500).json({ error: error.message || "Erro ao gerar radar." });
  }
});

app.post("/api/post-generator", requireAuth, async (req, res) => {
  try {
    const { profile, topic, tone } = req.body || {};
    const data = await jsonCompletion<any>(`Crie conteúdo para um post de Instagram. Empresa: ${JSON.stringify(profile)}. Tema: ${topic}. Tom: ${tone}. Retorne as chaves headline, subheadline, cta, caption, suggestedStyle. suggestedStyle deve ser: Sleek Obsidian, Corporate Blue, Emerald Authority, Royal Purple ou Minimal Light.`);
    res.json({
      headline: String(data.headline || "Transforme sua empresa"),
      subheadline: String(data.subheadline || "Estratégia prática para crescer"),
      cta: String(data.cta || "Fale conosco"),
      caption: String(data.caption || ""),
      suggestedStyle: data.suggestedStyle || "Sleek Obsidian",
    });
  } catch (error: any) {
    console.error("/api/post-generator", error);
    res.status(500).json({ error: error.message || "Erro ao gerar publicação." });
  }
});

app.post("/api/instagram-audit", requireAuth, async (req, res) => {
  try {
    const { username, empresa, segmento, publicoAlvo, desafio } = req.body || {};
    const data = await jsonCompletion<any>(`Faça uma auditoria estratégica orientativa do Instagram apenas com os dados fornecidos; não diga que acessou o perfil real. Usuário: ${username}. Empresa: ${empresa}. Segmento: ${segmento}. Público: ${publicoAlvo}. Desafio: ${desafio}. Retorne JSON com scoreGeral, diagnostico, pontosFortes, pontosAtencao, oportunidades, planoAcao, bioSugerida, pilaresConteudo e calendario7Dias (objetos com dia, formato, tema, cta).`);
    res.json(data);
  } catch (error: any) {
    console.error("/api/instagram-audit", error);
    res.status(500).json({ error: error.message || "Erro ao gerar auditoria." });
  }
});

app.post("/api/art-usage", requireAuth, async (_req, res) => {
  res.json({ used: 0, remaining: 8, limit: 8, admin: false });
});

app.post("/api/art-history", requireAuth, async (_req, res) => {
  res.json({ items: [] });
});

app.post("/api/improve-art-prompt", requireAuth, async (req, res) => {
  try {
    const { prompt, format, profile } = req.body || {};
    if (!prompt?.trim()) return res.status(400).json({ error: "Descreva a arte desejada." });
    const improved = await textCompletion(`Transforme a ideia abaixo em um briefing visual detalhado para geração de imagem publicitária. Não inclua textos longos dentro da imagem. Empresa: ${JSON.stringify(profile)}. Formato: ${format}. Ideia: ${prompt}. Retorne somente o briefing aprimorado, em português.`);
    res.json({ prompt: improved });
  } catch (error: any) {
    console.error("/api/improve-art-prompt", error);
    res.status(500).json({ error: error.message || "Erro ao aprimorar o briefing." });
  }
});

app.post("/api/generate-art", requireAuth, async (req, res) => {
  try {
    const { prompt, format, quality, profile } = req.body || {};
    if (!prompt?.trim()) return res.status(400).json({ error: "Descreva a arte desejada." });
    const size = format === "feed" ? "1024x1024" : format === "landscape" ? "1536x1024" : "1024x1536";
    const fullPrompt = `Crie uma arte publicitária profissional, limpa e de alta conversão. Empresa: ${profile?.empresa || "empresa brasileira"}. Segmento: ${profile?.segmento || "serviços"}. Briefing: ${prompt}. Composição adequada ao formato ${format}. Evite logotipos inventados, marcas d'água e textos ilegíveis.`;
    const result = await getOpenAI().images.generate({
      model: imageModel,
      prompt: fullPrompt,
      size: size as any,
      quality: quality === "high" ? "high" : "medium",
      output_format: "png",
    } as any);
    const item: any = result.data?.[0];
    const image = item?.b64_json ? `data:image/png;base64,${item.b64_json}` : item?.url;
    if (!image) throw new Error("A IA não retornou a imagem.");
    res.json({ image, used: 1, remaining: 7, limit: 8, admin: false });
  } catch (error: any) {
    console.error("/api/generate-art", error);
    res.status(500).json({ error: error.message || "Erro ao gerar a arte." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
});

export default app;
