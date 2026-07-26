# Correção do erro ERR_MODULE_NOT_FOUND na Vercel

Alterações aplicadas:

- A função da API agora usa a rota catch-all `api/[...path].ts`.
- O backend não depende mais do import `../server` em `api/index.ts`.
- O arquivo `api/index.ts` foi removido.
- O `vercel.json` não redireciona mais todas as rotas de API para `/api/index`.
- O build da Vercel gera apenas o frontend com `vite build`; a API é empacotada separadamente pela Vercel.

Rotas preservadas:

- `/api/health`
- `/api/chat`
- `/api/report`
- `/api/radar`
- `/api/post-generator`
- `/api/instagram-audit`
