import "server-only";
import { cacheLife } from "next/cache";
import darbnicaSnapshot from "@/data/snapshot/darbnica.json";
import luluSnapshot from "@/data/snapshot/lulu.json";
import { scrapeDarbnica } from "./scrapers/darbnica";
import { scrapeLulu } from "./scrapers/lulu";
import type { MenuData, Pizza, PizzeriaId } from "./types";

interface Snapshot {
  fetchedAt: string;
  pizzas: Pizza[];
}

interface Source {
  scrape: () => Promise<Pizza[]>;
  snapshot: Snapshot;
  /** Fewer than this is treated as broken markup, not a real menu change. */
  minItems: number;
}

const SOURCES: Record<PizzeriaId, Source> = {
  "darbnīca": { scrape: scrapeDarbnica, snapshot: darbnicaSnapshot as Snapshot, minItems: 15 },
  lulu: { scrape: scrapeLulu, snapshot: luluSnapshot as Snapshot, minItems: 25 },
};

function isValid(p: Pizza): boolean {
  return Boolean(p.name) && p.variants.length > 0 && p.variants.every((v) => v.price > 0 && v.price < 200);
}

async function load(id: PizzeriaId) {
  const { scrape, snapshot, minItems } = SOURCES[id];
  try {
    const pizzas = (await scrape()).filter(isValid);
    if (pizzas.length < minItems) throw new Error(`${id}: only ${pizzas.length} pizzas`);
    return { pizzas, live: true, fetchedAt: new Date().toISOString() };
  } catch (err) {
    console.warn(`[menu] ${id} scrape failed, using snapshot:`, err instanceof Error ? err.message : err);
    return { pizzas: snapshot.pizzas, live: false, fetchedAt: snapshot.fetchedAt };
  }
}

/** Both menus, scraped live and cached for 6 hours, falling back to the snapshot. */
export async function getMenus(): Promise<MenuData> {
  "use cache";
  cacheLife({ stale: 60 * 60, revalidate: 6 * 60 * 60, expire: 24 * 60 * 60 });

  const [darbnica, lulu] = await Promise.all([load("darbnīca"), load("lulu")]);
  return {
    pizzas: [...darbnica.pizzas, ...lulu.pizzas],
    fetchedAt: [darbnica.fetchedAt, lulu.fetchedAt].sort()[0],
    stale: !darbnica.live || !lulu.live,
    sources: {
      "darbnīca": { live: darbnica.live, fetchedAt: darbnica.fetchedAt, count: darbnica.pizzas.length },
      lulu: { live: lulu.live, fetchedAt: lulu.fetchedAt, count: lulu.pizzas.length },
    },
  };
}
