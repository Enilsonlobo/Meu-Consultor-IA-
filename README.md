# Meu Consultor IA®

Aplicação React/Vite com backend Express, autenticação Firebase e camada de IA intercambiável entre Gemini e OpenAI/GPT.

## Instalação local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variáveis na Vercel

Cadastre todas as variáveis `VITE_FIREBASE_*`. Para IA, escolha:

- Gemini: `AI_PROVIDER=gemini`, `GEMINI_API_KEY` e opcionalmente `GEMINI_MODEL`.
- GPT: `AI_PROVIDER=openai`, `OPENAI_API_KEY` e opcionalmente `OPENAI_MODEL`.

Nunca grave chaves, senhas ou tokens no GitHub. Após alterar variáveis na Vercel, faça um novo deploy.

## Firebase

Ative **Authentication > Email/Password** e adicione o domínio da Vercel em **Authentication > Settings > Authorized domains**. O Firestore deve possuir regras que permitam a cada usuário acessar apenas seus próprios dados.

## Comandos

```bash
npm run lint
npm run build
npm start
```
