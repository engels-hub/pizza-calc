import { describe, expect, it } from "vitest";
import snapshot from "@/data/snapshot/darbnica.json";
import luluSnapshot from "@/data/snapshot/lulu.json";
import { filterPizzas, soldInSize, type FilterInput } from "@/lib/filter";
import type { Pizza } from "@/lib/types";

const pizzas = snapshot.pizzas as Pizza[];
const base: FilterInput = { pizzeria: "all", query: "", ingredientFilters: {}, tagFilters: {} };

describe("tag filters", () => {
  it("include keeps only tagged pizzas, exclude drops them", () => {
    const veg = filterPizzas(pizzas, { ...base, tagFilters: { vegetarian: "include" } });
    const notVeg = filterPizzas(pizzas, { ...base, tagFilters: { vegetarian: "exclude" } });
    expect(veg.length).toBeGreaterThan(0);
    expect(veg.every((p) => p.tags.includes("vegetarian"))).toBe(true);
    expect(notVeg.some((p) => p.tags.includes("vegetarian"))).toBe(false);
    expect(veg.length + notVeg.length).toBe(pizzas.length);
  });

  it("combines with ingredient filters", () => {
    const list = filterPizzas(pizzas, { ...base, tagFilters: { spicy: "exclude" }, ingredientFilters: { salami: "include" } });
    expect(list.every((p) => p.ingredients.includes("salami") && !p.tags.includes("spicy"))).toBe(true);
    expect(list.map((p) => p.name)).not.toContain("Peperoni (asa)");
  });
});

describe("size filter", () => {
  const all = [...pizzas, ...(luluSnapshot.pizzas as Pizza[])];

  it("45 cm lists only LuLū pizzas that come in 45 cm", () => {
    const list = filterPizzas(all, { ...base, size: 45 });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.pizzeriaId === "lulu")).toBe(true);
    expect(list.every((p) => p.variants.some((v) => v.diameterCm === 45))).toBe(true);
  });

  it("20 cm lists only Picu darbnīca, 30 cm lists both", () => {
    expect(new Set(filterPizzas(all, { ...base, size: 20 }).map((p) => p.pizzeriaId))).toEqual(new Set(["darbnīca"]));
    expect(new Set(filterPizzas(all, { ...base, size: 30 }).map((p) => p.pizzeriaId))).toEqual(new Set(["darbnīca", "lulu"]));
  });

  it("heart shapes do not count as 30 cm, calzones do", () => {
    const thirty = filterPizzas(all, { ...base, size: 30 }).map((p) => p.id);
    expect(thirty).toContain("lulu-calzone-vistas");
    expect(soldInSize({ ...all[0], variants: [{ id: "heart", diameterCm: 30, shape: "heart", price: 1 }] }, 30)).toBe(false);
  });
});
