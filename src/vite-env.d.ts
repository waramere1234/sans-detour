/// <reference types="vite/client" />

// Typed augmentation of `import.meta.env` so a typo on a VITE_* key
// (`VITE_SUPABBASE_URL`, etc.) errors at compile time instead of resolving
// to `undefined` and silently falling back to dev fixtures in
// `src/lib/supabase.ts`. Only the keys the client bundle actually reads
// belong here — server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`,
// `ANTHROPIC_API_KEY`) must not be referenced via `import.meta.env`
// (they'd be inlined into the public bundle), so they stay absent.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
