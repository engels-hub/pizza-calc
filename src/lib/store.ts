"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_RULES, type CalcRules } from "./calc";
import type { CartLine, CustomDiscount } from "./discounts";
import type { PizzeriaId } from "./types";

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
  tagFilters: string[];
  activePromos: string[];
  custom: CustomDiscount;
  /** Cart line under the pointer, shared by the 3D stack and the list. */
  hovered: string | null;

  setPeople: (n: number) => void;
  setRules: (r: Partial<CalcRules>) => void;
  resetRules: () => void;
  setSize: (d: number) => void;
  addToCart: (line: Omit<CartLine, "qty">) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;
  setPizzeria: (p: PizzeriaFilter) => void;
  setQuery: (q: string) => void;
  cycleIngredient: (key: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  setActivePromos: (ids: string[]) => void;
  setCustom: (c: CustomDiscount) => void;
  setHovered: (key: string | null) => void;
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
      tagFilters: [],
      activePromos: [],
      custom: null,
      hovered: null,

      setPeople: (n) => set({ people: Math.min(60, Math.max(1, Math.round(n))) }),
      setRules: (r) => set((s) => ({ rules: { ...s.rules, ...r } })),
      resetRules: () => set({ rules: DEFAULT_RULES }),
      setSize: (size) => set({ size }),
      addToCart: (line) =>
        set((s) => {
          const existing = s.cart.find((l) => l.key === line.key);
          return {
            cart: existing
              ? s.cart.map((l) => (l.key === line.key ? { ...l, qty: l.qty + 1 } : l))
              : [...s.cart, { ...line, qty: 1 }],
          };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)),
        })),
      clearCart: () => set({ cart: [] }),
      setPizzeria: (pizzeria) => set({ pizzeria }),
      setQuery: (query) => set({ query }),
      cycleIngredient: (key) =>
        set((s) => {
          const next = { ...s.ingredientFilters };
          const cur = next[key];
          if (!cur) next[key] = "include";
          else if (cur === "include") next[key] = "exclude";
          else delete next[key];
          return { ingredientFilters: next };
        }),
      toggleTag: (tag) =>
        set((s) => ({
          tagFilters: s.tagFilters.includes(tag) ? s.tagFilters.filter((t) => t !== tag) : [...s.tagFilters, tag],
        })),
      clearFilters: () => set({ ingredientFilters: {}, tagFilters: [], query: "" }),
      setActivePromos: (activePromos) => set({ activePromos }),
      setCustom: (custom) => set({ custom }),
      setHovered: (hovered) => set({ hovered }),
    }),
    {
      name: "picu-kalkulators",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
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
