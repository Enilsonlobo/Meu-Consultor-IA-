-- Execute no Supabase > SQL Editor. Pode ser executado novamente com segurança.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  profile_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists profile_data jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.app_records (
  id text primary key default gen_random_uuid()::text,
  collection text not null,
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_records add column if not exists collection text;
alter table public.app_records add column if not exists user_id uuid;
alter table public.app_records add column if not exists data jsonb not null default '{}'::jsonb;
alter table public.app_records add column if not exists created_at timestamptz not null default now();
alter table public.app_records add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'app_records_user_id_fkey'
      and conrelid = 'public.app_records'::regclass
  ) then
    alter table public.app_records
      add constraint app_records_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end
$$;

create index if not exists app_records_collection_idx on public.app_records(collection);
create index if not exists app_records_user_idx on public.app_records(user_id);

alter table public.profiles enable row level security;
alter table public.app_records enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "records_select_own_or_public" on public.app_records;
create policy "records_select_own_or_public" on public.app_records for select using (
  auth.uid() = user_id
  or (collection = 'instagram_audits' and coalesce((data->>'published')::boolean, false) = true)
);
drop policy if exists "records_insert_own" on public.app_records;
create policy "records_insert_own" on public.app_records for insert with check (auth.uid() = user_id);
drop policy if exists "records_update_own" on public.app_records;
create policy "records_update_own" on public.app_records for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "records_delete_own" on public.app_records;
create policy "records_delete_own" on public.app_records for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, profile_data)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    jsonb_build_object(
      'uid', new.id,
      'email', new.email,
      'displayName', coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
      'plan', 'Membro',
      'createdAt', now()
    )
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
