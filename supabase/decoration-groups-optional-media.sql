-- Run in Supabase SQL Editor: Inside 2 image and video are optional on groups

alter table decoration_groups
  alter column inside_2_key drop not null,
  alter column video_key drop not null;
