-- The public deck directory needs to show "by @username" for a public
-- deck's creator, which profiles' existing RLS (own row only, or
-- superadmin) doesn't allow. Add a narrow additional read policy: a
-- profile is readable if that user owns at least one public custom deck.

create policy profiles_select_public_deck_owner
  on public.profiles for select to authenticated
  using (
    exists (
      select 1 from public.custom_decks cd
      where cd.user_id = profiles.user_id
        and cd.is_public
    )
  );
