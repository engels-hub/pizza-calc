import { DEFAULT_RULES, type CalcRules } from "./calc";
import type { CartLine, CustomDiscount } from "./discounts";
import { PIZZERIA_IDS, type Pizza, type PizzeriaId } from "./types";

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
    c: prefs.cart.map(cartEntry),
    a: prefs.activePromos,
    x: prefs.custom ? [prefs.custom.kind === "percent" ? "%" : "€", prefs.custom.value] : null,
  };
  return encodeURIComponent(JSON.stringify(wire));
}

const num = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/** "pizzaId:variantId:qty" entries; anything malformed is skipped. */
function parseCart(entries: unknown[]): SavedLine[] {
  return entries.flatMap((entry) => {
    if (typeof entry !== "string") return [];
    const [pizzaId, variantId, qty] = entry.split(":");
    const n = Number(qty);
    return pizzaId && variantId && n > 0 ? [{ pizzaId, variantId, qty: Math.min(30, Math.round(n)) }] : [];
  });
}

const cartEntry = (l: SavedLine) => `${l.pizzaId}:${l.variantId}:${l.qty}`;

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
  const cart = parseCart(Array.isArray(wire.c) ? wire.c : []);
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

// ---------------------------------------------------------------------------
// URL state: each tab's order lives in its own address, so two tabs can hold
// two different orders (e.g. one per pizzeria) and a link reproduces it.
// ---------------------------------------------------------------------------

export type SearchParams = Record<string, string | string[] | undefined>;

/** Query keys owned by the calculator. */
const URL_KEYS = ["n", "size", "rule", "cart", "promo", "pct", "eur", "pizzeria"] as const;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) => (first(v) ?? "").split(",").filter(Boolean);
const numParam = (v: string | string[] | undefined) => {
  const s = first(v);
  return s === undefined || s === "" ? undefined : Number(s);
};

/** Like encodeURIComponent, but keeps ":" readable; it is valid in a query. */
const enc = (s: string) => encodeURIComponent(s).replace(/%3A/gi, ":");

export function hasUrlState(sp: SearchParams): boolean {
  return URL_KEYS.some((k) => first(sp[k]) !== undefined);
}

/**
 * Prefs from the address. Links only carry non-default values, so any key
 * that is missing means "default", never "whatever the cookie says".
 */
export function prefsFromSearch(sp: SearchParams): Prefs {
  const [factor, offset, baseDiameter] = list(sp.rule).map(Number);
  const pct = numParam(sp.pct);
  const eur = numParam(sp.eur);
  const custom: CustomDiscount =
    pct && pct > 0
      ? { kind: "percent", value: Math.min(100, pct) }
      : eur && eur > 0
        ? { kind: "fixed", value: eur }
        : null;
  return {
    people: Math.round(num(numParam(sp.n), 1, 60, DEFAULT_PREFS.people)),
    rules: {
      factor: num(factor, 0.5, 1.5, DEFAULT_RULES.factor),
      offset: Math.round(num(offset, -2, 3, DEFAULT_RULES.offset)),
      baseDiameter: num(baseDiameter, 10, 60, DEFAULT_RULES.baseDiameter),
    },
    size: num(numParam(sp.size), 10, 60, DEFAULT_PREFS.size),
    cart: parseCart(list(sp.cart)),
    activePromos: list(sp.promo),
    custom,
  };
}

export function pizzeriaFromSearch(sp: SearchParams): PizzeriaId | "all" {
  const v = first(sp.pizzeria);
  return PIZZERIA_IDS.includes(v as PizzeriaId) ? (v as PizzeriaId) : "all";
}

/** "?n=6&cart=...". People is always written, so a touched tab never falls back to the cookie. */
export function searchFromPrefs(prefs: Prefs, pizzeria: PizzeriaId | "all"): string {
  const q: string[] = [`n=${prefs.people}`];
  if (prefs.size !== DEFAULT_PREFS.size) q.push(`size=${prefs.size}`);
  const { factor, offset, baseDiameter } = prefs.rules;
  if (
    factor !== DEFAULT_RULES.factor ||
    offset !== DEFAULT_RULES.offset ||
    baseDiameter !== DEFAULT_RULES.baseDiameter
  ) {
    q.push(`rule=${factor},${offset},${baseDiameter}`);
  }
  if (prefs.cart.length) q.push(`cart=${prefs.cart.map(cartEntry).map(enc).join(",")}`);
  if (prefs.activePromos.length) q.push(`promo=${prefs.activePromos.map(enc).join(",")}`);
  if (prefs.custom) q.push(`${prefs.custom.kind === "percent" ? "pct" : "eur"}=${prefs.custom.value}`);
  if (pizzeria !== "all") q.push(`pizzeria=${encodeURIComponent(pizzeria)}`);
  return `?${q.join("&")}`;
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
