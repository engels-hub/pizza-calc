import { describe, expect, it } from "vitest";
import { DEFAULT_RULES, basePizzas, exactPieces, piecesNeeded, shareOf, targetArea } from "@/lib/calc";

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

describe("shareOf", () => {
  const line = (diameterCm: number, qty: number, shape: "round" | "calzone" = "round") => ({ diameterCm, qty, shape });

  it("splits evenly when it can", () => {
    // 4 × 30 cm = 32 slices for 4 people
    expect(shareOf([line(30, 4)], 4)).toMatchObject({ slices: 32, base: 8, baseCount: 4, extraCount: 0 });
  });

  it("reports the uneven split", () => {
    // 4 × 30 cm = 32 slices for 5 people: 3 get 6, 2 get 7
    expect(shareOf([line(30, 4)], 5)).toMatchObject({ base: 6, baseCount: 3, extraCount: 2 });
  });

  it("mixes sizes and counts area per person", () => {
    const s = shareOf([line(45, 1), line(20, 2), line(30, 1, "calzone")], 3);
    expect(s.slices).toBe(12 + 8 + 4);
    expect(s.areaEach).toBe(Math.round((Math.PI * (22.5 ** 2 + 2 * 10 ** 2 + 15 ** 2)) / 3));
  });

  it("handles more people than slices", () => {
    expect(shareOf([line(20, 1)], 6)).toMatchObject({ slices: 4, base: 0, baseCount: 2, extraCount: 4 });
  });
});
