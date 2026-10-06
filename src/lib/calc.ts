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
  { id: "light", label: "Viegli", factor: 0.8 },
  { id: "normal", label: "Normāli", factor: 1 },
  { id: "hungry", label: "Izsalkuši", factor: 1.25 },
] as const;

/** Heart shape and calzone are counted as the round pizza of the same size. */
export function pizzaArea(diameterCm: number, _shape: Shape = "round"): number {
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
