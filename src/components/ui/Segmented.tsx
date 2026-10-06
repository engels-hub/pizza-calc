"use client";

import { motion, useReducedMotion } from "motion/react";
import { snappy } from "@/lib/motion";
import { onRadioKeyDown } from "./radioKeys";

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  id,
  label,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  /** Unique per instance, used for the sliding highlight. */
  id: string;
  label: string;
}) {
  const reduce = useReducedMotion();
  const values = options.map((o) => o.value);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={(e) => onRadioKeyDown(e, values, value, onChange)}
      className="no-scrollbar inline-flex max-w-full overflow-x-auto rounded-full bg-sunken p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active || !values.includes(value) ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={`relative min-h-9 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-surface shadow-soft"
                transition={reduce ? { duration: 0 } : snappy}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
