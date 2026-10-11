-- Moves is_primary from sign_videos to signs. is_primary now marks which
-- *variant* of a word is the accepted/educational one (at most one per
-- word, enforced below), not which video file happens to be pinned -- a
-- variant can hold several video takes, and quizzing picks a random one
-- each time so learners can't rely on recognizing a specific take/person
-- rather than the sign itself. See get_random_word_for_category, rewritten
-- in the next migration to match.

-- 1. Add the column, defaulting every existing sign to not-primary ---------

alter table public.signs
  add column is_primary boolean not null default false;

-- 2. Backfill: pick exactly one primary sign per word ----------------------
-- Prefer whichever sign currently has an is_primary sign_video (preserves
-- today's "which video shows" behaviour); if a word has none (no eligible
-- video yet), fall back to its lowest-id sign so every word still has a
-- primary variant once a video is eventually added under it. Ties broken by
-- id for determinism.

with ranked as (
  select
    s.id,
    s.word_id,
    row_number() over (
      partition by s.word_id
      order by
        (exists (
          select 1 from public.sign_videos sv
          where sv.sign_id = s.id and sv.is_primary
        )) desc,
        s.id
    ) as rn
  from public.signs s
)
update public.signs
set is_primary = true
from ranked
where signs.id = ranked.id
  and ranked.rn = 1;

-- 3. Enforce at most one primary variant per word ---------------------------

create unique index signs_one_primary_per_word
  on public.signs (word_id)
  where is_primary;

comment on column public.signs.is_primary is 'Whether this is the accepted/educational variant shown during quizzing for its word. At most one true per word_id (see signs_one_primary_per_word). Set via public.set_primary_sign() to flip atomically.';

-- 4. Drop the old per-sign-video flag ---------------------------------------

drop index public.sign_videos_one_primary_per_sign;

alter table public.sign_videos
  drop column is_primary;

comment on table public.sign_videos is 'Video files (in the sign-videos storage bucket) demonstrating a sign variant. A sign may have several videos/takes; which one is shown during quizzing is picked at random from its variant''s pool, not pinned per-video (see public.signs.is_primary).';
