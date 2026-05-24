-- Run in Supabase SQL Editor (metadata for R2-stored decoration groups)

create table if not exists decoration_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  section text not null,
  name text not null,
  price numeric(12, 2),
  front_key text not null,
  inside_1_key text not null,
  inside_2_key text,
  video_key text,
  created_at timestamptz not null default now(),
  constraint decoration_groups_section_check check (
    section in (
      'haldi',
      'mehendi',
      'reception',
      'stage',
      'entrance',
      'table-decor',
      'wedding',
      'photo-corner',
      'nikka-decor',
      'cake-canopy',
      'outdoor-decor',
      'wedding-accessories'
    )
  )
);

create index if not exists decoration_groups_user_section_idx
  on decoration_groups (user_id, section, created_at desc);

alter table decoration_groups enable row level security;

drop policy if exists "decoration_groups_select_own" on decoration_groups;
drop policy if exists "decoration_groups_insert_own" on decoration_groups;
drop policy if exists "decoration_groups_delete_own" on decoration_groups;

create policy "decoration_groups_select_own"
  on decoration_groups for select
  using (auth.uid() = user_id);

create policy "decoration_groups_insert_own"
  on decoration_groups for insert
  with check (auth.uid() = user_id);

create policy "decoration_groups_delete_own"
  on decoration_groups for delete
  using (auth.uid() = user_id);

create policy "decoration_groups_update_own"
  on decoration_groups for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
