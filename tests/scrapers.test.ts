import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseLuluList, parseLuluProduct } from "@/lib/scrapers/lulu";
import { parseDarbnica } from "@/lib/scrapers/darbnica";
import { variantLabel } from "@/lib/format";

const fx = (f: string) => readFileSync(new URL(`./fixtures/${f}`, import.meta.url), "utf8");

describe("Picu darbnīca", () => {
  const pizzas = parseDarbnica(fx("darbnica-list.html"));
  it("parses every pizza with two sizes", () => {
    expect(pizzas).toHaveLength(30);
    expect(pizzas.every((p) => p.variants.map((v) => v.diameterCm).join() === "20,30")).toBe(true);
  });
  it("reads prices, ingredients and photos", () => {
    const m = pizzas.find((p) => p.name === "Margarita")!;
    expect(m.variants.map((v) => v.price)).toEqual([5, 6.9]);
    expect(m.ingredients).toEqual(expect.arrayContaining(["tomato", "extra-cheese", "herbs"]));
    expect(m.tags).toContain("vegetarian");
    expect(m.id).toBe("darbnica-margarita");
    expect(m.pizzeriaId).toBe("darbnīca");
    expect(m.imageUrl).toMatch(/^https:\/\/www\.picudarbnica\.lv\/.+\.jpg$/);
  });
  it("marks spicy pizzas", () => {
    expect(pizzas.find((p) => p.name.startsWith("Peperoni"))!.tags).toContain("spicy");
  });
});

describe("LuLū", () => {
  it("lists product slugs", () => {
    const slugs = parseLuluList(fx("lulu-list.html"));
    expect(slugs.length).toBeGreaterThan(40);
    expect(slugs).toContain("trio-pica");
  });
  it("parses sizes including the heart shape", () => {
    const p = parseLuluProduct(fx("lulu-trio.html"), "trio-pica")!;
    expect(p.variants.map((v) => [variantLabel(v), v.price])).toEqual([
      ["23 cm", 10.49],
      ["30 cm", 14.49],
      ["Sirds 30 cm", 16.99],
      ["45 cm", 23.99],
    ]);
    expect(p.ingredients).toEqual(expect.arrayContaining(["salami", "bacon", "mushroom"]));
    expect(p.rawIngredients.some((r) => /ilustratīv/i.test(r))).toBe(false);
    expect(p.imageUrl).toMatch(/^https:\/\/www\.lulu\.lv\//);
  });
  it("parses one-size calzones", () => {
    const p = parseLuluProduct(fx("lulu-calzone.html"), "calzone-vistas")!;
    expect(p.variants).toHaveLength(1);
    expect(p.variants[0]).toMatchObject({ shape: "calzone", price: 11.99 });
    expect(p.tags).not.toContain("vegetarian");
  });
});
