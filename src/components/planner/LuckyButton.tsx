"use client";

import { DiceFiveIcon } from "@phosphor-icons/react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { lv } from "@/content/lv";
import { useRecommendation } from "@/hooks/useRecommendation";
import { piecesNeeded } from "@/lib/calc";
import { filterPizzas } from "@/lib/filter";
import { luckyPicks } from "@/lib/lucky";
import { easeOutExpo } from "@/lib/motion";
import { useStore } from "@/lib/store";
import type { Pizza } from "@/lib/types";

/**
 * Fills the cart with random Picu darbnīca pizzas for the group. Respects the
 * menu's active filters (e.g. only vegetarian) when anything matches them.
 */
export function LuckyButton({ pool }: { pool: Pizza[] }) {
  const { area, size } = useRecommendation();
  const query = useStore((s) => s.query);
  const ingredientFilters = useStore((s) => s.ingredientFilters);
  const tagFilters = useStore((s) => s.tagFilters);
  const fillCart = useStore((s) => s.fillCart);
  const dice = useAnimationControls();
  const reduce = useReducedMotion();

  // Picu darbnīca makes 20 and 30 cm; other sizes fall back to 30.
  const diameter = pool.some((p) => p.variants.some((v) => v.diameterCm === size)) ? size : 30;
  const count = piecesNeeded(area, diameter);

  const roll = () => {
    const filtered = filterPizzas(pool, { pizzeria: "all", query, ingredientFilters, tagFilters });
    fillCart(luckyPicks(filtered.length ? filtered : pool, count, diameter));
    if (!reduce)
      dice.start({
        rotate: [0, 360 + 90 * Math.floor(Math.random() * 4)],
        transition: { duration: 0.6, ease: easeOutExpo },
      });
    document.getElementById("cart-title")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={roll}
        aria-describedby="lucky-hint"
        className="bevel bevel-accent inline-flex min-h-12 items-center gap-2.5 px-5 text-base font-semibold"
      >
        <motion.span animate={dice} className="grid place-items-center">
          <DiceFiveIcon size={22} weight="fill" />
        </motion.span>
        {lv.lucky.button}
      </button>
      <p id="lucky-hint" className="text-sm text-muted">
        {lv.lucky.hint(count, diameter)}
      </p>
    </div>
  );
}
