import { pizzaArea } from "./calc";
import { ingredientDef, ingredientLabel, type IngredientGroup } from "./ingredients";
import type { FilterState, PizzeriaFilter } from "./store";
import type { Pizza, PizzaTag, Variant } from "./types";

export interface FilterInput {
  pizzeria: PizzeriaFilter;
  /** Chosen diameter; only pizzas sold in this size are listed. */
  size?: number;
  query: string;
  ingredientFilters: Record<string, FilterState>;
  tagFilters: Record<string, FilterState>;
}

function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Sold in this diameter? Heart shapes do not count; a calzone counts as its diameter (30 cm). */
export function soldInSize(p: Pizza, diameter: number): boolean {
  return p.variants.some((v) => v.shape !== "heart" && v.diameterCm === diameter);
}

/** Keys split into [included, excluded]. */
function split(filters: Record<string, FilterState>): [string[], string[]] {
  const keys = Object.keys(filters);
  return [keys.filter((k) => filters[k] === "include"), keys.filter((k) => filters[k] === "exclude")];
}

export function filterPizzas(pizzas: Pizza[], f: FilterInput): Pizza[] {
  const q = fold(f.query.trim());
  const [include, exclude] = split(f.ingredientFilters);
  const [withTags, withoutTags] = split(f.tagFilters);
  const tagged = (p: Pizza, t: string) => p.tags.includes(t as PizzaTag);

  return pizzas.filter((p) => {
    if (f.pizzeria !== "all" && p.pizzeriaId !== f.pizzeria) return false;
    if (f.size !== undefined && !soldInSize(p, f.size)) return false;
    if (withTags.some((t) => !tagged(p, t))) return false;
    if (withoutTags.some((t) => tagged(p, t))) return false;
    if (include.some((k) => !p.ingredients.includes(k))) return false;
    if (exclude.some((k) => p.ingredients.includes(k))) return false;
    if (q && !fold(`${p.name} ${p.rawIngredients.join(" ")}`).includes(q)) return false;
    return true;
  });
}

export interface IngredientOption {
  key: string;
  label: string;
  count: number;
}

/** Filterable ingredients (no dough/base sauce/base cheese), grouped, most common first. */
export function ingredientOptions(pizzas: Pizza[]): { group: IngredientGroup; items: IngredientOption[] }[] {
  const counts = new Map<string, number>();
  for (const p of pizzas) for (const k of p.ingredients) counts.set(k, (counts.get(k) ?? 0) + 1);

  const groups = new Map<IngredientGroup, IngredientOption[]>();
  for (const [key, count] of counts) {
    const def = ingredientDef(key);
    if (def.group === "base") continue;
    groups.set(def.group, [...(groups.get(def.group) ?? []), { key, label: ingredientLabel(key), count }]);
  }
  const order: IngredientGroup[] = ["meat", "seafood", "veg", "cheese", "sauce", "herb", "other"];
  return order
    .filter((g) => groups.has(g))
    .map((group) => ({ group, items: groups.get(group)!.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "lv")) }));
}

export type MenuSort = "menu" | "price" | "value";

/** Menu order, cheapest first, or cheapest per cm², priced at the chosen size. */
export function sortPizzas(list: Pizza[], sort: MenuSort, diameter: number): Pizza[] {
  if (sort === "menu") return list;
  const key = (p: Pizza) => {
    const v = preferredVariant(p, diameter);
    return sort === "price" ? v.price : v.price / pizzaArea(v.diameterCm);
  };
  return [...list].sort((a, b) => key(a) - key(b));
}

/** Round variant closest to the chosen diameter (exact match wins). */
export function preferredVariant(p: Pizza, diameter: number): Variant {
  const round = p.variants.filter((v) => v.shape !== "heart");
  const pool = round.length ? round : p.variants;
  return pool.reduce((best, v) => (Math.abs(v.diameterCm - diameter) < Math.abs(best.diameterCm - diameter) ? v : best));
}

/** Readable ingredient line without the base dough/sauce/cheese everybody has. */
export function toppingLine(p: Pizza): string {
  return p.rawIngredients
    .filter((r) => !/^(picas mīkla|picas siers|picas? mērce|lulū picas mērce|siers)$/i.test(r.trim()))
    .join(", ");
}

export interface SizeOption {
  diameter: number;
  pizzerias: Pizza["pizzeriaId"][];
  /** Cheapest € per 100 cm² among pizzas offering this size. */
  bestPer100: number;
}

export function sizeOptions(pizzas: Pizza[]): SizeOption[] {
  const map = new Map<number, SizeOption>();
  for (const p of pizzas) {
    for (const v of p.variants) {
      if (v.shape !== "round") continue;
      const per100 = (v.price / (Math.PI * (v.diameterCm / 2) ** 2)) * 100;
      const o = map.get(v.diameterCm) ?? { diameter: v.diameterCm, pizzerias: [], bestPer100: Infinity };
      if (!o.pizzerias.includes(p.pizzeriaId)) o.pizzerias.push(p.pizzeriaId);
      o.bestPer100 = Math.min(o.bestPer100, per100);
      map.set(v.diameterCm, o);
    }
  }
  return [...map.values()].sort((a, b) => a.diameter - b.diameter);
}
