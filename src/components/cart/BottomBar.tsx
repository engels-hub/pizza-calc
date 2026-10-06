"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { lv } from "@/content/lv";
import { useTotals } from "@/hooks/useTotals";
import { euro } from "@/lib/format";
import { easeOutExpo } from "@/lib/motion";
import { useStore } from "@/lib/store";
import { AnimatedNumber } from "../ui/AnimatedNumber";

/** Below lg: a pinned total that jumps to the summary at the bottom. */
export function BottomBar() {
  const totals = useTotals();
  const count = useStore((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const bump = useAnimationControls();
  const reduce = useReducedMotion();
  const prev = useRef(count);

  useEffect(() => {
    if (count > prev.current && !reduce) {
      bump.start({ scale: [1, 1.04, 1], transition: { duration: 0.35, ease: easeOutExpo } });
    }
    prev.current = count;
  }, [count, bump, reduce]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <motion.button
        animate={bump}
        type="button"
        data-fly-target
        onClick={() => document.getElementById("summary")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })}
        className="flex min-h-14 w-full items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-3 text-bg shadow-soft"
      >
        <span className="text-left">
          <span className="block text-xs opacity-70">{lv.bottomBar.order}</span>
          <span className="block text-sm font-medium">{count === 0 ? lv.bottomBar.empty : lv.plural.pizzas(count)}</span>
        </span>
        <span className="ml-auto flex items-baseline gap-2">
          {totals.saved > 0 && <span className="tabular text-xs line-through opacity-60">{euro(totals.subtotal)}</span>}
          <AnimatedNumber value={totals.total} format={euro} className="font-pixel text-xl leading-none" />
        </span>
        <span className="grid size-9 place-items-center rounded-full bg-bg/15">
          <CaretDownIcon size={16} weight="bold" />
        </span>
      </motion.button>
    </div>
  );
}
