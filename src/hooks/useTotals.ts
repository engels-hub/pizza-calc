"use client";

import { PROMOS } from "@/data/promos";
import { computeTotals, isPromoActive, type Totals } from "@/lib/discounts";
import { useStore } from "@/lib/store";
import { useToday } from "./useToday";

/** Cart totals with the active, currently valid promos and the custom discount applied. */
export function useTotals(): Totals {
  const cart = useStore((s) => s.cart);
  const active = useStore((s) => s.activePromos);
  const custom = useStore((s) => s.custom);
  const today = useToday();
  const applied = PROMOS.filter((p) => active.includes(p.id) && (!today || isPromoActive(p, today)));
  return computeTotals(cart, applied, custom);
}
