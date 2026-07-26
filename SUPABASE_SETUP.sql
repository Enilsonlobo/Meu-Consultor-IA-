create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  profile_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Usuários leem seu perfil" on public.profiles;
create policy "Usuários leem seu perfil" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Usuários criam seu perfil" on public.profiles;
create policy "Usuários criam seu perfil" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Usuários atualizam seu perfil" on public.profiles;
create policy "Usuários atualizam seu perfil" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create table if not exists public.app_records (
  id text primary key default gen_random_uuid()::text,
  collection text not null,
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'app_records' and column_name = 'owner_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'app_records' and column_name = 'user_id'
  ) then
    alter table public.app_records rename column owner_id to user_id;
  end if;
end $$;

alter table public.app_records alter column id set default gen_random_uuid()::text;
create index if not exists app_records_collection_idx on public.app_records(collection);
create index if not exists app_records_user_idx on public.app_records(user_id);

alter table public.app_records enable row level security;
drop policy if exists "Usuários leem seus registros" on public.app_records;
create policy "Usuários leem seus registros" on public.app_records
for select using (
  auth.uid() = user_id
  or (collection = 'instagramAudits' and coalesce((data->>'published')::boolean, false))
);

drop policy if exists "Usuários criam seus registros" on public.app_records;
create policy "Usuários criam seus registros" on public.app_records
for insert with check (auth.uid() = user_id);

drop policy if exists "Usuários atualizam seus registros" on public.app_records;
create policy "Usuários atualizam seus registros" on public.app_records
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Usuários excluem seus registros" on public.app_records;
create policy "Usuários excluem seus registros" on public.app_records
for delete using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.app_records to authenticated;
grant select on public.app_records to anon;
