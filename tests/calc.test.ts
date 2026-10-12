import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  areaPerPerson,
  basePizzas,
  exactPieces,
  piecesNeeded,
  shareOf,
  slicesPerPerson,
  targetArea,
} from "@/lib/calc";

const need = (people: number, d: number, rules = DEFAULT_RULES) => piecesNeeded(targetArea(people, rules), d);

describe("slices per person", () => {
  it("6 slices of a 30 cm for 5 people → 3,75 → 4 × 30 cm, and the area equivalents", () => {
    expect(basePizzas(5, DEFAULT_RULES)).toBeCloseTo(3.75, 9);
    expect(need(5, 30)).toBe(4);
    expect(need(5, 45)).toBe(2);
    expect(need(5, 23)).toBe(7);
    expect(need(5, 20)).toBe(9);
  });

  it("exact ratios do not round up from float noise", () => {
    // 16 × 6 / 8 = 12 × 30 cm = exactly 27 × 20 cm
    expect(exactPieces(targetArea(16, DEFAULT_RULES), 20)).toBeCloseTo(27, 9);
    expect(need(16, 20)).toBe(27);
  });

  it("never below one pizza", () => {
    expect(need(1, 30)).toBe(1);
    expect(need(1, 45)).toBe(1);
  });

  it("appetite scales the slices", () => {
    expect(slicesPerPerson({ ...DEFAULT_RULES, appetite: "hungry" })).toBe(7.5);
    expect(need(4, 30, { ...DEFAULT_RULES, appetite: "hungry" })).toBe(4); // 3,75
    expect(need(8, 30, { ...DEFAULT_RULES, appetite: "light" })).toBe(5); // 4,5
    expect(need(5, 30, { ...DEFAULT_RULES, slices: 8 })).toBe(5);
  });

  it("slices are counted in the base size's own cut", () => {
    // 20 cm is cut in 4: 2 slices each = half a 20 cm pizza per person
    expect(areaPerPerson({ ...DEFAULT_RULES, slices: 2, baseDiameter: 20 })).toBeCloseTo(Math.PI * 50, 9);
    // 45 cm is cut in 12: 3 slices each, 8 people = 2 × 45 cm = 4,5 × 30 cm
    expect(need(8, 30, { ...DEFAULT_RULES, slices: 3, baseDiameter: 45 })).toBe(5);
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
