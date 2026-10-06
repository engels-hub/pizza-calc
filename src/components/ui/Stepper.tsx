"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";

const btn =
  "grid size-11 place-items-center rounded-full bg-sunken text-ink transition-transform duration-150 active:scale-[0.94] disabled:opacity-35 hover:bg-line";

export function Stepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  label,
  children,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  children?: React.ReactNode;
  size?: "md" | "sm";
}) {
  const small = size === "sm";
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        className={`${btn} ${small ? "size-9" : ""}`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`${label}: mazāk`}
      >
        <MinusIcon size={small ? 14 : 18} weight="bold" />
      </button>
      {children}
      <button
        type="button"
        className={`${btn} ${small ? "size-9" : ""}`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`${label}: vairāk`}
      >
        <PlusIcon size={small ? 14 : 18} weight="bold" />
      </button>
    </div>
  );
}
