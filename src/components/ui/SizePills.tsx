"use client";

import { lv } from "@/content/lv";
import { variantLabel } from "@/lib/format";
import type { Variant } from "@/lib/types";
import { onRadioKeyDown } from "./radioKeys";

/** Compact size picker: "20", "30", "♥", "45". Hidden for one-size items. */
export function SizePills({
  variants,
  value,
  onChange,
  label,
}: {
  variants: Variant[];
  /** Selected variant id. */
  value: string;
  onChange: (v: Variant) => void;
  label: string;
}) {
  if (variants.length < 2) return null;
  const ids = variants.map((v) => v.id);
  const select = (id: string) => onChange(variants.find((v) => v.id === id)!);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={(e) => onRadioKeyDown(e, ids, value, select)}
      className="inline-flex rounded-full bg-sunken p-0.5"
    >
      {variants.map((v) => {
        const active = v.id === value;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={variantLabel(v)}
            tabIndex={active ? 0 : -1}
            onClick={() => select(v.id)}
            className={`tabular min-h-8 min-w-9 rounded-full px-2 text-xs font-medium transition-colors ${
              active ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
            }`}
          >
            {v.shape === "heart" ? lv.variants.heartShort : v.diameterCm}
          </button>
        );
      })}
    </div>
  );
}
