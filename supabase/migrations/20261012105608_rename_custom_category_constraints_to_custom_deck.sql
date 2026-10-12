-- The 20261011162150_rename_custom_categories_to_custom_decks.sql migration renamed
-- custom_categories -> custom_decks and custom_category_words -> custom_deck_words,
-- but RENAME TABLE does not cascade to constraint names, so the PK/FK constraints
-- were left with their old custom_categories_/custom_category_words_ names. Fix that up.

ALTER TABLE "public"."custom_decks"
    RENAME CONSTRAINT "custom_categories_pkey" TO "custom_decks_pkey";

ALTER TABLE "public"."custom_decks"
    RENAME CONSTRAINT "custom_categories_user_id_fkey" TO "custom_decks_user_id_fkey";

ALTER TABLE "public"."custom_deck_words"
    RENAME CONSTRAINT "custom_category_words_pkey" TO "custom_deck_words_pkey";

ALTER TABLE "public"."custom_deck_words"
    RENAME CONSTRAINT "custom_category_words_custom_category_id_fkey" TO "custom_deck_words_custom_deck_id_fkey";

ALTER TABLE "public"."custom_deck_words"
    RENAME CONSTRAINT "custom_category_words_word_id_fkey" TO "custom_deck_words_word_id_fkey";
