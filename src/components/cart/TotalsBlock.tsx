"use client";

import { AnimatePresence, motion } from "motion/react";
import { lv } from "@/content/lv";
import { useTotals } from "@/hooks/useTotals";
import type { AppliedDiscount, CustomDiscount } from "@/lib/discounts";
import { euro } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PIZZERIA_IDS } from "@/lib/types";
import { AnimatedNumber } from "../ui/AnimatedNumber";

function discountTitle(d: AppliedDiscount, custom: CustomDiscount): string {
  if (d.id !== "custom") return lv.promos[d.id]?.title ?? d.id;
  return custom?.kind === "percent" ? lv.summary.customTitle(custom.value) : lv.summary.customTitleFixed;
}

export function TotalsBlock() {
  const totals = useTotals();
  const people = useStore((s) => s.people);
  const custom = useStore((s) => s.custom);
  const cart = useStore((s) => s.cart);
  const hasDiscount = totals.saved > 0;
  // Each pizzeria is a separate order, so show what goes to whom.
  const perPizzeria = PIZZERIA_IDS.map((id) => ({
    id,
    sum: cart.filter((l) => l.pizzeriaId === id).reduce((n, l) => n + l.qty * l.unitPrice, 0),
  })).filter((r) => r.sum > 0);

  return (
    <div className="flex flex-col gap-1.5">
      {perPizzeria.length > 1 &&
        perPizzeria.map((r) => (
          <div key={r.id} className="flex justify-between text-sm text-muted">
            <span>{lv.pizzerias[r.id]}</span>
            <span className="tabular">{euro(r.sum)}</span>
          </div>
        ))}
      <div className="flex justify-between text-sm text-muted">
        <span>{lv.summary.subtotal}</span>
        <span className={`tabular ${hasDiscount ? "line-through decoration-1" : ""}`}>{euro(totals.subtotal)}</span>
      </div>
      <AnimatePresence initial={false}>
        {totals.discounts.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-between text-sm"
          >
            <span className="truncate pr-3">{discountTitle(d, custom)}</span>
            <span className="tabular text-accent">−{euro(d.amount)}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-sm font-medium">{lv.summary.total}</span>
        <AnimatedNumber value={totals.total} format={euro} className="font-pixel text-4xl leading-none" />
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>
          {lv.summary.perPerson(lv.plural.pizzas(totals.pizzaCount), euro(totals.pizzaCount ? totals.total / people : 0))}
        </span>
        {hasDiscount && <span className="font-medium text-ink">{lv.summary.saved(euro(totals.saved))}</span>}
      </div>
    </div>
  );
}
