"use client";

import { motion } from "motion/react";

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
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-sunken p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative min-h-9 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-surface shadow-soft"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
