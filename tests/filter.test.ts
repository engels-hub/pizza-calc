import { describe, expect, it } from "vitest";
import snapshot from "@/data/snapshot/darbnica.json";
import { filterPizzas, type FilterInput } from "@/lib/filter";
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
