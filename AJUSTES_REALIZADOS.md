# Ajustes realizados

## Segurança e autenticação
- Removidos botões e funções de acesso rápido com senhas fixas.
- Removido login falso do Google que utilizava senha padrão.
- Removidas senhas administrativas gravadas no servidor.
- Removida sincronização pública via KVDB.
- Banco simulado bloqueado em produção.
- Produção falha de forma segura quando o Firebase não está configurado.
- Cadastro não redefine mais a senha de uma conta existente.
- Validação de whitelist não libera acesso em caso de erro.

## Inteligência artificial
- Criada camada única de provedor de IA.
- Gemini e OpenAI/GPT podem ser alternados por `AI_PROVIDER`.
- Chaves permanecem somente no servidor/Vercel.
- Modelo Gemini e modelo GPT são configuráveis por variável de ambiente.

## Deploy
- Documentadas todas as variáveis necessárias em `.env.example`.
- README atualizado com instruções de Firebase, Vercel e troca do provedor.
- Estrutura de API da Vercel mantida.

## Configuração recomendada na Vercel
Use inicialmente:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=SUA_CHAVE
GEMINI_MODEL=gemini-3.5-flash
```

Quando for trocar para GPT:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=SUA_CHAVE_OPENAI
OPENAI_MODEL=gpt-5.2
```

Também cadastre todas as variáveis `VITE_FIREBASE_*` listadas no `.env.example`.
