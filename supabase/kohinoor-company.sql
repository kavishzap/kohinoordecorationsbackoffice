-- Company profile (run in Supabase SQL Editor)

create table if not exists kohinoor_company (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  google_map_location text not null default '',
  facebook_link text not null default '',
  instagram_link text not null default '',
  tiktok_link text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists kohinoor_company_user_id_idx on kohinoor_company (user_id);

alter table kohinoor_company enable row level security;

drop policy if exists "kohinoor_company_select_own" on kohinoor_company;
drop policy if exists "kohinoor_company_insert_own" on kohinoor_company;
drop policy if exists "kohinoor_company_update_own" on kohinoor_company;
drop policy if exists "kohinoor_company_delete_own" on kohinoor_company;

create policy "kohinoor_company_select_own"
  on kohinoor_company for select
  using (auth.uid() = user_id);

create policy "kohinoor_company_insert_own"
  on kohinoor_company for insert
  with check (auth.uid() = user_id);

create policy "kohinoor_company_update_own"
  on kohinoor_company for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "kohinoor_company_delete_own"
  on kohinoor_company for delete
  using (auth.uid() = user_id);

create or replace function kohinoor_company_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kohinoor_company_updated_at on kohinoor_company;

create trigger kohinoor_company_updated_at
  before update on kohinoor_company
  for each row
  execute function kohinoor_company_set_updated_at();
