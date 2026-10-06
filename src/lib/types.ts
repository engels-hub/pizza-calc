export type PizzeriaId = "darbnīca" | "lulu";

export const PIZZERIA_IDS: readonly PizzeriaId[] = ["darbnīca", "lulu"];

export type Shape = "round" | "heart" | "calzone";

export interface Variant {
  id: string;
  diameterCm: number;
  shape: Shape;
  price: number;
}

export type PizzaTag = "vegetarian" | "vegan" | "spicy" | "new" | "top";

export interface Pizza {
  id: string;
  pizzeriaId: PizzeriaId;
  name: string;
  url: string;
  imageUrl?: string;
  /** Raw ingredient strings as printed by the pizzeria. */
  rawIngredients: string[];
  /** Canonical ingredient keys, see ingredients.ts. */
  ingredients: string[];
  tags: PizzaTag[];
  variants: Variant[];
}

export interface MenuData {
  pizzas: Pizza[];
  fetchedAt: string;
  /** True when at least one pizzeria came from the bundled snapshot. */
  stale: boolean;
  sources: Record<PizzeriaId, { live: boolean; fetchedAt: string; count: number }>;
}

export const PIZZERIA_URLS: Record<PizzeriaId, string> = {
  "darbnīca": "https://www.picudarbnica.lv/picas/",
  lulu: "https://www.lulu.lv/picas",
};
