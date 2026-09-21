-- Distinguishes topic categories (Animals, Greetings, Colours, Time, ...)
-- from educational vocabulary-requirement categories (e.g. GCSE required
-- vocabulary). Defaults to false so every existing/future topic category
-- stays a normal deck unless explicitly marked as a vocabulary list.
ALTER TABLE "public"."categories"
  ADD COLUMN "is_vocabulary" boolean NOT NULL DEFAULT false;
