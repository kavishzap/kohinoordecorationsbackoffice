-- Kohinoor decoration packages (run in Supabase SQL Editor)

-- Wedding type enum for package targeting
do $$
begin
  create type package_wedding_type as enum ('indian_wedding', 'muslim_wedding');
exception
  when duplicate_object then null;
end $$;

create table if not exists decoration_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  pricing_range text not null,
  wedding_type package_wedding_type not null,
  items text[] not null default '{}',
  display_order integer not null default 1,
  most_popular boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint decoration_packages_name_not_empty check (char_length(trim(name)) > 0),
  constraint decoration_packages_pricing_not_empty check (
    char_length(trim(pricing_range)) > 0
  ),
  constraint decoration_packages_items_not_empty check (cardinality(items) > 0),
  constraint decoration_packages_display_order_positive check (display_order >= 1)
);

create index if not exists decoration_packages_user_created_idx
  on decoration_packages (user_id, created_at desc);

create index if not exists decoration_packages_user_wedding_type_idx
  on decoration_packages (user_id, wedding_type);

create index if not exists decoration_packages_user_wedding_order_idx
  on decoration_packages (user_id, wedding_type, display_order asc);

alter table decoration_packages enable row level security;

drop policy if exists "decoration_packages_select_own" on decoration_packages;
drop policy if exists "decoration_packages_insert_own" on decoration_packages;
drop policy if exists "decoration_packages_update_own" on decoration_packages;
drop policy if exists "decoration_packages_delete_own" on decoration_packages;

create policy "decoration_packages_select_own"
  on decoration_packages for select
  using (auth.uid() = user_id);

create policy "decoration_packages_insert_own"
  on decoration_packages for insert
  with check (auth.uid() = user_id);

create policy "decoration_packages_update_own"
  on decoration_packages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "decoration_packages_delete_own"
  on decoration_packages for delete
  using (auth.uid() = user_id);

-- Optional: keep updated_at in sync on row changes
create or replace function decoration_packages_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists decoration_packages_updated_at on decoration_packages;

create trigger decoration_packages_updated_at
  before update on decoration_packages
  for each row
  execute function decoration_packages_set_updated_at();
