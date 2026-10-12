import type { Shape } from "./types";

export type AppetiteId = "light" | "normal" | "hungry";

/**
 * The group's appetite, counted in slices: an average person eats `slices`
 * slices of a `baseDiameter` pizza, scaled by how hungry the group is.
 */
export interface CalcRules {
  /** Slices of the base pizza one average person eats. */
  slices: number;
  appetite: AppetiteId;
  /** Diameter of the pizza the slices are counted in. */
  baseDiameter: number;
}

export const DEFAULT_RULES: CalcRules = { slices: 6, appetite: "normal", baseDiameter: 30 };

export const APPETITES: readonly { id: AppetiteId; factor: number }[] = [
  { id: "light", factor: 0.75 },
  { id: "normal", factor: 1 },
  { id: "hungry", factor: 1.25 },
];

export const appetiteFactor = (id: AppetiteId) => APPETITES.find((a) => a.id === id)?.factor ?? 1;

/** Slices one person may eat, before appetite. */
export const SLICES_MIN = 1;
export const SLICES_MAX = 16;

/** Diameters the slices can be counted in. */
export const BASE_DIAMETERS = [20, 23, 30, 45] as const;

/** Heart shape and calzone are counted as the round pizza of the same size. */
export function pizzaArea(diameterCm: number): number {
  const r = diameterCm / 2;
  return Math.PI * r * r;
}

/** Slices one person eats once appetite is applied, e.g. 6 × 1,25 = 7,5. */
export function slicesPerPerson(rules: CalcRules): number {
  return rules.slices * appetiteFactor(rules.appetite);
}

/** cm² one person eats: their slices of the base pizza, cut the usual way for its size. */
export function areaPerPerson(rules: CalcRules): number {
  return (pizzaArea(rules.baseDiameter) * slicesPerPerson(rules)) / slicesFor(rules.baseDiameter, "round");
}

/** How many base-size pizzas the group eats, unrounded. */
export function basePizzas(people: number, rules: CalcRules): number {
  return (people * slicesPerPerson(rules)) / slicesFor(rules.baseDiameter, "round");
}

export function targetArea(people: number, rules: CalcRules): number {
  return people * areaPerPerson(rules);
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
