-- supabase/migrations/0001_create_scrutins.sql

create table if not exists scrutins (
  id            text primary key,
  numero        int  not null,
  date          date not null,
  dossier_id    text not null,
  dossier_titre text not null,
  chapeau       text,
  titre_brut    text not null,
  titre_pedago  text,
  position_par_groupe jsonb not null,
  votes_bruts   jsonb not null,
  url_an_officielle text not null,
  est_solennel  bool not null default false,
  pedago_relu   bool not null default false,
  ingere_le     timestamptz not null default now()
);

create index if not exists scrutins_solennels_idx
  on scrutins(est_solennel) where est_solennel = true;
create index if not exists scrutins_dossier_idx
  on scrutins(dossier_id);
create index if not exists scrutins_date_idx
  on scrutins(date desc);

-- Public read-only access (no auth needed)
alter table scrutins enable row level security;
create policy "anon read scrutins" on scrutins
  for select using (true);
