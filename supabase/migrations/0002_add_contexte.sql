-- supabase/migrations/0002_add_contexte.sql
--
-- Add a short context paragraph shown on the verso of cards. Generated
-- by the LLM during ingestion (cf. scripts/ingest-an.ts SYSTEM_PROMPT).
-- Spec as of session 52 (the migration originally documented a tighter
-- "one sentence ≤ 25 words" version that was widened pre-V1) :
--   - 30 à 50 mots maximum, 2 phrases courtes
--   - phrase 1 : ce que la loi fait (mécanisme + qui est touché + chiffre)
--   - phrase 2 : « Concrètement : … » ou « Par exemple : … » (cas tangible)
--   - au moins un chiffre exact ET un nom propre / groupe identifié
--   - **bold** markdown autorisé sur 2-3 fragments-clés (renderWithBold)
-- AuditTrail extrait la 2e phrase comme bullet concrète sous chaque
-- scrutin (cf. extractConcrete in src/components/AuditTrail.tsx).

alter table scrutins
  add column if not exists contexte text;
