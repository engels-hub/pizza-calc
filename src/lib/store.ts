"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_RULES, type CalcRules } from "./calc";
import type { CartLine, CustomDiscount } from "./discounts";
import type { Pizza, PizzeriaId, Variant } from "./types";

export type FilterState = "include" | "exclude";
export type PizzeriaFilter = PizzeriaId | "all";

interface State {
  people: number;
  rules: CalcRules;
  /** Diameter the recommendation is shown in. */
  size: number;
  cart: CartLine[];
  pizzeria: PizzeriaFilter;
  query: string;
  ingredientFilters: Record<string, FilterState>;
  tagFilters: Record<string, FilterState>;
  activePromos: string[];
  custom: CustomDiscount;
  /** Cart line under the pointer, shared by the 3D stack and the list. */
  hovered: string | null;

  setPeople: (n: number) => void;
  setRules: (r: Partial<CalcRules>) => void;
  resetRules: () => void;
  setSize: (d: number) => void;
  addPizza: (pizza: Pizza, variant: Variant) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;
  setPizzeria: (p: PizzeriaFilter) => void;
  setQuery: (q: string) => void;
  cycleIngredient: (key: string) => void;
  cycleTag: (tag: string) => void;
  clearFilters: () => void;
  setActivePromos: (ids: string[]) => void;
  setCustom: (c: CustomDiscount) => void;
  setHovered: (key: string | null) => void;
}

/** off → include → exclude → off */
function cycle(filters: Record<string, FilterState>, key: string): Record<string, FilterState> {
  const next = { ...filters };
  if (!next[key]) next[key] = "include";
  else if (next[key] === "include") next[key] = "exclude";
  else delete next[key];
  return next;
}

type Persisted = Pick<State, "people" | "rules" | "size" | "cart" | "activePromos" | "custom">;

/** v1 used "picu" as the Picu darbnīca id and stored a display label per cart line. */
function migrateV1(state: unknown, version: number): Persisted {
  const s = state as Persisted;
  if (version >= 2) return s;
  const id = (x: string) => x.replace(/^picu-/, "darbnica-");
  type V1Line = Omit<CartLine, "pizzeriaId" | "shape"> & { pizzeriaId: string; variantLabel?: string };
  return {
    ...s,
    cart: (s.cart as unknown as V1Line[]).map(({ variantLabel, ...l }) => ({
      ...l,
      key: id(l.key),
      pizzaId: id(l.pizzaId),
      pizzeriaId: l.pizzeriaId === "picu" ? "darbnīca" : (l.pizzeriaId as CartLine["pizzeriaId"]),
      shape: /sirds/i.test(variantLabel ?? "") ? "heart" : /viens/i.test(variantLabel ?? "") ? "calzone" : "round",
    })),
    activePromos: s.activePromos.map((p) => (p === "picu-birthday" ? "darbnica-birthday" : p)),
  };
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      people: 5,
      rules: DEFAULT_RULES,
      size: 30,
      cart: [],
      pizzeria: "all",
      query: "",
      ingredientFilters: {},
      tagFilters: {},
      activePromos: [],
      custom: null,
      hovered: null,

      setPeople: (n) => set({ people: Math.min(60, Math.max(1, Math.round(n))) }),
      setRules: (r) => set((s) => ({ rules: { ...s.rules, ...r } })),
      resetRules: () => set({ rules: DEFAULT_RULES }),
      setSize: (size) => set({ size }),
      addPizza: (pizza, variant) =>
        set((s) => {
          const key = `${pizza.id}:${variant.id}`;
          const existing = s.cart.find((l) => l.key === key);
          const line: CartLine = {
            key,
            pizzaId: pizza.id,
            pizzeriaId: pizza.pizzeriaId,
            name: pizza.name,
            diameterCm: variant.diameterCm,
            shape: variant.shape,
            unitPrice: variant.price,
            qty: 1,
          };
          return {
            cart: existing ? s.cart.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l)) : [...s.cart, line],
          };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)),
        })),
      clearCart: () => set({ cart: [] }),
      setPizzeria: (pizzeria) => set({ pizzeria }),
      setQuery: (query) => set({ query }),
      cycleIngredient: (key) => set((s) => ({ ingredientFilters: cycle(s.ingredientFilters, key) })),
      cycleTag: (tag) => set((s) => ({ tagFilters: cycle(s.tagFilters, tag) })),
      clearFilters: () => set({ ingredientFilters: {}, tagFilters: {}, query: "" }),
      setActivePromos: (activePromos) => set({ activePromos }),
      setCustom: (custom) => set({ custom }),
      setHovered: (hovered) => set({ hovered }),
    }),
    {
      name: "picu-kalkulators",
      version: 2,
      migrate: migrateV1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s): Persisted => ({
        people: s.people,
        rules: s.rules,
        size: s.size,
        cart: s.cart,
        activePromos: s.activePromos,
        custom: s.custom,
      }),
    },
  ),
);
