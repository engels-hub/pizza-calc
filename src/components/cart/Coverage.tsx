"use client";

import { CheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { lv } from "@/content/lv";
import { useRecommendation } from "@/hooks/useRecommendation";
import { piecesNeeded, pizzaArea } from "@/lib/calc";
import { useStore } from "@/lib/store";

/** Does the cart feed the group? Compares cart area with the target area. */
export function Coverage() {
  const cart = useStore((s) => s.cart);
  const { people, size, area: need } = useRecommendation();
  if (cart.length === 0) return null;

  const have = cart.reduce((s, l) => s + pizzaArea(l.diameterCm) * l.qty, 0);
  const missing = need - have;
  const enough = missing <= pizzaArea(size) * 0.05;

  return (
    <motion.div
      layout="position"
      className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-sm ${enough ? "bg-surface/60" : "bg-accent-soft"}`}
    >
      {enough ? (
        <CheckIcon size={18} weight="bold" className="mt-px shrink-0 text-ink" />
      ) : (
        <WarningCircleIcon size={18} weight="bold" className="mt-px shrink-0 text-accent" />
      )}
      <span>
        {enough ? (
          <>
            {lv.coverage.enough(people)}
            {have > need * 1.25 && <span className="text-muted">{lv.coverage.leftovers}</span>}.
          </>
        ) : (
          <>
            {lv.coverage.missingBefore}
            <strong className="font-semibold">{lv.coverage.missing(piecesNeeded(missing, size), size)}</strong>.
          </>
        )}
      </span>
    </motion.div>
  );
}
