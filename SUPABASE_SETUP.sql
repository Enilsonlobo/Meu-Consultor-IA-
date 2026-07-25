create table if not exists public.app_records (
  id text primary key,
  collection text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_records_collection_idx on public.app_records(collection);
create index if not exists app_records_owner_idx on public.app_records(owner_id);

alter table public.app_records enable row level security;

drop policy if exists "Usuários leem seus registros" on public.app_records;
create policy "Usuários leem seus registros" on public.app_records
for select using (auth.uid() = owner_id or (collection = 'instagramAudits' and coalesce((data->>'published')::boolean, false)));

drop policy if exists "Usuários criam seus registros" on public.app_records;
create policy "Usuários criam seus registros" on public.app_records
for insert with check (auth.uid() = owner_id);

drop policy if exists "Usuários atualizam seus registros" on public.app_records;
create policy "Usuários atualizam seus registros" on public.app_records
for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Usuários excluem seus registros" on public.app_records;
create policy "Usuários excluem seus registros" on public.app_records
for delete using (auth.uid() = owner_id);
