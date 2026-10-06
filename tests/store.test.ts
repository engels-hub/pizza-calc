import { describe, expect, it } from "vitest";
import luluSnapshot from "@/data/snapshot/lulu.json";
import { DEFAULT_PREFS } from "@/lib/prefs";
import { createAppStore } from "@/lib/store";
import type { Pizza } from "@/lib/types";

const trio = (luluSnapshot.pizzas as Pizza[]).find((p) => p.id === "lulu-trio-pica")!;
const size = (id: string) => trio.variants.find((v) => v.id === id)!;

function store() {
  const s = createAppStore({ ...DEFAULT_PREFS, cart: [], today: "2026-10-06", pizzeria: "all" });
  s.getState().addPizza(trio, size("30"));
  s.getState().addPizza(trio, size("30"));
  return s;
}

describe("setVariant", () => {
  it("switches a line to another size in place, with the new price", () => {
    const s = store();
    s.getState().setVariant("lulu-trio-pica:30", trio, size("45"));
    expect(s.getState().cart).toMatchObject([{ key: "lulu-trio-pica:45", diameterCm: 45, unitPrice: size("45").price, qty: 2 }]);
  });

  it("merges into an existing line of that size", () => {
    const s = store();
    s.getState().addPizza(trio, size("23"));
    s.getState().setVariant("lulu-trio-pica:30", trio, size("23"));
    expect(s.getState().cart).toMatchObject([{ key: "lulu-trio-pica:23", qty: 3 }]);
  });

  it("ignores switching to the same size", () => {
    const s = store();
    const before = s.getState().cart;
    s.getState().setVariant("lulu-trio-pica:30", trio, size("30"));
    expect(s.getState().cart).toBe(before);
  });
});
