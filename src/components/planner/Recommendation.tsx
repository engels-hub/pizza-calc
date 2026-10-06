"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { lv } from "@/content/lv";
import { useRecommendation } from "@/hooks/useRecommendation";
import { spring } from "@/lib/motion";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { Dither } from "../ui/Dither";

const formatCount = (n: number) => String(Math.round(n));

export function Recommendation() {
  const { count, size } = useRecommendation();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-muted">{lv.planner.youNeed}</p>
      {/* Announce the settled result once; the animated digits below are visual only. */}
      <p className="sr-only" aria-live="polite">
        {lv.plural.pizzas(count)} × {lv.variants.cm(size)}
      </p>
      <div
        className="bevel bevel-in relative flex flex-1 flex-col justify-between gap-2 overflow-hidden px-4 py-3"
        aria-hidden
      >
        <Dither
          className="absolute inset-0"
          shape="linear"
          bands={6}
          from="var(--surface)"
          to="color-mix(in oklch, var(--accent) 22%, var(--surface))"
        />
        <p className="relative whitespace-nowrap font-pixel text-5xl leading-none">
          <AnimatedNumber value={count} format={formatCount} />
          <span className="text-xl text-muted"> × {lv.variants.cm(size)}</span>
        </p>
        <PizzaDots count={count} size={size} />
      </div>
    </div>
  );
}

/** Pizzas drawn to scale; they pop in and out as the count changes. */
function PizzaDots({ count, size }: { count: number; size: number }) {
  const reduce = useReducedMotion();
  const shown = Math.min(count, 10);
  const px = Math.round(8 + (size / 45) * 14);
  return (
    <div className="relative flex min-h-6 items-center gap-1" aria-hidden>
      <AnimatePresence initial={false} mode="popLayout">
        {Array.from({ length: shown }, (_, i) => (
          <motion.span
            key={`${size}-${i}`}
            layout
            initial={reduce ? false : { scale: 0, opacity: 0, rotate: -40 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ ...spring, delay: reduce ? 0 : Math.min(i, 10) * 0.025 }}
            className="pizza-dot rounded-full"
            style={{ width: px, height: px }}
          />
        ))}
      </AnimatePresence>
      {count > shown && <span className="ml-1 text-sm text-muted">+{count - shown}</span>}
    </div>
  );
}
