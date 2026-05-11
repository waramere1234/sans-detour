-- supabase/migrations/0004_add_points_cles.sql
--
-- Add a `points_cles` jsonb column to scrutins, populated by the ingest LLM
-- with exactly 3 short factual bullets (≤ 7 words each) rendered on the
-- front of the card right below the titre_pedago. Goal: let a voter
-- commit/skip without flipping to the analyse view first.
--
-- Existing rows have NULL until the next `npm run ingest:an` run.

alter table scrutins
  add column if not exists points_cles jsonb;
