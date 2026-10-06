export type PizzeriaId = "picu" | "lulu";

export type Shape = "round" | "heart" | "calzone";

export interface Variant {
  id: string;
  label: string;
  diameterCm: number;
  shape: Shape;
  price: number;
}

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

export type PizzaTag = "vegetarian" | "vegan" | "spicy" | "new" | "top";

export interface Pizzeria {
  id: PizzeriaId;
  name: string;
  url: string;
}

export interface MenuData {
  pizzas: Pizza[];
  fetchedAt: string;
  /** True when at least one pizzeria came from the bundled snapshot. */
  stale: boolean;
  sources: Record<PizzeriaId, { live: boolean; fetchedAt: string; count: number }>;
}

export const PIZZERIAS: Record<PizzeriaId, Pizzeria> = {
  picu: { id: "picu", name: "Picu darbnīca", url: "https://www.picudarbnica.lv/picas/" },
  lulu: { id: "lulu", name: "LuLū", url: "https://www.lulu.lv/picas" },
};
