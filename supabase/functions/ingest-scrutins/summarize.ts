// supabase/functions/ingest-scrutins/summarize.ts
//
// Calls the Anthropic Messages API to turn an AN raw scrutin title into a
// short editorial chapeau plus a pédagogique reformulation. Output is a
// JSON object with `chapeau` and `titre_pedago`.

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const PROMPT_TEMPLATE = `Tu reçois le titre brut d'un scrutin solennel à l'Assemblée Nationale française.
Génère deux choses :
1. CHAPEAU : un chapeau contextuel ultra-court de la forme "[THÈME] · [DOSSIER]" (max 4 mots, en majuscules, sans ponctuation finale). Ex : "RETRAITES · PLFSS 2024".
2. TITRE_PEDAGO : reformulation factuelle du sujet de fond du vote en une phrase de 12 mots maximum. Pas de prise de parti. Pas de qualificatif (éviter "controversé", "important", "scandaleux"). Vocabulaire accessible à un lycéen.

Réponds en JSON strict : {"chapeau": "...", "titre_pedago": "..."}.

Titre brut :
"""
{TITRE_BRUT}
"""`;

export interface Summary {
  chapeau: string;
  titre_pedago: string;
}

export async function summarize(titreBrut: string): Promise<Summary> {
  const prompt = PROMPT_TEMPLATE.replace("{TITRE_BRUT}", titreBrut);
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const json = await r.json();
  const text = json.content?.[0]?.text ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON in LLM response");
  return JSON.parse(m[0]) as Summary;
}
