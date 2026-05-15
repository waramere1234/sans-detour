-- supabase/migrations/0006_add_votes_personnalites.sql
--
-- Add a `votes_personnalites` jsonb column to scrutins, populated by
-- scripts/ingest-personnalites.ts from the AN local cache.
--
-- Shape: { "le_pen": "pour", "bardella": "contre", "faure": "abstention",
--          "tondelier": "absent", "wauquiez": "non_dispo", ... }
--
-- Values:
--   - "pour" / "contre" / "abstention"          → actual votes
--   - "absent"                                  → on the AN roster that day,
--                                                 didn't vote (non-votant)
--   - "non_dispo"                               → personality not a député at
--                                                 the scrutin's date (Bardella
--                                                 after July 2024, etc.)
--
-- The Scrutin type makes this field optional so pre-migration rows still
-- flow through the front; the personnalités UI just won't have data for them.

alter table scrutins
  add column if not exists votes_personnalites jsonb;
