-- Run in Supabase SQL Editor (optional price + allow editing rows)

alter table decoration_groups
  alter column price drop not null;

alter table decoration_groups
  alter column price drop default;

drop policy if exists "decoration_groups_update_own" on decoration_groups;

create policy "decoration_groups_update_own"
  on decoration_groups for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
