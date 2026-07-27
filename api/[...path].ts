import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient, type User } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "3mb" }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://fldhvvwcjxwnutkjanud.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_UJRx_Z0EDrVQI6zCLMDyZg_zd9WDkk-";
const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SYSTEM = `Você é o Meu Consultor IA®, consultor empresarial para pequenas empresas brasileiras. Responda sempre em português do Brasil, com linguagem clara, profissional e prática. Personalize pelo segmento, cidade, porte, faturamento e objetivo informados. Não invente fatos, métricas ou pesquisas. Estruture respostas importantes em: Resumo, Diagnóstico, Prioridade, Plano de ação (Hoje, Esta semana, Próximos 30 dias), Materiais prontos e Próximo passo. Entregue scripts, mensagens, roteiros e checklists prontos para uso quando forem úteis.`;

interface AuthenticatedRequest extends Request {
  user?: User;
  accessToken?: string;
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Sessão não encontrada. Entre novamente." });
  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Sessão inválida ou expirada." });
  req.user = data.user;
  req.accessToken = token;
  next();
}

function userSupabase(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
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
  return JSON.parse(result.choices[0]?.message?.content || "{}") as T;
}

function startOfBrazilDayIso() {
  const now = new Date();
  const brazilDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return `${brazilDate}T00:00:00-03:00`;
}

function imageSize(format: string): "1024x1024" | "1024x1536" | "1536x1024" {
  if (format === "story" || format === "reels") return "1024x1536";
  if (format === "landscape") return "1536x1024";
  return "1024x1024";
}

function isOwner(user?: User) {
  return user?.email?.toLowerCase() === "enilsonlobo32@gmail.com";
}

app.get("/api/health", (_req, res) => res.json({ ok: true, provider: "openai", database: "supabase" }));

app.post("/api/art-usage", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (isOwner(req.user)) return res.json({ used: 0, remaining: 8, limit: 8, admin: true });
    const client = userSupabase(req.accessToken!);
    const { count, error } = await client
      .from("app_records")
      .select("id", { count: "exact", head: true })
      .eq("collection", "art_generations")
      .eq("user_id", req.user!.id)
      .gte("created_at", startOfBrazilDayIso());
    if (error) throw error;
    const used = count || 0;
    res.json({ used, remaining: Math.max(0, 8 - used), limit: 8, admin: false });
  } catch (error: any) {
    console.error("/api/art-usage", error);
    res.status(500).json({ error: error.message || "Erro ao consultar limite diário." });
  }
});

app.post("/api/improve-art-prompt", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { prompt, profile, format = "feed" } = req.body || {};
    if (!prompt || String(prompt).trim().length < 5) {
      return res.status(400).json({ error: "Escreva uma ideia inicial para a IA aprimorar." });
    }
    const improvedPrompt = await textCompletion(
      `Transforme a ideia abaixo em um briefing visual profissional para geração de UMA peça publicitária. Preserve a intenção do cliente, não invente descontos, preços, telefones, endereços ou promessas. O briefing final deve ser direto, em um único parágrafo, com até 900 caracteres, incluindo composição, cenário, público, estilo, iluminação, cores, hierarquia e texto exato na arte quando houver. Não escreva introdução, título, aspas ou explicações.\n\nEmpresa: ${profile?.empresa || "não informada"}\nSegmento: ${profile?.segmento || "não informado"}\nCidade: ${profile?.cidade || "não informada"}\nFormato: ${format}\nIdeia original: ${String(prompt).trim()}`,
      "Você é um diretor de criação publicitária brasileiro especializado em transformar ideias simples em briefings visuais claros para geração de imagens por IA. Responda somente com o briefing final em português do Brasil."
    );
    res.json({ prompt: improvedPrompt });
  } catch (error: any) {
    console.error("/api/improve-art-prompt", error);
    res.status(500).json({ error: error.message || "Erro ao aprimorar o briefing." });
  }
});

