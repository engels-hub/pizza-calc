import type { Pizza, Variant } from "./types";

/**
 * "I'm feeling lucky": `count` random pizzas from `candidates`, no repeats
 * until every candidate has been used once. Each gets the variant of the
 * wanted diameter, or the pizzeria's 30 cm when it does not make that size.
 */
export function luckyPicks(
  candidates: Pizza[],
  count: number,
  diameter: number,
  rand: () => number = Math.random,
): { pizza: Pizza; variant: Variant }[] {
  const usable = candidates.filter((p) => p.variants.some((v) => v.shape !== "heart"));
  if (usable.length === 0 || count <= 0) return [];

  const picks: { pizza: Pizza; variant: Variant }[] = [];
  let deck: Pizza[] = [];
  while (picks.length < count) {
    if (deck.length === 0) deck = shuffle(usable, rand);
    const pizza = deck.pop()!;
    const sized = (d: number) => pizza.variants.find((v) => v.shape !== "heart" && v.diameterCm === d);
    picks.push({ pizza, variant: sized(diameter) ?? sized(30) ?? pizza.variants[0] });
  }
  return picks;
}

function shuffle<T>(list: T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
