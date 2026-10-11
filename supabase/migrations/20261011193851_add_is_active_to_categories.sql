-- Soft-disable for categories: superadmin can hide a category from browsing
-- without deleting it (and its word_categories links) outright, and can
-- re-enable it later. Words are never hidden as a side effect -- a word
-- tagged only to a disabled category still shows up wherever the app lists
-- words outside of category browsing.

alter table public.categories
  add column is_active boolean not null default true;

comment on column public.categories.is_active is 'False hides the category from browsing (superadmin-only toggle, reversible). Words tagged only to a disabled category are not hidden themselves.';
