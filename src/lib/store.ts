"use client";

import { createContext, useContext } from "react";
import { useStore as useZustand } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import { DEFAULT_RULES, type CalcRules } from "./calc";
import type { CartLine, CustomDiscount } from "./discounts";
import type { Pizza, PizzeriaId, Variant } from "./types";

export type FilterState = "include" | "exclude";
export type PizzeriaFilter = PizzeriaId | "all";

export interface State {
  /** Today in Riga (YYYY-MM-DD), decided by the server for the request. */
  today: string;
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

/** Fields saved to the prefs cookie and restored by the server. */
export type Persisted = Pick<State, "people" | "rules" | "size" | "cart" | "activePromos" | "custom">;

export type InitialState = Persisted & Pick<State, "today" | "pizzeria">;

export type AppStore = StoreApi<State>;

/**
 * One store per request on the server and one per page load in the browser,
 * created by StoreProvider from the cookie the server read. Never a module
 * singleton, which on the server would leak state between visitors.
 */
export function createAppStore(initial: InitialState): AppStore {
  return createStore<State>()((set) => ({
    ...initial,
    query: "",
    ingredientFilters: {},
    tagFilters: {},
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
  }));
}

export const StoreContext = createContext<AppStore | null>(null);

/** Select from the page's store. Same call shape as a zustand hook. */
export function useStore<T>(selector: (state: State) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return useZustand(store, selector);
}
