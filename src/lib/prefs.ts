import { DEFAULT_RULES, type CalcRules } from "./calc";
import type { CartLine, CustomDiscount } from "./discounts";
import type { Pizza } from "./types";

/**
 * The visitor's saved choices, kept in one small cookie so the server can
 * render their cart and settings directly (no flash after hydration).
 * Cart lines are stored as ids only; names and prices come from the current
 * menu, so a saved cart always shows today's prices.
 */
export const PREFS_COOKIE = "picu";
export const PREFS_MAX_AGE = 60 * 60 * 24 * 365;

export interface SavedLine {
  pizzaId: string;
  variantId: string;
  qty: number;
}

export interface Prefs {
  people: number;
  rules: CalcRules;
  size: number;
  cart: SavedLine[];
  activePromos: string[];
  custom: CustomDiscount;
}

export const DEFAULT_PREFS: Prefs = {
  people: 5,
  rules: DEFAULT_RULES,
  size: 30,
  cart: [],
  activePromos: [],
  custom: null,
};

/** Compact wire format: short keys, cart as "pizzaId:variantId:qty". */
interface Wire {
  p?: number;
  r?: [number, number, number];
  s?: number;
  c?: string[];
  a?: string[];
  x?: ["%" | "€", number] | null;
}

export function encodePrefs(prefs: Prefs): string {
  const wire: Wire = {
    p: prefs.people,
    r: [prefs.rules.factor, prefs.rules.offset, prefs.rules.baseDiameter],
    s: prefs.size,
    c: prefs.cart.map((l) => `${l.pizzaId}:${l.variantId}:${l.qty}`),
    a: prefs.activePromos,
    x: prefs.custom ? [prefs.custom.kind === "percent" ? "%" : "€", prefs.custom.value] : null,
  };
  return encodeURIComponent(JSON.stringify(wire));
}

const num = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/** Never throws: anything malformed falls back to the defaults field by field. */
export function decodePrefs(raw: string | undefined): Prefs {
  if (!raw) return DEFAULT_PREFS;
  let wire: Wire;
  try {
    wire = JSON.parse(decodeURIComponent(raw));
  } catch {
    return DEFAULT_PREFS;
  }
  if (!wire || typeof wire !== "object") return DEFAULT_PREFS;

  const [factor, offset, baseDiameter] = Array.isArray(wire.r) ? wire.r : [];
  const cart: SavedLine[] = (Array.isArray(wire.c) ? wire.c : []).flatMap((entry) => {
    if (typeof entry !== "string") return [];
    const [pizzaId, variantId, qty] = entry.split(":");
    const n = Number(qty);
    return pizzaId && variantId && n > 0 ? [{ pizzaId, variantId, qty: Math.min(30, Math.round(n)) }] : [];
  });
  const custom: CustomDiscount =
    Array.isArray(wire.x) && typeof wire.x[1] === "number" && wire.x[1] > 0
      ? { kind: wire.x[0] === "€" ? "fixed" : "percent", value: wire.x[1] }
      : null;

  return {
    people: Math.round(num(wire.p, 1, 60, DEFAULT_PREFS.people)),
    rules: {
      factor: num(factor, 0.5, 1.5, DEFAULT_RULES.factor),
      offset: Math.round(num(offset, -2, 3, DEFAULT_RULES.offset)),
      baseDiameter: num(baseDiameter, 10, 60, DEFAULT_RULES.baseDiameter),
    },
    size: num(wire.s, 10, 60, DEFAULT_PREFS.size),
    cart,
    activePromos: Array.isArray(wire.a) ? wire.a.filter((a): a is string => typeof a === "string") : [],
    custom,
  };
}

/** Rebuild full cart lines from saved ids against the current menu; drops pizzas that are gone. */
export function linesFromSaved(saved: SavedLine[], pizzas: Pizza[]): CartLine[] {
  const byId = new Map(pizzas.map((p) => [p.id, p]));
  return saved.flatMap(({ pizzaId, variantId, qty }) => {
    const pizza = byId.get(pizzaId);
    const variant = pizza?.variants.find((v) => v.id === variantId);
    if (!pizza || !variant) return [];
    return [
      {
        key: `${pizza.id}:${variant.id}`,
        pizzaId: pizza.id,
        pizzeriaId: pizza.pizzeriaId,
        name: pizza.name,
        diameterCm: variant.diameterCm,
        shape: variant.shape,
        unitPrice: variant.price,
        qty,
      },
    ];
  });
}

export function savedFromLines(lines: CartLine[]): SavedLine[] {
  return lines.map((l) => ({ pizzaId: l.pizzaId, variantId: l.key.slice(l.pizzaId.length + 1), qty: l.qty }));
}

/** Today's date in Riga, YYYY-MM-DD; promos are dated in local time. */
export function rigaToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Riga" }).format(now);
}
