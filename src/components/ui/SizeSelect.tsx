"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { lv } from "@/content/lv";
import { euro, variantLabel } from "@/lib/format";
import type { Variant } from "@/lib/types";

/**
 * Compact size dropdown ("30 cm ▾"). A native select, so phones open their
 * own picker and every option is spelled out with its price. One-size items
 * just show their label.
 */
export function SizeSelect({
  variants,
  value,
  onChange,
  label,
  withPrices = false,
}: {
  variants: Variant[];
  /** Selected variant id. */
  value: string;
  onChange: (v: Variant) => void;
  label: string;
  /** Add each size's price to its option, where the price is not shown nearby. */
  withPrices?: boolean;
}) {
  const id = useId();
  const current = variants.find((v) => v.id === value) ?? variants[0];
  if (variants.length < 2) return <span className="text-xs text-muted">{variantLabel(current)}</span>;

  return (
    <span className="relative inline-flex">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={current.id}
        onChange={(e) => onChange(variants.find((v) => v.id === e.target.value)!)}
        className="h-9 cursor-pointer appearance-none rounded-full border border-line bg-surface pl-3 pr-8 text-xs font-medium text-ink outline-none transition-colors hover:border-muted/40 focus:border-accent"
      >
        {variants.map((v) => (
          <option key={v.id} value={v.id}>
            {withPrices ? lv.variants.option(variantLabel(v), euro(v.price)) : variantLabel(v)}
          </option>
        ))}
      </select>
      <CaretDownIcon
        size={12}
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </span>
  );
}
