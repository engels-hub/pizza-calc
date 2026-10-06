import { writeFile } from "node:fs/promises";
import { scrapeDarbnica } from "../src/lib/scrapers/darbnica";
import { scrapeLulu } from "../src/lib/scrapers/lulu";

const fetchedAt = new Date().toISOString();

for (const [file, scrape] of [
  ["darbnica", scrapeDarbnica],
  ["lulu", scrapeLulu],
] as const) {
  const pizzas = await scrape();
  const out = new URL(`../src/data/snapshot/${file}.json`, import.meta.url);
  await writeFile(out, JSON.stringify({ fetchedAt, pizzas }, null, 2) + "\n");
  const unknown = new Set(pizzas.flatMap((p) => p.ingredients.filter((k) => /[^a-z-]/.test(k))));
  console.log(`${file}: ${pizzas.length} pizzas`);
  if (unknown.size) console.log(`  unmapped ingredients: ${[...unknown].join(", ")}`);
}