app.post("/api/art-history", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const client = userSupabase(req.accessToken!);
    const { data, error } = await client
      .from("app_records")
      .select("id, data, created_at")
      .eq("collection", "art_generations")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) throw error;
    res.json({
      items: (data || []).map((item: any) => ({
        id: item.id,
        prompt: item.data?.prompt || "",
        format: item.data?.format || "feed",
        quality: item.data?.quality || "medium",
        createdAt: item.created_at || item.data?.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("/api/art-history", error);
    res.status(500).json({ error: error.message || "Erro ao carregar criações recentes." });
  }
});

app.post("/api/generate-art", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    assertOpenAI();
    const { prompt, format = "feed", quality = "medium", profile } = req.body || {};
    if (!prompt || String(prompt).trim().length < 12) {
      return res.status(400).json({ error: "Descreva a arte com pelo menos 12 caracteres." });
    }

    const admin = isOwner(req.user);
    const client = userSupabase(req.accessToken!);
    if (!admin) {
      const { count, error } = await client
        .from("app_records")
        .select("id", { count: "exact", head: true })
        .eq("collection", "art_generations")
        .eq("user_id", req.user!.id)
        .gte("created_at", startOfBrazilDayIso());
      if (error) throw error;
      if ((count || 0) >= 8) {
        return res.status(429).json({ error: "Você atingiu o limite diário de 8 criações. O limite será renovado amanhã." });
      }
    }

    const businessContext = profile
      ? `Marca: ${profile.empresa || "não informada"}. Segmento: ${profile.segmento || "não informado"}. Cidade: ${profile.cidade || "não informada"}.`
      : "";
    const finalPrompt = `Crie UMA peça publicitária profissional, original e de alto nível visual para uma empresa brasileira. ${businessContext}\nBriefing livre do cliente: ${String(prompt).trim()}\nA composição deve ter acabamento de agência, hierarquia visual clara, excelente legibilidade, iluminação e detalhes realistas quando houver pessoas ou produtos. Não use logotipos de terceiros, marcas d'água, assinaturas ou textos aleatórios. Caso o briefing peça texto na arte, escreva somente o texto solicitado em português do Brasil e revise a ortografia. Não crie colagens, sequências, comparativos ou múltiplas versões na mesma imagem.`;

    const result = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt: finalPrompt,
      size: imageSize(format),
      quality: quality === "high" ? "high" : quality === "low" ? "low" : "medium",
      n: 1,
    });

    const imageBase64 = result.data?.[0]?.b64_json;
    if (!imageBase64) throw new Error("A geração não retornou uma imagem válida.");

    const { error: saveError } = await client.from("app_records").insert({
      collection: "art_generations",
      user_id: req.user!.id,
      data: {
        userId: req.user!.id,
        prompt: String(prompt).trim(),
        format,
        quality,
        createdAt: new Date().toISOString(),
      },
    });
    if (saveError) console.warn("Não foi possível registrar o uso da arte:", saveError.message);

    let used = 0;
    if (!admin) {
      const { count } = await client
        .from("app_records")
        .select("id", { count: "exact", head: true })
        .eq("collection", "art_generations")
        .eq("user_id", req.user!.id)
        .gte("created_at", startOfBrazilDayIso());
      used = count || 1;
    }

    res.json({
      image: `data:image/png;base64,${imageBase64}`,
      used,
      remaining: admin ? 8 : Math.max(0, 8 - used),
      limit: 8,
      admin,
    });
  } catch (error: any) {
    console.error("/api/generate-art", error);
    const status = error?.status === 400 ? 400 : 500;
    res.status(status).json({ error: error.message || "Erro ao criar a arte profissional." });
  }
});

app.post("/api/chat", requireAuth, async (req, res) => {
  try {
    const { messages, profile } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: "Mensagens inválidas." });
    const context = profile ? `Empresa: ${profile.empresa || "não informada"}\nSegmento: ${profile.segmento || "não informado"}\nCidade: ${profile.cidade || "não informada"}\nFaturamento: ${profile.faturamento || "não informado"}\nObjetivos: ${profile.objetivos || "não informados"}` : "";
    const history = messages.slice(-16).map((m: any) => `${m.role === "model" ? "CONSULTOR" : "CLIENTE"}: ${String(m.text || "")}`).join("\n\n");
    res.json({ text: await textCompletion(`${context}\n\nCONVERSA:\n${history}`) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao consultar a IA." });
  }
});

app.post("/api/report", requireAuth, async (req, res) => {
  try {
    const { profile, answers, pillars, score } = req.body || {};
    const text = await textCompletion(`Crie um relatório executivo de diagnóstico empresarial completo em Markdown.\nPerfil: ${JSON.stringify(profile)}\nPontuação geral: ${score}\nPilares: ${JSON.stringify(pillars)}\nRespostas: ${JSON.stringify(answers)}\nInclua análise dos pontos fortes, gargalos, riscos, prioridades e plano executável.`);
    res.json({ text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao gerar relatório." });
  }
});

app.post("/api/radar", requireAuth, async (req, res) => {
  try {
    const { cidade, segmento, empresa } = req.body || {};
    const text = await textCompletion(`Produza um radar estratégico de concorrência para a empresa ${empresa || "informada"}, segmento ${segmento || "não informado"}, em ${cidade || "localidade não informada"}. Não afirme ter pesquisado concorrentes reais. Apresente um método de análise, padrões prováveis do mercado, oportunidades de diferenciação, checklist de pesquisa local e plano de 30 dias.`);
    res.json({ text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao gerar radar." });
  }
});

app.post("/api/post-generator", requireAuth, async (req, res) => {
  try {
    const { profile, topic, tone } = req.body || {};
    const data = await jsonCompletion<any>(`Crie conteúdo para um post de Instagram da empresa abaixo.\nEmpresa: ${JSON.stringify(profile)}\nTema: ${topic}\nTom: ${tone}\nRetorne as chaves: headline, subheadline, cta, caption, suggestedStyle.`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao gerar publicação." });
  }
});

app.post("/api/instagram-audit", requireAuth, async (req, res) => {
  try {
    const { username, empresa, segmento, publicoAlvo, desafio } = req.body || {};
    const data = await jsonCompletion<any>(`Faça uma auditoria estratégica orientativa do Instagram com base apenas nas informações fornecidas; não diga que acessou ou analisou o perfil real. Usuário: ${username}. Empresa: ${empresa}. Segmento: ${segmento}. Público: ${publicoAlvo}. Desafio: ${desafio}. Retorne JSON com: scoreGeral, diagnostico, pontosFortes, pontosAtencao, oportunidades, planoAcao, bioSugerida, pilaresConteudo, calendario7Dias.`);
    res.json(data);
  } catch (error: any) {
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

export default app;
