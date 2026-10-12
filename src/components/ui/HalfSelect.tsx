"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { lv } from "@/content/lv";
import { euro } from "@/lib/format";
import type { Pizza } from "@/lib/types";

/** Second half of a Pus-Pus pizza, in the same native-select style as SizeSelect. */
export function HalfSelect({
  partners,
  value,
  onChange,
  label,
}: {
  partners: Pizza[];
  /** Selected pizza id, or null before one is picked. */
  value: string | null;
  onChange: (p: Pizza) => void;
  label: string;
}) {
  const id = useId();
  return (
    <span className="relative inline-flex min-w-0 max-w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => {
          const p = partners.find((x) => x.id === e.target.value);
          if (p) onChange(p);
        }}
        className={`h-9 min-w-0 max-w-full cursor-pointer appearance-none truncate rounded-full border bg-surface pl-3 pr-8 text-xs font-medium outline-none transition-colors hover:border-muted/40 focus:border-accent ${
          value ? "border-line text-ink" : "border-accent text-accent"
        }`}
      >
        {!value && (
          <option value="" disabled>
            {lv.halves.choose}
          </option>
        )}
        {partners.map((p) => (
          <option key={p.id} value={p.id}>
            {lv.halves.option(p.name, euro(p.halfPrice ?? 0))}
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
