-- Run once in Supabase SQL Editor if decoration_groups already exists

alter table decoration_groups
  add column if not exists price numeric(12, 2) not null default 0;

comment on column decoration_groups.price is 'Package price in Mauritian Rupees (MUR)';
