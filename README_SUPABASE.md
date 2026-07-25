# Versão Supabase — passos de publicação

1. No Supabase, abra **SQL Editor**, cole todo o conteúdo de `SUPABASE_SETUP.sql` e clique em **Run**.
2. Na Vercel, em **Settings > Environment Variables**, cadastre:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = Publishable key / anon public
3. Em Supabase > Authentication > URL Configuration:
   - Site URL: `https://meuconsultor-ia.vercel.app`
   - Redirect URL: `https://meuconsultor-ia.vercel.app/**`
4. Envie os arquivos deste projeto ao GitHub e faça um novo deploy sem cache na Vercel.
5. O usuário criado em Supabase > Authentication > Users passará a autenticar no site.

Nunca coloque a chave `service_role` no GitHub ou em variável `VITE_`.
