-- Run in Supabase SQL Editor when create group fails with:
--   decoration_groups_section_check
-- (table was created before Photo Corner, Cake Canopy, etc. were added)

alter table decoration_groups drop constraint if exists decoration_groups_section_check;

alter table decoration_groups add constraint decoration_groups_section_check check (
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
);
