# ingest-scrutins

Cron weekly · `0 4 * * 1` (Monday 04:00 UTC).

Pulls new solennels from `data.assemblee-nationale.fr`, computes group positions via 70% threshold, generates LLM summaries, upserts to `scrutins`.

## Manual trigger

```
npx supabase functions invoke ingest-scrutins
```

## Manual relecture des résumés pédago

After each cron run, log into Supabase web UI, query:

```sql
select id, titre_brut, titre_pedago from scrutins
where pedago_relu = false order by ingere_le desc;
```

Spot-check ~5 minutes per week, flip `pedago_relu = true` once validated.

## Setup (one-time)

1. Deploy: `npx supabase functions deploy ingest-scrutins`
2. Set env vars in Supabase dashboard → Edge Functions → Secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
3. Schedule cron: Supabase web UI → Database → Functions → `ingest-scrutins` → Schedule, with expression `0 4 * * 1`.

## Known soft spots

The first invocation against real AN data will likely surface schema drift. To fix:

- **`GROUP_MAPPING`** in `parse-scrutins.ts` only has 2 of 11 entries (EPR, RN). Inspect the AN payload's `organeRef` codes for each parliamentary group of the 17e legislature and fill in: LFI, GDR, ECO, SOC, LIOT, DEM, HOR, DR, UDR.
- **`dossier_titre`** is set to `"TBD"`. Resolve via a parallel fetch of dossiers (or a lookup table) once the right endpoint is identified.
- **AN payload root** — `fetch-an.ts` defensively unwraps `json.scrutins?.scrutin ?? json`. Confirm against actual response and tighten.
- **`compute-positions.ts`** is a local copy of `src/lib/compute-positions.ts`. Keep in sync when the threshold logic changes.
