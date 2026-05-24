-- Run if kohinoor_company already exists

alter table kohinoor_company
  add column if not exists facebook_link text not null default '';

alter table kohinoor_company
  add column if not exists instagram_link text not null default '';

alter table kohinoor_company
  add column if not exists tiktok_link text not null default '';
