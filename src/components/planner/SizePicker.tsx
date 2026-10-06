"use client";

import { lv } from "@/content/lv";
import { useRecommendation } from "@/hooks/useRecommendation";
import { exactPieces, piecesNeeded } from "@/lib/calc";
import type { SizeOption } from "@/lib/filter";
import { oneDecimal, twoDecimals } from "@/lib/format";
import { useStore } from "@/lib/store";
import { onRadioKeyDown } from "../ui/radioKeys";

export function SizePicker({ sizes }: { sizes: SizeOption[] }) {
  const { area, size: selected } = useRecommendation();
  const setSize = useStore((s) => s.setSize);
  const max = Math.max(...sizes.map((s) => s.diameter));

  return (
    <div className="flex h-full flex-col gap-2">
      <p className="text-sm font-medium text-muted">{lv.planner.size}</p>
      <div
        className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4"
        role="radiogroup"
        aria-label={lv.planner.size}
        onKeyDown={(e) =>
          onRadioKeyDown(
            e,
            sizes.map((s) => s.diameter),
            selected,
            setSize,
          )
        }
      >
        {sizes.map((s) => {
          const exact = exactPieces(area, s.diameter);
          const dot = 14 + (s.diameter / max) * 30;
          const active = s.diameter === selected;
          return (
            <button
              key={s.diameter}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setSize(s.diameter)}
              className={`bevel flex min-w-0 items-center gap-3 p-3 text-left ${active ? "!bg-accent-soft" : ""}`}
            >
              <span className="grid size-11 shrink-0 place-items-center">
                <span className="pizza-dot rounded-full" style={{ width: dot, height: dot }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{lv.variants.cm(s.diameter)}</span>
                  <span className="font-pixel text-2xl leading-none">{piecesNeeded(area, s.diameter)}×</span>
                </span>
                <span className="mt-1 block truncate text-xs text-muted">
                  {s.pizzerias.map((p) => lv.pizzeriasShort[p]).join(", ")}
                  {Math.abs(exact - Math.round(exact)) > 0.05 && `, ${lv.planner.exact(oneDecimal(exact))}`}
                </span>
                <span className="block truncate text-xs text-muted" title={lv.planner.pricePerAreaHint}>
                  {lv.planner.pricePerArea(twoDecimals(s.bestPer100))}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
