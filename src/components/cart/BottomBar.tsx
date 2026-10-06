"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { lv } from "@/content/lv";
import { easeOutExpo, spring } from "@/lib/motion";
import { useStore } from "@/lib/store";

/**
 * Below lg: a small pizza button that jumps to the summary. It hides while the
 * summary is already on screen, and nudges when a pizza lands in the cart.
 */
export function BottomBar() {
  const count = useStore((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const bump = useAnimationControls();
  const reduce = useReducedMotion();
  const prev = useRef(count);
  const [summaryVisible, setSummaryVisible] = useState(false);

  useEffect(() => {
    if (count > prev.current && !reduce) {
      bump.start({ scale: [1, 1.15, 1], transition: { duration: 0.35, ease: easeOutExpo } });
    }
    prev.current = count;
  }, [count, bump, reduce]);

  useEffect(() => {
    const summary = document.getElementById("summary");
    if (!summary) return;
    const io = new IntersectionObserver(([entry]) => setSummaryVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(summary);
    return () => io.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {!summaryVisible && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={spring}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 lg:hidden"
        >
          <motion.button
            animate={bump}
            type="button"
            data-fly-target
            aria-label={lv.bottomBar.toSummary}
            title={lv.bottomBar.toSummary}
            onClick={() => document.getElementById("summary")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })}
            className="pizza-dot grid size-14 place-items-center rounded-full shadow-soft"
          >
            <span className="grid size-7 place-items-center rounded-full bg-ink/80 text-bg">
              <CaretDownIcon size={16} weight="bold" />
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
