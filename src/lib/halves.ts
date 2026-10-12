import { round2, type CartLine } from "./discounts";
import type { Pizza, Variant } from "./types";

/**
 * LuLū's Pus-Pus pizza: one 45 cm pizza, each half a different menu pizza.
 * Each half has its own price (that pizza's 30 cm price + 0,50 € today), and
 * the pizza costs the two halves added up.
 *
 * In the cart it is a line of its first half, with variant id
 * "pus.<second half's pizza id>", so saved carts and links need no new format.
 */
export const HALVES_DIAMETER = 45;
export const HALVES_ID = "pus";
const PREFIX = `${HALVES_ID}.`;

export const canBeHalf = (p: Pizza | undefined): p is Pizza & { halfPrice: number } =>
  Boolean(p?.halfPrice && p.halfPrice > 0);

/** Pizzas that can be the other half of `pizza` (the same pizza twice is allowed but pointless). */
export function halfPartners(pizza: Pizza, pizzas: Pizza[]): Pizza[] {
  return pizzas.filter((p) => p.pizzeriaId === pizza.pizzeriaId && p.id !== pizza.id && canBeHalf(p));
}

export const halvesVariantId = (otherId: string) => `${PREFIX}${otherId}`;

/** The second half's pizza id, or null for an ordinary variant id. */
export function otherHalfId(variantId: string): string | null {
  return variantId.startsWith(PREFIX) ? variantId.slice(PREFIX.length) || null : null;
}

export const halvesPrice = (a: Pizza, b: Pizza) => round2((a.halfPrice ?? 0) + (b.halfPrice ?? 0));

/**
 * "Pus-pus 45 cm" as one more entry in a size dropdown. Without a second half
 * yet, it is priced as two of this half.
 */
export function halvesVariant(pizza: Pizza, other?: Pizza): Variant {
  return {
    id: other ? halvesVariantId(other.id) : HALVES_ID,
    diameterCm: HALVES_DIAMETER,
    shape: "round",
    price: halvesPrice(pizza, other ?? pizza),
  };
}

export const isHalvesId = (variantId: string) => variantId === HALVES_ID || variantId.startsWith(PREFIX);

export function halvesLine(a: Pizza, b: Pizza, qty = 1): CartLine {
  return {
    key: `${a.id}:${halvesVariantId(b.id)}`,
    pizzaId: a.id,
    pizzeriaId: a.pizzeriaId,
    name: a.name,
    diameterCm: HALVES_DIAMETER,
    shape: "round",
    unitPrice: halvesPrice(a, b),
    qty,
    half: { pizzaId: b.id, name: b.name },
  };
}
