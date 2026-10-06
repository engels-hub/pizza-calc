import { describe, expect, it } from "vitest";
import snapshot from "@/data/snapshot/darbnica.json";
import { rng } from "@/components/pizza3d/ingredientMeshes";
import { luckyPicks } from "@/lib/lucky";
import type { Pizza } from "@/lib/types";

const pd = snapshot.pizzas as Pizza[];

describe("luckyPicks", () => {
  it("picks the requested number, all different while possible", () => {
    const picks = luckyPicks(pd, 6, 30, rng("a"));
    expect(picks).toHaveLength(6);
    expect(new Set(picks.map((p) => p.pizza.id)).size).toBe(6);
    expect(picks.every((p) => p.variant.diameterCm === 30)).toBe(true);
  });

  it("repeats only after using every candidate once", () => {
    const three = pd.slice(0, 3);
    const picks = luckyPicks(three, 5, 20, rng("b"));
    expect(new Set(picks.slice(0, 3).map((p) => p.pizza.id)).size).toBe(3);
    expect(picks.every((p) => p.variant.diameterCm === 20)).toBe(true);
  });

  it("falls back to 30 cm for sizes the pizzeria does not make", () => {
    expect(luckyPicks(pd, 2, 45, rng("c")).every((p) => p.variant.diameterCm === 30)).toBe(true);
  });

  it("is random, but reproducible with the same seed", () => {
    const ids = (seed: string) => luckyPicks(pd, 4, 30, rng(seed)).map((p) => p.pizza.id);
    expect(ids("x")).toEqual(ids("x"));
    expect(ids("x")).not.toEqual(ids("y"));
  });

  it("returns nothing with no candidates", () => {
    expect(luckyPicks([], 3, 30)).toEqual([]);
  });
});
