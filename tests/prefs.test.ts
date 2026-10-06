import { describe, expect, it } from "vitest";
import snapshot from "@/data/snapshot/darbnica.json";
import {
  DEFAULT_PREFS,
  decodePrefs,
  encodePrefs,
  hasUrlState,
  linesFromSaved,
  pizzeriaFromSearch,
  prefsFromSearch,
  rigaToday,
  savedFromLines,
  searchFromPrefs,
  type Prefs,
} from "@/lib/prefs";
import type { Pizza } from "@/lib/types";

const pizzas = snapshot.pizzas as Pizza[];

describe("prefs cookie", () => {
  const prefs: Prefs = {
    people: 7,
    rules: { factor: 1.25, offset: 0, baseDiameter: 45 },
    size: 23,
    cart: [
      { pizzaId: "darbnica-margarita", variantId: "30", qty: 2 },
      { pizzaId: "darbnica-salami", variantId: "20", qty: 1 },
    ],
    activePromos: ["darbnica-drauga"],
    custom: { kind: "fixed", value: 2.5 },
  };

  it("round-trips", () => {
    expect(decodePrefs(encodePrefs(prefs))).toEqual(prefs);
  });

  it("stays small enough for a cookie", () => {
    const many = { ...prefs, cart: Array.from({ length: 30 }, (_, i) => ({ pizzaId: `darbnica-pizza-${i}`, variantId: "30", qty: 3 })) };
    expect(encodePrefs(many).length).toBeLessThan(4000);
  });

  it("falls back to defaults on garbage and clamps bad values", () => {
    expect(decodePrefs(undefined)).toEqual(DEFAULT_PREFS);
    expect(decodePrefs("%7Bnot json")).toEqual(DEFAULT_PREFS);
    const odd = decodePrefs(encodeURIComponent(JSON.stringify({ p: 999, r: [9, -9, 30], c: ["x", "a:b:0", 5], x: ["%", -1] })));
    expect(odd.people).toBe(60);
    expect(odd.rules).toEqual({ factor: 1.5, offset: -2, baseDiameter: 30 });
    expect(odd.cart).toEqual([]);
    expect(odd.custom).toBeNull();
  });

  it("rebuilds lines from today's menu and drops pizzas that are gone", () => {
    const lines = linesFromSaved([...prefs.cart, { pizzaId: "darbnica-gone", variantId: "30", qty: 1 }], pizzas);
    expect(lines.map((l) => [l.name, l.diameterCm, l.unitPrice, l.qty])).toEqual([
      ["Margarita", 30, 6.9, 2],
      ["Salami", 20, 5.2, 1],
    ]);
    expect(savedFromLines(lines)).toEqual(prefs.cart);
  });

  it("uses Riga time for today", () => {
    // 22:30 UTC on 6 Oct is already 7 Oct in Riga (UTC+3 in summer time).
    expect(rigaToday(new Date("2026-10-06T22:30:00Z"))).toBe("2026-10-07");
  });
});

describe("URL state", () => {
  const parse = (search: string) => Object.fromEntries(new URLSearchParams(search));

  it("round-trips through the address", () => {
    const prefs: Prefs = {
      people: 7,
      rules: { factor: 1.25, offset: 0, baseDiameter: 45 },
      size: 23,
      cart: [
        { pizzaId: "darbnica-margarita", variantId: "30", qty: 2 },
        { pizzaId: "lulu-trio-pica", variantId: "heart", qty: 1 },
      ],
      activePromos: ["darbnica-drauga", "lulu-davana"],
      custom: { kind: "percent", value: 10 },
    };
    const search = searchFromPrefs(prefs, "lulu");
    expect(search).toContain("cart=darbnica-margarita:30:2,lulu-trio-pica:heart:1");
    expect(prefsFromSearch(parse(search))).toEqual(prefs);
    expect(pizzeriaFromSearch(parse(search))).toBe("lulu");
  });

  it("keeps links short by leaving defaults out, but always writes people", () => {
    expect(searchFromPrefs(DEFAULT_PREFS, "all")).toBe("?n=5");
    expect(hasUrlState(parse("?n=5"))).toBe(true);
    expect(hasUrlState(parse("?utm_source=x"))).toBe(false);
  });

  it("treats missing keys as defaults and survives garbage", () => {
    const p = prefsFromSearch(parse("?n=abc&size=999&rule=x&cart=bad,,a:b:-1&eur=-3&pizzeria=nope"));
    expect(p).toEqual({ ...DEFAULT_PREFS, size: 60 });
    expect(pizzeriaFromSearch(parse("?pizzeria=nope"))).toBe("all");
    expect(pizzeriaFromSearch(parse(`?pizzeria=${encodeURIComponent("darbnīca")}`))).toBe("darbnīca");
  });
});
