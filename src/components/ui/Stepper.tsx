"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { lv } from "@/content/lv";

const looks = {
  soft: "rounded-full bg-sunken transition-transform duration-150 active:scale-[0.94] hover:bg-line",
  bevel: "bevel",
};

export function Stepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  label,
  children,
  size = "md",
  look = "soft",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  children?: React.ReactNode;
  size?: "md" | "sm";
  look?: keyof typeof looks;
}) {
  const small = size === "sm";
  const btn = `grid size-11 place-items-center text-ink disabled:opacity-35 ${looks[look]}`;
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        className={`${btn} ${small ? "size-9" : ""}`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={lv.planner.less(label)}
      >
        <MinusIcon size={small ? 14 : 18} weight="bold" />
      </button>
      {children}
      <button
        type="button"
        className={`${btn} ${small ? "size-9" : ""}`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={lv.planner.more(label)}
      >
        <PlusIcon size={small ? 14 : 18} weight="bold" />
      </button>
    </div>
  );
}
