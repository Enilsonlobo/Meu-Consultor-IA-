import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "2mb" }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseServer = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

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

function assertOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada na Vercel.");
}

async function textCompletion(prompt: string, system = SYSTEM) {
  assertOpenAI();
  const result = await openai.chat.completions.create({
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
  assertOpenAI();
  const result = await openai.chat.completions.create({
    model,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `${SYSTEM}\nRetorne exclusivamente JSON válido, sem markdown.` },
      { role: "user", content: prompt },
    ],
  });
  const raw = result.choices[0]?.message?.content || "{}";
  return JSON.parse(raw) as T;
}

app.get("/api/health", (_req, res) => res.json({ ok: true, provider: "openai", database: "supabase" }));

app.post("/api/chat", requireAuth, async (req, res) => {
  try {
    const { messages, profile } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: "Mensagens inválidas." });
    const context = profile ? `Empresa: ${profile.empresa || "não informada"}\nSegmento: ${profile.segmento || "não informado"}\nCidade: ${profile.cidade || "não informada"}\nFaturamento: ${profile.faturamento || "não informado"}\nObjetivos: ${profile.objetivos || "não informados"}` : "";
    const history = messages.slice(-16).map((m: any) => `${m.role === "model" ? "CONSULTOR" : "CLIENTE"}: ${String(m.text || "")}`).join("\n\n");
    const text = await textCompletion(`${context}\n\nCONVERSA:\n${history}`);
    res.json({ text });
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
    const text = await textCompletion(`Produza um radar estratégico de concorrência para a empresa ${empresa || "informada"}, segmento ${segmento || "não informado"}, em ${cidade || "localidade não informada"}. Não afirme ter pesquisado concorrentes reais. Apresente um método de análise, padrões prováveis do mercado, oportunidades de diferenciação, checklist de pesquisa local e plano de 30 dias.`);
    res.json({ text });
  } catch (error: any) {
    console.error("/api/radar", error);
    res.status(500).json({ error: error.message || "Erro ao gerar radar." });
  }
});

app.post("/api/post-generator", requireAuth, async (req, res) => {
  try {
    const { profile, topic, tone } = req.body || {};
    const data = await jsonCompletion<any>(`Crie conteúdo para um post de Instagram da empresa abaixo.\nEmpresa: ${JSON.stringify(profile)}\nTema: ${topic}\nTom: ${tone}\nRetorne as chaves: headline, subheadline, cta, caption, suggestedStyle. suggestedStyle deve ser exatamente uma destas opções: Sleek Obsidian, Corporate Blue, Emerald Authority, Royal Purple, Minimal Light.`);
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
    const data = await jsonCompletion<any>(`Faça uma auditoria estratégica orientativa do Instagram com base apenas nas informações fornecidas; não diga que acessou ou analisou o perfil real. Usuário: ${username}. Empresa: ${empresa}. Segmento: ${segmento}. Público: ${publicoAlvo}. Desafio: ${desafio}. Retorne JSON com: scoreGeral (número 0-100), diagnostico (texto), pontosFortes (array de strings), pontosAtencao (array), oportunidades (array), planoAcao (array), bioSugerida (texto), pilaresConteudo (array), calendario7Dias (array de objetos com dia, formato, tema, cta).`);
    res.json(data);
  } catch (error: any) {
    console.error("/api/instagram-audit", error);
    res.status(500).json({ error: error.message || "Erro ao gerar auditoria." });
  }
});

const distPath = path.resolve(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Meu Consultor IA em http://localhost:${port}`));
}

export default app;
