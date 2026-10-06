"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";

export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const reduce = useReducedMotion();
  const text = useTransform(mv, format);

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { type: "spring", stiffness: 100, damping: 20 });
    return () => controls.stop();
  }, [mv, value, reduce]);

  return <motion.span className={`tabular ${className ?? ""}`}>{text}</motion.span>;
}
