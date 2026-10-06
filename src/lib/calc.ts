import type { Shape } from "./types";

export interface CalcRules {
  /** Pizzas per person before the offset. */
  factor: number;
  /** Subtracted from people × factor. Default 1, so n people → n − 1 pizzas. */
  offset: number;
  /** Diameter of the pizza the rule is counted in. */
  baseDiameter: number;
}

export const DEFAULT_RULES: CalcRules = { factor: 1, offset: 1, baseDiameter: 30 };

export const APPETITES = [
  { id: "light", factor: 0.8 },
  { id: "normal", factor: 1 },
  { id: "hungry", factor: 1.25 },
] as const;

/** Diameters the rule can be counted in. */
export const BASE_DIAMETERS = [20, 23, 30, 45] as const;

/** Heart shape and calzone are counted as the round pizza of the same size. */
export function pizzaArea(diameterCm: number): number {
  const r = diameterCm / 2;
  return Math.PI * r * r;
}

/** How many base-size pizzas the rule asks for. Never less than one. */
export function basePizzas(people: number, rules: CalcRules): number {
  return Math.max(1, people * rules.factor - rules.offset);
}

export function targetArea(people: number, rules: CalcRules): number {
  return basePizzas(people, rules) * pizzaArea(rules.baseDiameter);
}

/** Unrounded number of pizzas of `diameter` that cover `area`. */
export function exactPieces(area: number, diameter: number): number {
  return area / pizzaArea(diameter);
}

// 20 cm vs 30 cm is exactly 9/4, so float noise must not push 9 to 10.
const EPS = 1e-9;

export function piecesNeeded(area: number, diameter: number): number {
  return Math.max(1, Math.ceil(exactPieces(area, diameter) - EPS));
}

/** Euro per 100 cm². */
export function pricePer100cm2(price: number, diameter: number): number {
  return (price / pizzaArea(diameter)) * 100;
}

/** Fraction of the target covered by the cart, e.g. 0.75. */
export function coverage(cartArea: number, area: number): number {
  return area === 0 ? 1 : cartArea / area;
}

/**
 * Slices per pizza. Neither pizzeria publishes this, so these are the usual
 * cuts for each size; unknown sizes get 8 slices per 30 cm worth of diameter.
 */
export const SLICES_BY_DIAMETER: Record<number, number> = { 20: 4, 23: 6, 30: 8, 45: 12 };
const CALZONE_PIECES = 4;

export function slicesFor(diameterCm: number, shape: Shape): number {
  if (shape === "calzone") return CALZONE_PIECES;
  return SLICES_BY_DIAMETER[diameterCm] ?? Math.max(4, 2 * Math.round((diameterCm / 30) * 4));
}

export interface Share {
  slices: number;
  /** cm² of pizza per person, rounded. */
  areaEach: number;
  /** Fewest slices anyone gets, and how many people get exactly that. */
  base: number;
  baseCount: number;
  /** People who get one slice more than `base` (0 when it splits evenly). */
  extraCount: number;
}

/** How the order splits between `people`: slices handed out as evenly as possible. */
export function shareOf(lines: { diameterCm: number; shape: Shape; qty: number }[], people: number): Share {
  const n = Math.max(1, people);
  const slices = lines.reduce((s, l) => s + slicesFor(l.diameterCm, l.shape) * l.qty, 0);
  const area = lines.reduce((s, l) => s + pizzaArea(l.diameterCm) * l.qty, 0);
  const base = Math.floor(slices / n);
  const extraCount = slices % n;
  return { slices, areaEach: Math.round(area / n), base, baseCount: n - extraCount, extraCount };
}
