import * as cheerio from "cheerio";
import { canonicalizeAll, deriveTags } from "../ingredients";
import type { Pizza, PizzaTag, Variant } from "../types";
import { fetchHtml, parsePrice, slugify } from "./http";

export const DARBNICA_URL = "https://www.picudarbnica.lv/picas/";

/** Picu darbnīca: one static WordPress page lists every pizza. */
export function parseDarbnica(html: string): Pizza[] {
  const $ = cheerio.load(html);
  const pizzas: Pizza[] = [];

  $(".product").each((_, el) => {
    const $el = $(el);
    const title = $el.find("h3").first().text().trim();
    const name = title.replace(/^\d+\.\s*/, "").replace(/\s*[–—]\s*/g, " - ").trim();
    if (!name) return;

    const variants: Variant[] = [];
    $el.find(".kom").each((_, k) => {
      const cm = /(\d+)\s*cm/i.exec($(k).text());
      if (!cm) return;
      const price = parsePrice($(k).siblings(".price").first().text());
      variants.push({
        id: `${cm[1]}`,
        diameterCm: Number(cm[1]),
        shape: /calzone|pārlocīt/i.test(name) ? "calzone" : "round",
        price,
      });
    });
    // "28. Papildus" (extras) and other non-pizza rows have no cm sizes.
    if (variants.length === 0) return;

    const titleIdx = $el.find(".right p.title").filter((_, p) => /Sastāvdaļas/i.test($(p).text())).first();
    const rawText = titleIdx.next("p").text();
    const rawIngredients = rawText
      .split(",")
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const badge = $el.find(".left span").text().toLowerCase();
    const ingredients = canonicalizeAll(rawIngredients);
    const tags: PizzaTag[] = deriveTags(name, ingredients);
    if (badge.includes("jaunums")) tags.push("new");
    if (badge.includes("top")) tags.push("top");

    const image = $el.find("a.zoom").attr("href") ?? $el.find("img").attr("src");

    pizzas.push({
      id: `darbnica-${slugify(name)}`,
      pizzeriaId: "darbnīca",
      name: prettyCase(name),
      url: DARBNICA_URL,
      imageUrl: image,
      rawIngredients,
      ingredients,
      tags,
      variants: variants.sort((a, b) => a.diameterCm - b.diameterCm),
    });
  });

  return dedupe(pizzas);
}

/** "VASARAS" -> "Vasaras", leave mixed case names alone. */
function prettyCase(s: string): string {
  return s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s;
}

function dedupe(list: Pizza[]): Pizza[] {
  const seen = new Set<string>();
  return list.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}

export async function scrapeDarbnica(): Promise<Pizza[]> {
  return parseDarbnica(await fetchHtml(DARBNICA_URL));
}
