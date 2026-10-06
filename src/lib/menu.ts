import { cacheLife } from "next/cache";
import picuSnapshot from "@/data/snapshot/picu.json";
import luluSnapshot from "@/data/snapshot/lulu.json";
import { scrapeLulu } from "./scrapers/lulu";
import { scrapePicu } from "./scrapers/picu";
import type { MenuData, Pizza, PizzeriaId } from "./types";

interface Snapshot {
  fetchedAt: string;
  pizzas: Pizza[];
}

// Below this a scrape is treated as broken markup, not a real menu change.
const MIN_ITEMS: Record<PizzeriaId, number> = { picu: 15, lulu: 25 };

const SOURCES: Record<PizzeriaId, { scrape: () => Promise<Pizza[]>; snapshot: Snapshot }> = {
  picu: { scrape: scrapePicu, snapshot: picuSnapshot as Snapshot },
  lulu: { scrape: scrapeLulu, snapshot: luluSnapshot as Snapshot },
};

function valid(p: Pizza): boolean {
  return Boolean(p.name) && p.variants.length > 0 && p.variants.every((v) => v.price > 0 && v.price < 200);
}

async function load(id: PizzeriaId) {
  const { scrape, snapshot } = SOURCES[id];
  try {
    const pizzas = (await scrape()).filter(valid);
    if (pizzas.length < MIN_ITEMS[id]) throw new Error(`${id}: only ${pizzas.length} pizzas`);
    return { pizzas, live: true, fetchedAt: new Date().toISOString() };
  } catch (err) {
    console.warn(`[menu] ${id} scrape failed, using snapshot:`, err instanceof Error ? err.message : err);
    return { pizzas: snapshot.pizzas, live: false, fetchedAt: snapshot.fetchedAt };
  }
}

export async function getMenus(): Promise<MenuData> {
  "use cache";
  cacheLife({ stale: 60 * 60, revalidate: 6 * 60 * 60, expire: 24 * 60 * 60 });

  const [picu, lulu] = await Promise.all([load("picu"), load("lulu")]);
  return {
    pizzas: [...picu.pizzas, ...lulu.pizzas],
    fetchedAt: [picu.fetchedAt, lulu.fetchedAt].sort()[0],
    stale: !picu.live || !lulu.live,
    sources: {
      picu: { live: picu.live, fetchedAt: picu.fetchedAt, count: picu.pizzas.length },
      lulu: { live: lulu.live, fetchedAt: lulu.fetchedAt, count: lulu.pizzas.length },
    },
  };
}
