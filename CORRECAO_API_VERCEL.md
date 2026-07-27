# Correção da API para Vercel

## Problema encontrado
As funções `api/index.ts` e `api/[...path].ts` importavam o backend da raiz (`../server` / `../server.ts`). No runtime ESM da Vercel esse import permaneceu sem resolução e gerou `ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/server'`, derrubando todas as rotas.

## Correção aplicada
- A aplicação Express completa foi incorporada diretamente em `api/[...path].ts`.
- Foram removidas as entradas conflitantes `api/index.ts` e `api/instagram-audit.ts`.
- A função dinâmica agora atende todas as rotas: chat, relatório, radar, post, auditoria do Instagram e artes.
- Nenhum arquivo da função depende mais de `../server`.

## Publicação
Envie todo o conteúdo desta pasta para a raiz do repositório GitHub e aguarde o deploy automático da Vercel. Caso não inicie automaticamente, faça Redeploy sem usar cache.

## Variáveis necessárias na Vercel
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (opcional)
- `OPENAI_IMAGE_MODEL` (opcional)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

As variáveis devem estar habilitadas para Production.
