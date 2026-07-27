# Auditoria técnica — Meu Consultor IA

## Correções aplicadas

1. A função serverless curinga da Vercel (`api/[...path].ts`) agora importa uma única implementação do backend (`server.ts`). Isso elimina versões divergentes das mesmas rotas.
2. O Radar da Concorrência passou a entregar a análise mesmo quando a gravação do histórico no Supabase falhar.
3. O Radar agora exibe a mensagem real devolvida pela API, facilitando a identificação de sessão expirada, variável ausente ou falha do provedor.

## Estrutura validada

- A entrada ativa do frontend é `src/main.tsx`.
- Os componentes ativos estão em `src/components`.
- Os arquivos duplicados na raiz são legados e não participam do build atual.
- A autenticação injeta o token Supabase automaticamente em chamadas para `/api/*`.
- O criador de artes usa `/api/art-usage`, `/api/art-history`, `/api/improve-art-prompt` e `/api/generate-art`, todas presentes em `server.ts`.

## Variáveis obrigatórias na Vercel

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (opcional; padrão: `gpt-4.1-mini`)
- `OPENAI_IMAGE_MODEL` (opcional; padrão: `gpt-image-1`)
- `SUPABASE_URL` ou `VITE_SUPABASE_URL`
- `SUPABASE_ANON_KEY` ou `VITE_SUPABASE_ANON_KEY`

## Observação de teste

O ambiente de auditoria não conseguiu concluir `npm ci` por indisponibilidade de rede. Portanto, o pacote foi revisado estruturalmente, mas o build final deve ser executado no GitHub Actions/Vercel após o envio.
