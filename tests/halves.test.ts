import { describe, expect, it } from "vitest";
import luluSnapshot from "@/data/snapshot/lulu.json";
import { computeTotals } from "@/lib/discounts";
import { variantLabel } from "@/lib/format";
import { halfPartners, halvesLine, halvesVariant, otherHalfId } from "@/lib/halves";
import { DEFAULT_PREFS, linesFromSaved, savedFromLines } from "@/lib/prefs";
import { createAppStore } from "@/lib/store";
import type { Pizza } from "@/lib/types";

const pizzas = luluSnapshot.pizzas as Pizza[];
const byName = (name: string) => pizzas.find((p) => p.name === name)!;
const desu = byName("Desu pica");
const dubult = byName("Dubultdesu pica");

describe("Pus-Pus pizza", () => {
  it("each half costs that pizza's 30 cm price + 0,50 €", () => {
    for (const p of pizzas.filter((x) => x.halfPrice)) {
      const p30 = p.variants.find((v) => v.id === "30")!.price;
      expect(p.halfPrice).toBeCloseTo(p30 + 0.5, 2);
    }
  });

  it("costs the two halves added up, as a 45 cm round pizza", () => {
    const line = halvesLine(desu, dubult);
    expect(line).toMatchObject({ key: "lulu-desu-pica:pus.lulu-dubultdesu-pica", diameterCm: 45, shape: "round" });
    expect(line.unitPrice).toBe(26.48);
    expect(variantLabel(line)).toBe("Pus-pus 45 cm");
    expect(variantLabel(halvesVariant(desu))).toBe("Pus-pus 45 cm");
  });

  it("partners are the other LuLū pizzas that can be a half", () => {
    const partners = halfPartners(desu, pizzas);
    expect(partners).not.toContain(desu);
    expect(partners.every((p) => p.pizzeriaId === "lulu" && p.halfPrice)).toBe(true);
    expect(partners.length).toBeGreaterThan(30);
  });

  it("saves and restores through the usual cart entry", () => {
    const saved = savedFromLines([halvesLine(desu, dubult, 2)]);
    expect(saved).toEqual([{ pizzaId: desu.id, variantId: `pus.${dubult.id}`, qty: 2 }]);
    expect(otherHalfId(saved[0].variantId)).toBe(dubult.id);
    expect(linesFromSaved(saved, pizzas)).toEqual([halvesLine(desu, dubult, 2)]);
    // A half that left the menu drops the whole line.
    expect(linesFromSaved([{ ...saved[0], variantId: "pus.lulu-gone" }], pizzas)).toEqual([]);
  });

  it("counts in deals like any other LuLū pizza", () => {
    const t = computeTotals([halvesLine(desu, dubult)], [{ id: "x", pizzeriaId: "lulu", rule: { kind: "percent", value: 50 } }], null);
    expect(t.total).toBe(13.24);
  });
});

describe("store", () => {
  const store = () => createAppStore({ ...DEFAULT_PREFS, cart: [], today: "2026-10-12", pizzeria: "all" });

  it("adds and merges the same Pus-Pus pizza", () => {
    const s = store();
    s.getState().addHalves(desu, dubult);
    s.getState().addHalves(desu, dubult);
    expect(s.getState().cart).toMatchObject([{ key: `${desu.id}:pus.${dubult.id}`, qty: 2, half: { name: "Dubultdesu pica" } }]);
  });

  it("swaps the second half and turns back into a whole pizza", () => {
    const s = store();
    s.getState().addHalves(desu, dubult);
    const siera = byName("Siera pica");
    s.getState().setHalves(`${desu.id}:pus.${dubult.id}`, desu, siera);
    expect(s.getState().cart).toMatchObject([{ half: { pizzaId: siera.id }, unitPrice: 22.98 }]);

    const v45 = desu.variants.find((v) => v.id === "45")!;
    s.getState().setVariant(`${desu.id}:pus.${siera.id}`, desu, v45);
    const [line] = s.getState().cart;
    expect(line).toMatchObject({ key: `${desu.id}:45`, unitPrice: v45.price });
    expect(line.half).toBeUndefined();
  });
});
