-- supabase/migrations/0006_add_votes_personnalites.sql
--
-- Add a `votes_personnalites` jsonb column to scrutins, populated by
-- scripts/ingest-personnalites.ts from the AN local cache.
--
-- Shape (8 keys per src/types/index.ts PERSONNALITE_CODES):
--   { "le_pen": "pour", "faure": "abstention", "chatelain": "absent",
--     "wauquiez": "contre", "attal": "pour", "ciotti": "non_dispo",
--     "bompard": "contre", "panot": "contre" }
--
-- Values:
--   - "pour" / "contre" / "abstention"   → actual votes
--   - "absent"                           → on the AN roster that day,
--                                          didn't vote (non-votant)
--   - "non_dispo"                        → not a député at the scrutin
--                                          date (e.g. Ciotti before quitting
--                                          DR for UDR, or any personality on
--                                          a scrutin predating their mandate)
--
-- The Scrutin type makes this field optional so pre-migration rows still
-- flow through the front; the personnalités UI just won't have data for
-- them. Note: bardella / tondelier / mélenchon / philippe / glucksmann /
-- darmanin are NOT in PERSONNALITE_CODES (see src/types/index.ts JSDoc
-- for the structural exclusions) so this column never carries their keys.

alter table scrutins
  add column if not exists votes_personnalites jsonb;
