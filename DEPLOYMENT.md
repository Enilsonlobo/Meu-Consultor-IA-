# 🚀 Meu Consultor IA® — Guia de Deployment

## ✅ Status da Migração

Migração **100% concluída** de:
- ✅ **Firebase → Supabase** (Autenticação e Banco de Dados)
- ✅ **Gemini → OpenAI** (Geração de Conteúdo)
- ✅ **Removido:** Código legado de simdb, whitelist, GoogleGenAI

---

## 🔧 Variáveis Obrigatórias na Vercel

Configure as seguintes variáveis de ambiente no painel da Vercel:

### **Client-Side (VITE_* — visíveis ao navegador)**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Obtenha esses valores em:
- **Supabase Dashboard** → Seu Projeto → Settings → API

### **Server-Side (apenas Vercel — não visíveis ao cliente)**
```
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4-mini
```

Configure em:
- **Vercel Dashboard** → Seu Projeto → Settings → Environment Variables

---

## 📊 Estrutura do Banco Supabase

Antes de colocar em produção, execute este SQL no **Supabase SQL Editor**:

```sql
-- Arquivo: SUPABASE_SETUP.sql
-- Execute todo o conteúdo do arquivo no SQL Editor do Supabase
```

Ou copy-paste do arquivo `SUPABASE_SETUP.sql` deste repositório.

**Tabelas criadas:**
- `auth.users` — Gerenciado automaticamente pelo Supabase Auth
- `public.profiles` — Dados do perfil do usuário
- `public.app_records` — Chats, diagnósticos, auditorias (multitenante)

---

## 🔐 Fluxo de Autenticação

1. **Frontend** (`src/auth.ts` → `ReliableAuth`):
   - Signup/Login via Supabase Auth
   - Interceptor automático de fetch para requisições `/api/*`
   - Adiciona `Authorization: Bearer {access_token}` em cada chamada

2. **Backend** (`server.ts`):
   - Middleware `requireAuth` valida token com `supabase.auth.getUser(token)`
   - Retorna 401 se inválido ou expirado
   - Attach `req.user` para uso nas rotas

3. **Persistência**:
   - Session armazenada no localStorage (browser)
   - Profile sincronizado em `public.profiles`

---

## 🔌 Endpoints de API

Todos os endpoints estão em `/api/*` e requerem autenticação:

| Endpoint | POST | Função |
|----------|------|--------|
| `/api/health` | ✅ | Verifica status (sem autenticação) |
| `/api/chat` | ✅ | Consulta conversacional (OpenAI) |
| `/api/report` | ✅ | Gera relatório executivo |
| `/api/radar` | ✅ | Análise de concorrência |
| `/api/post-generator` | ✅ | Cria posts para Instagram |
| `/api/instagram-audit` | ✅ | Auditoria de conta Instagram |

**Exemplo de requisição (client):**
```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    messages: [...], 
    profile: { empresa: "...", segmento: "..." } 
  }),
});
```

O header `Authorization` é **adicionado automaticamente** pelo interceptor de fetch.

---

## 🚀 Deployment na Vercel

### **Pré-requisitos**
- Projeto GitHub conectado à Vercel
- Supabase projeto criado e configurado
- OpenAI API key gerada

### **Passos**

1. **Clone e configure local:**
   ```bash
   git clone https://github.com/Enilsonlobo/Meu-Consultor-IA-.git
   cd Meu-Consultor-IA-
   npm install
   ```

2. **Configure `.env.local` para desenvolvimento:**
   ```bash
   cp .env.example .env.local
   # Edite e adicione suas chaves
   ```

3. **Teste localmente:**
   ```bash
   npm run build
   npm run lint
   npm run dev
   ```

4. **Configure Vercel:**
   - Acesse: https://vercel.com/dashboard
   - Selecione o projeto
   - Vá em **Settings** → **Environment Variables**
   - Adicione as 4 variáveis obrigatórias (ver seção anterior)

5. **Deploy automático:**
   - Push para `main` branch
   - Vercel detecta e faz deploy automaticamente
   - Função serverless em `/api/index` será criada

6. **Verifique o deploy:**
   ```bash
   curl https://seu-projeto.vercel.app/api/health
   ```
   Deve retornar: `{"ok": true, "provider": "openai", "database": "supabase"}`

---

## 📝 Configuração de Build

O `vercel.json` está otimizado para:
- ✅ Servir assets estáticos (`/assets/*`)
- ✅ Rotear `/api/*` para função serverless
- ✅ Servir SPA (`index.html`) para todas as outras rotas

**Não altere rewrites em vercel.json sem testar!**

---

## 🔍 Troubleshooting

### **Erro 401 em requisições API**
- ✅ Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretos
- ✅ Verifique se o usuário está autenticado (token válido)
- ✅ Verifique se `installAuthorizedApiFetch()` foi chamado (automaticamente em src/auth.ts)

### **Erro 500 no `/api/chat`**
- ✅ Verifique se `OPENAI_API_KEY` está configurada na Vercel
- ✅ Verifique limites de quota da OpenAI
- ✅ Veja logs: Vercel → Projeto → Deployments → Função → Logs

### **Perfil não carrega**
- ✅ Verifique se `public.profiles` table existe no Supabase
- ✅ Execute `SUPABASE_SETUP.sql` completo
- ✅ Verifique RLS policies (Row Level Security)

### **Build falha localmente**
```bash
npm run clean
npm install
npm run lint  # Veja erros de tipo
npm run build  # Veja erros de build
```

---

## 📦 Estrutura de Produção

```
.
├── dist/                    # Output do build Vite
│   ├── index.html          # SPA HTML
│   ├── assets/             # CSS e JS minificados
│   ├── server.cjs          # Servidor Node.js bundled
│   └── server.cjs.map      # Source map
├── api/
│   └── index.ts            # Handler serverless da Vercel
├── src/
│   ├── App.tsx             # App React principal
│   ├── auth.ts             # Supabase Auth adapter
│   ├── components/         # Componentes React
│   ├── supabase.ts         # Supabase client
│   └── vite-env.d.ts       # Tipagem de env
├── server.ts               # Express app
├── vercel.json             # Configuração Vercel
├── tsconfig.json           # TypeScript config
└── package.json            # Dependências (apenas Supabase + OpenAI)
```

---

## ✅ Checklist de Deploy

- [ ] Supabase projeto criado e URL/Key disponíveis
- [ ] OpenAI API key gerada e quota disponível
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] `SUPABASE_SETUP.sql` executado no Supabase
- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` sem erros
- [ ] Teste `/api/health` endpoint
- [ ] Teste login/signup no frontend
- [ ] Teste `/api/chat` com usuário autenticado
- [ ] Monitore logs da Vercel após deploy

---

## 🔗 Referências

- **Supabase Docs**: https://supabase.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Vercel Functions**: https://vercel.com/docs/concepts/functions/serverless-functions
- **Express.js**: https://expressjs.com/

---

**Versão:** 1.0.0  
**Data:** 2026-07-26  
**Status:** ✅ Production-Ready
