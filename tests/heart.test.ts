import { describe, expect, it } from "vitest";
import { heartSlab, insideHeart } from "@/components/pizza3d/heart";

describe("heart pizza geometry", () => {
  it("knows inside from outside (lobes at the back, tip towards the camera)", () => {
    expect(insideHeart(0, 0, 1)).toBe(true);
    expect(insideHeart(0.55, -0.45, 1)).toBe(true); // right lobe
    expect(insideHeart(0, 0.85, 1)).toBe(true); // near the tip
    expect(insideHeart(0.9, 0.85, 1)).toBe(false); // beside the tip
    expect(insideHeart(0, -0.75, 1)).toBe(false); // the dip between the lobes
  });

  it("toppings area shrinks with scale", () => {
    expect(insideHeart(0.75, -0.5, 0.72)).toBe(false);
    expect(insideHeart(0.75, -0.5, 1)).toBe(true);
    expect(insideHeart(0.3, -0.2, 0.72)).toBe(true);
  });

  it("slab is centred on y = 0 and about pizza-sized", () => {
    const g = heartSlab(1, 0.14);
    g.computeBoundingBox();
    const b = g.boundingBox!;
    expect(b.min.y).toBeCloseTo(-0.07);
    expect(b.max.y).toBeCloseTo(0.07);
    expect(b.max.x - b.min.x).toBeGreaterThan(1.9);
    expect(b.max.z).toBeCloseTo(1, 1); // tip on the camera side
  });
});
