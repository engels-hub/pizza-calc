"use client";

import { piecesNeeded, targetArea } from "@/lib/calc";
import { useStore } from "@/lib/store";

/** How much pizza the group needs, in area and in pieces of the chosen size. */
export function useRecommendation() {
  const people = useStore((s) => s.people);
  const rules = useStore((s) => s.rules);
  const size = useStore((s) => s.size);
  const area = targetArea(people, rules);
  return { people, rules, size, area, count: piecesNeeded(area, size) };
}
