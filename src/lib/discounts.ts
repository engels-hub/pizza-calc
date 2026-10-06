import type { PizzeriaId, Shape } from "./types";

export interface CartLine {
  key: string;
  pizzaId: string;
  pizzeriaId: PizzeriaId;
  name: string;
  diameterCm: number;
  shape: Shape;
  unitPrice: number;
  qty: number;
}

export type DiscountRule =
  | { kind: "percent"; value: number }
  | { kind: "everyNthFree"; n: number };

export interface Promo {
  id: string;
  pizzeriaId: PizzeriaId;
  /** Code to type at checkout, if any. */
  code?: string;
  rule: DiscountRule;
  /** ISO date (inclusive). Missing means always. */
  validFrom?: string;
  validTo?: string;
  /**
   * Promos sharing a group cannot be combined; the newest pick wins.
   * "solo" means the promo cannot be combined with anything at that pizzeria.
   */
  exclusiveGroup?: string;
}

export type CustomDiscount = { kind: "percent"; value: number } | { kind: "fixed"; value: number } | null;

/** `id` is a promo id, or "custom" for the user's own discount. */
export interface AppliedDiscount {
  id: string;
  amount: number;
}

export interface Totals {
  subtotal: number;
  discounts: AppliedDiscount[];
  saved: number;
  total: number;
  pizzaCount: number;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function isPromoActive(p: Promo, today: string): boolean {
  return (!p.validFrom || today >= p.validFrom) && (!p.validTo || today <= p.validTo);
}

/** Unit prices, one entry per pizza, for the lines of a pizzeria. */
function unitPrices(lines: CartLine[]): number[] {
  return lines.flatMap((l) => Array.from({ length: l.qty }, () => l.unitPrice));
}

function promoAmount(rule: DiscountRule, prices: number[]): number {
  if (prices.length === 0) return 0;
  if (rule.kind === "percent") {
    return round2(prices.reduce((a, b) => a + b, 0) * (rule.value / 100));
  }
  // Every n-th pizza free: the cheapest floor(count / n) pizzas are free.
  const free = Math.floor(prices.length / rule.n);
  return round2([...prices].sort((a, b) => a - b).slice(0, free).reduce((a, b) => a + b, 0));
}

/**
 * Each promo only touches its own pizzeria's lines. Promos on the same
 * pizzeria stack in order on what is left, so 50% + every 3rd free never goes negative.
 * The custom discount applies last, on the whole remaining total.
 */
export function computeTotals(lines: CartLine[], promos: Promo[], custom: CustomDiscount): Totals {
  const subtotal = round2(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0));
  const discounts: AppliedDiscount[] = [];

  const byPizzeria = new Map<PizzeriaId, number[]>();
  for (const l of lines) byPizzeria.set(l.pizzeriaId, [...(byPizzeria.get(l.pizzeriaId) ?? []), ...unitPrices([l])]);

  for (const [pizzeriaId, prices] of byPizzeria) {
    let remaining = prices.slice();
    for (const p of promos.filter((x) => x.pizzeriaId === pizzeriaId)) {
      const amount = promoAmount(p.rule, remaining);
      if (amount <= 0) continue;
      discounts.push({ id: p.id, amount });
      // Scale the remaining prices so the next promo sees discounted prices.
      const sum = remaining.reduce((a, b) => a + b, 0);
      const k = sum === 0 ? 0 : (sum - amount) / sum;
      remaining = remaining.map((x) => x * k);
    }
  }

  let afterPromos = round2(subtotal - discounts.reduce((s, d) => s + d.amount, 0));
  if (custom && custom.value > 0) {
    const amount =
      custom.kind === "percent"
        ? round2(afterPromos * Math.min(custom.value, 100) / 100)
        : round2(Math.min(custom.value, afterPromos));
    if (amount > 0) {
      discounts.push({ id: "custom", amount });
      afterPromos = round2(afterPromos - amount);
    }
  }

  const saved = round2(subtotal - afterPromos);
  return {
    subtotal,
    discounts,
    saved,
    total: Math.max(0, afterPromos),
    pizzaCount: lines.reduce((s, l) => s + l.qty, 0),
  };
}

/** Toggle a promo on, dropping any promo it cannot be combined with. */
export function togglePromo(active: string[], promo: Promo, all: Promo[]): string[] {
  if (active.includes(promo.id)) return active.filter((id) => id !== promo.id);
  const clashes = (p: Promo) =>
    p.id !== promo.id &&
    p.pizzeriaId === promo.pizzeriaId &&
    (promo.exclusiveGroup === "solo" ||
      p.exclusiveGroup === "solo" ||
      (!!promo.exclusiveGroup && p.exclusiveGroup === promo.exclusiveGroup));
  const drop = new Set(all.filter(clashes).map((p) => p.id));
  return [...active.filter((id) => !drop.has(id)), promo.id];
}
