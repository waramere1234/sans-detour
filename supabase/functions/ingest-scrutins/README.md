# ingest-scrutins

> ⚠ **Status:** this Deno edge function is **NOT operational** in its current form. The original plan assumed AN exposes a single bulk JSON file with all scrutins; in reality the AN ships a 20 MB zip of ~6500 per-scrutin JSON files, which a Deno edge function can't unzip without extra plumbing.
>
> **Use [`scripts/ingest-an.ts`](../../../scripts/ingest-an.ts) instead** — a Node-side bootstrap script you run manually:
>
> ```
> SUPABASE_URL=https://...supabase.co \
> SUPABASE_SERVICE_ROLE_KEY=eyJ... \
> ANTHROPIC_API_KEY=sk-ant-... \
> npm run ingest:an
> ```
>
> Re-run weekly (or whenever you want a refresh). Caches the zip in `/tmp/sd-an-cache` between runs.
>
> The constants in this folder (especially `GROUP_MAPPING` in `parse-scrutins.ts`) are kept synced with the bootstrap script so that when this edge function is rewritten to handle the per-file zip flow (or when the AN exposes a real bulk endpoint), no fresh research is needed.

## Original cron design (deferred)

When operational, the function would run weekly · `0 4 * * 1` (Monday 04:00 UTC), pulling new SPS scrutins from `data.assemblee-nationale.fr`, computing group positions via the 70% threshold, generating LLM summaries, and upserting to `scrutins`.

### Manual relecture des résumés pédago

Whether ingestion runs via the script or (eventually) via cron, spot-check the LLM summaries weekly:

```sql
select id, titre_brut, titre_pedago from scrutins
where pedago_relu = false order by ingere_le desc;
```

Flip `pedago_relu = true` once validated.

## Verified facts (from data.assemblee-nationale.fr inspection)

- **Bulk endpoint:** `https://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip` (~20 MB, ~6500 files)
- **Solennel filter:** `scrutin.typeVote.codeTypeVote === "SPS"` (yields 46 entries as of 2026-05)
- **Group mapping:** see `parse-scrutins.ts` — 12 organeRef codes mapped to 11 internal codes (UDR appears under two refs, PO847173 pre-2025-09 and PO872880 after)
- **Dossier titre:** available directly at `scrutin.objet.dossierLegislatif.libelle` (no second endpoint needed); falls back to `objet.libelle` when the scrutin has no attached dossier
- **AN URL pattern:** `https://www.assemblee-nationale.fr/dyn/17/scrutins/{numero}`
