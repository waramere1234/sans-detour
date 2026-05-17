// scripts/debug-batch.ts
//
// Re-fetch the results of an already-processed batch and dump the FIRST error
// in full, so we can see the actual Anthropic error shape (which differs
// across SDK versions). Free — re-fetching results doesn't re-run the batch.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... npm run debug:batch msgbatch_XXX
// or
//   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/debug-batch.ts msgbatch_XXX

import { requireAnthropicEnv } from "./lib/env";

const batchId = process.argv[2];
if (!batchId || !batchId.startsWith("msgbatch_")) {
  console.error("Usage: npm run debug:batch <msgbatch_XXX>");
  console.error("Example: npm run debug:batch msgbatch_016AL9tcWj3SZE5mR6f516bM");
  process.exit(1);
}
const ANTHROPIC_KEY = requireAnthropicEnv();

async function main() {
  // First, status of the batch
  console.log(`→ Fetching status of ${batchId}…\n`);
  const statusR = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}`, {
    headers: {
      "x-api-key": ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
    },
  });
  if (!statusR.ok) {
    console.error(`Status fetch failed: ${statusR.status} ${await statusR.text()}`);
    process.exit(1);
  }
  console.log(JSON.stringify(await statusR.json(), null, 2));

  // Then fetch the JSONL results
  console.log(`\n→ Fetching results…\n`);
  const resultsR = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}/results`, {
    headers: {
      "x-api-key": ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
    },
  });
  if (!resultsR.ok) {
    console.error(`Results fetch failed: ${resultsR.status} ${await resultsR.text()}`);
    process.exit(1);
  }
  const text = await resultsR.text();
  const lines = text.split("\n").filter((l) => l.trim());
  console.log(`Got ${lines.length} result lines.\n`);

  // Bucket by type
  let succeeded = 0;
  let errored = 0;
  let canceled = 0;
  let expired = 0;
  let firstError: string | null = null;

  for (const line of lines) {
    const r = JSON.parse(line);
    const t = r.result?.type;
    if (t === "succeeded") succeeded++;
    else if (t === "errored") {
      errored++;
      if (!firstError) firstError = line;
    } else if (t === "canceled") canceled++;
    else if (t === "expired") expired++;
  }

  console.log(`Buckets: succeeded=${succeeded}, errored=${errored}, canceled=${canceled}, expired=${expired}\n`);

  if (firstError) {
    console.log("— First errored result (full JSON) —");
    console.log(JSON.stringify(JSON.parse(firstError), null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
