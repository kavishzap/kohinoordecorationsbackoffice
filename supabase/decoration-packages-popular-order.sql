-- Run in Supabase SQL Editor: display order + most popular flag for packages

alter table decoration_packages
  add column if not exists display_order integer not null default 1,
  add column if not exists most_popular boolean not null default false;

alter table decoration_packages drop constraint if exists decoration_packages_display_order_positive;

alter table decoration_packages add constraint decoration_packages_display_order_positive check (
  display_order >= 1
);

create index if not exists decoration_packages_user_wedding_order_idx
  on decoration_packages (user_id, wedding_type, display_order asc);
