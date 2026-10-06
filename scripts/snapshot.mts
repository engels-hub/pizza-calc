import { writeFile } from "node:fs/promises";
import { scrapeLulu } from "../src/lib/scrapers/lulu";
import { scrapePicu } from "../src/lib/scrapers/picu";

const fetchedAt = new Date().toISOString();

for (const [id, scrape] of [
  ["picu", scrapePicu],
  ["lulu", scrapeLulu],
] as const) {
  const pizzas = await scrape();
  const file = new URL(`../src/data/snapshot/${id}.json`, import.meta.url);
  await writeFile(file, JSON.stringify({ fetchedAt, pizzas }, null, 2) + "\n");
  const unknown = new Set(pizzas.flatMap((p) => p.ingredients.filter((k) => /[^a-z-]/.test(k))));
  console.log(`${id}: ${pizzas.length} pizzas`);
  if (unknown.size) console.log(`  unmapped ingredients: ${[...unknown].join(", ")}`);
}
