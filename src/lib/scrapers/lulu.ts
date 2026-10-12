import * as cheerio from "cheerio";
import { canonicalizeAll, deriveTags } from "../ingredients";
import type { Pizza, Variant } from "../types";
import { fetchHtml, mapLimit, parsePrice } from "./http";

export const LULU_ORIGIN = "https://www.lulu.lv";
export const LULU_LIST_URL = `${LULU_ORIGIN}/picas`;
export const LULU_HALVES_URL = `${LULU_ORIGIN}/pus-pus-pica`;

// Not real pizzas: builders and half/half pickers.
const SKIP_SLUGS = /pus-pus|buve|konstruktor/;

/** Product slugs from the /picas listing page. */
export function parseLuluList(html: string): string[] {
  const $ = cheerio.load(html);
  const slugs = new Set<string>();
  $('a[href^="/picas/"]').each((_, a) => {
    const slug = $(a).attr("href")!.replace(/^\/picas\//, "").split(/[?#]/)[0];
    if (slug && !SKIP_SLUGS.test(slug)) slugs.add(slug);
  });
  return [...slugs];
}

/** Same spelling for a name from a product page and from the Pus-Pus picker. */
const normName = (name: string) =>
  name.replace(/\s+/g, " ").replace(/\s*[–—-]\s*/g, " - ").trim().toLocaleLowerCase("lv");

/**
 * Half prices from the Pus-Pus page, keyed by normalised pizza name. Both
 * pickers list the same pizzas; options read "Desu pica - 11.49 €".
 */
export function parseLuluHalves(html: string): Map<string, number> {
  const $ = cheerio.load(html);
  const halves = new Map<string, number>();
  $('select[name="pizza_left"] option').each((_, o) => {
    const m = /^(.*?)\s+-\s+([\d.,]+)\s*€\s*$/.exec($(o).text().replace(/\s+/g, " ").trim());
    if (m) halves.set(normName(m[1]), parsePrice(m[2]));
  });
  return halves;
}

/** Attach half prices to the pizzas that can be a Pus-Pus half. */
export function withHalfPrices(pizzas: Pizza[], halves: Map<string, number>): Pizza[] {
  return pizzas.map((p) => {
    const half = halves.get(normName(p.name));
    return half ? { ...p, halfPrice: half } : p;
  });
}

/** One LuLū product page. Sizes live in `input[data-size-master]`. */
export function parseLuluProduct(html: string, slug: string): Pizza | null {
  const $ = cheerio.load(html);
  const name = $("h1").first().text().replace(/\s+/g, " ").replace(/\s*[–—]\s*/g, " - ").trim();
  if (!name) return null;

  const variants: Variant[] = [];
  $("input[data-size-master]").each((_, input) => {
    const $in = $(input);
    const price = parsePrice($in.attr("data-price") ?? "");
    const label = $in.closest("label").find(".form-text").text().trim() || $in.attr("data-text-summary-title") || "";
    const heart = $in.attr("data-heart") === "1";
    const cm = /(\d+)\s*cm/i.exec(label) ?? /(\d+)\s*cm/i.exec($in.attr("data-text-summary-title") ?? "");
    const isCalzone = !cm && !heart;
    variants.push({
      id: heart ? "heart" : cm ? cm[1] : "one",
      diameterCm: heart ? 30 : cm ? Number(cm[1]) : 30,
      shape: heart ? "heart" : isCalzone ? "calzone" : "round",
      price,
    });
  });
  if (variants.length === 0) return null;

  const rawIngredients: string[] = [];
  $(".features")
    .first()
    .find(".feature > div")
    .each((_, d) => {
      const t = $(d).text().replace(/\s+/g, " ").trim();
      if (t) rawIngredients.push(t);
    });

  const img = $(".product-images .carousel-item img").first().attr("src") ?? $('meta[property="og:image"]').attr("content");
  const ingredients = canonicalizeAll(rawIngredients);

  const order = (v: Variant) => v.diameterCm + (v.shape === "heart" ? 0.5 : 0);
  return {
    id: `lulu-${slug}`,
    pizzeriaId: "lulu",
    name,
    url: `${LULU_ORIGIN}/picas/${slug}`,
    imageUrl: img ? new URL(img, LULU_ORIGIN).toString() : undefined,
    rawIngredients: rawIngredients.filter((r) => !/ilustratīv/i.test(r)),
    ingredients,
    tags: deriveTags(name, ingredients),
    variants: variants.sort((a, b) => order(a) - order(b)),
  };
}

export async function scrapeLulu(): Promise<Pizza[]> {
  const slugs = parseLuluList(await fetchHtml(LULU_LIST_URL));
  if (slugs.length === 0) throw new Error("LuLū: no product links found");
  const pages = await mapLimit(slugs, 6, async (slug) => {
    try {
      return parseLuluProduct(await fetchHtml(`${LULU_ORIGIN}/picas/${slug}`), slug);
    } catch {
      return null;
    }
  });
  const pizzas = pages.filter((p): p is Pizza => p !== null);
  // Pus-Pus is a bonus: if its page breaks, the menu still loads without halves.
  try {
    return withHalfPrices(pizzas, parseLuluHalves(await fetchHtml(LULU_HALVES_URL)));
  } catch {
    return pizzas;
  }
}
