"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const open = { height: "auto", opacity: 1 };
const closed = { height: 0, opacity: 0 };
const transition = {
  height: { type: "spring", stiffness: 260, damping: 32 },
  opacity: { duration: 0.18 },
} as const;

/**
 * Expands and collapses its content, animating height so the content below
 * slides instead of jumping. Put padding on the children, not here, so the
 * closed state is truly zero high. Overflow is clipped only while animating,
 * so sticky children keep working once it is open.
 */
export function Collapse({ open: isOpen, id, children }: { open: boolean; id?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [animating, setAnimating] = useState(false);
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id={id}
          initial={closed}
          animate={open}
          exit={closed}
          transition={reduce ? { duration: 0 } : transition}
          onAnimationStart={() => setAnimating(true)}
          onAnimationComplete={() => setAnimating(false)}
          className={animating ? "overflow-hidden" : undefined}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
