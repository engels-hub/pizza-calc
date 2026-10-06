import { describe, expect, it } from "vitest";
import { DEFAULT_RULES, basePizzas, exactPieces, piecesNeeded, targetArea } from "@/lib/calc";

const need = (people: number, d: number, rules = DEFAULT_RULES) => piecesNeeded(targetArea(people, rules), d);

describe("n − 1 rule", () => {
  it("5 people → 4 × 30 cm and the area equivalents", () => {
    expect(need(5, 30)).toBe(4);
    expect(need(5, 45)).toBe(2);
    expect(need(5, 23)).toBe(7);
    expect(need(5, 20)).toBe(9);
  });

  it("exact ratios do not round up from float noise", () => {
    expect(exactPieces(targetArea(5, DEFAULT_RULES), 20)).toBeCloseTo(9, 9);
    expect(need(9, 20)).toBe(18);
  });

  it("never below one pizza", () => {
    expect(basePizzas(1, DEFAULT_RULES)).toBe(1);
    expect(need(1, 30)).toBe(1);
    expect(need(1, 45)).toBe(1);
  });

  it("offset and factor are adjustable", () => {
    expect(need(5, 30, { ...DEFAULT_RULES, offset: 0 })).toBe(5);
    expect(need(5, 30, { ...DEFAULT_RULES, offset: -2 })).toBe(7);
    expect(need(4, 30, { ...DEFAULT_RULES, factor: 1.25 })).toBe(4);
    expect(need(8, 30, { ...DEFAULT_RULES, factor: 0.5 })).toBe(3);
  });
});
