"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { lv } from "@/content/lv";
import { easeOutExpo, spring } from "@/lib/motion";
import { useStore } from "@/lib/store";

/**
 * A small pizza button that jumps to the cart total. It hides while
 * the total is on screen (or the cart is empty), points towards the total,
 * and nudges when a pizza lands in the cart.
 */
export function BottomBar() {
  const count = useStore((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const bump = useAnimationControls();
  const reduce = useReducedMotion();
  const prev = useRef(count);
  const [totals, setTotals] = useState<"visible" | "above" | "below">("below");

  useEffect(() => {
    if (count > prev.current && !reduce) {
      bump.start({ scale: [1, 1.15, 1], transition: { duration: 0.35, ease: easeOutExpo } });
    }
    prev.current = count;
  }, [count, bump, reduce]);

  // Where the total is relative to the screen. Derived from the scroll position
  // (not an IntersectionObserver, which misses jumps straight past the total,
  // e.g. a reload that restores a scrolled position).
  const hasTotals = count > 0;
  const { scrollY } = useScroll();
  const locate = () => {
    const el = document.getElementById("totals");
    if (!el) return;
    const r = el.getBoundingClientRect();
    const h = window.innerHeight;
    const next = r.bottom < h * 0.15 ? "above" : r.top > h * 0.85 ? "below" : "visible";
    setTotals((prev) => (prev === next ? prev : next));
  };
  useMotionValueEvent(scrollY, "change", locate);
  useEffect(() => {
    if (hasTotals) requestAnimationFrame(locate);
  }, [hasTotals, count]);

  return (
    <AnimatePresence>
      {hasTotals && totals !== "visible" && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={spring}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 lg:bottom-6 lg:right-6"
        >
          <motion.button
            animate={bump}
            type="button"
            data-fly-target
            aria-label={lv.bottomBar.toSummary}
            title={lv.bottomBar.toSummary}
            onClick={() =>
              document
                .getElementById("totals")
                ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" })
            }
            className="pizza-dot grid size-14 place-items-center rounded-full shadow-soft"
          >
            <motion.span
              animate={{ rotate: totals === "above" ? 180 : 0 }}
              transition={spring}
              className="grid size-7 place-items-center rounded-full bg-ink/80 text-bg"
            >
              <CaretDownIcon size={16} weight="bold" />
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
