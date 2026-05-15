-- supabase/migrations/0005_add_theme.sql
--
-- Add a `theme` text column to scrutins, populated by the ingest LLM with one
-- of the V2 themes used by the deck composer to enforce thematic diversity.
--
-- Allowed values (kept as plain text rather than an enum for flexibility):
--   pouvoir-achat, retraites, immigration, sécurité, écologie, santé,
--   école, fiscalité, institutions, international, autre
--
-- Existing rows have NULL until the next `npm run ingest:an` run; the deck
-- composer falls back to "autre" for missing values.

alter table scrutins
  add column if not exists theme text;

create index if not exists scrutins_theme_idx on scrutins (theme);
