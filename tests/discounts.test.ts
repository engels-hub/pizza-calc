import { describe, expect, it } from "vitest";
import { computeTotals, togglePromo, type CartLine, type Promo } from "@/lib/discounts";
import { PROMOS } from "@/data/promos";

const line = (pizzeriaId: "picu" | "lulu", unitPrice: number, qty = 1): CartLine => ({
  key: `${pizzeriaId}-${unitPrice}`,
  pizzaId: "x",
  pizzeriaId,
  name: "x",
  variantLabel: "30 cm",
  diameterCm: 30,
  unitPrice,
  qty,
});
const promo = (id: string) => PROMOS.find((p) => p.id === id)!;

describe("computeTotals", () => {
  it("every 3rd free makes the cheapest of each three free", () => {
    const t = computeTotals([line("lulu", 15.99, 2), line("lulu", 10.99), line("lulu", 19.99)], [promo("lulu-davana")], null);
    expect(t.subtotal).toBe(62.96);
    expect(t.saved).toBe(10.99);
    expect(t.total).toBe(51.97);
  });

  it("promos only touch their own pizzeria", () => {
    const t = computeTotals([line("lulu", 20), line("picu", 10)], [promo("lulu-picrudens")], null);
    expect(t.saved).toBe(10);
    expect(t.total).toBe(20);
  });

  it("custom discount applies last on the remaining total", () => {
    const t = computeTotals([line("picu", 10, 2)], [promo("picu-birthday")], { kind: "percent", value: 10 });
    // 20 − 15% = 17, then −10% = 15.30
    expect(t.total).toBe(15.3);
    expect(t.discounts.map((d) => d.amount)).toEqual([3, 1.7]);
  });

  it("fixed custom discount cannot go below zero", () => {
    expect(computeTotals([line("picu", 6.9)], [], { kind: "fixed", value: 50 }).total).toBe(0);
  });

  it("stacked 50% and every 3rd free never goes negative", () => {
    const t = computeTotals([line("lulu", 10, 3)], [promo("lulu-picrudens"), promo("lulu-davana")], null);
    expect(t.total).toBe(10);
  });
});

describe("togglePromo", () => {
  const all: Promo[] = PROMOS;
  it("takeaway −15% replaces other LuLū deals and vice versa", () => {
    let active = togglePromo([], promo("lulu-davana"), all);
    active = togglePromo(active, promo("lulu-takeaway"), all);
    expect(active).toEqual(["lulu-takeaway"]);
    active = togglePromo(active, promo("lulu-picrudens"), all);
    expect(active).toEqual(["lulu-picrudens"]);
  });

  it("does not touch the other pizzeria", () => {
    const active = togglePromo(["picu-birthday"], promo("lulu-takeaway"), all);
    expect(active).toEqual(["picu-birthday", "lulu-takeaway"]);
  });
});
