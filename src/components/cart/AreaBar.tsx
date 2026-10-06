"use client";

import { lv } from "@/content/lv";
import { useRecommendation } from "@/hooks/useRecommendation";
import { pizzaArea } from "@/lib/calc";
import { wholeNumber } from "@/lib/format";
import { useStore } from "@/lib/store";

const SEGMENTS = 20;

/**
 * PS1-style loading bar: how much pizza (cm²) is ordered against what the
 * group needs. Segments fill one after another when the cart changes.
 */
export function AreaBar() {
  const cart = useStore((s) => s.cart);
  const { area: need } = useRecommendation();
  const have = cart.reduce((sum, l) => sum + pizzaArea(l.diameterCm) * l.qty, 0);
  const ratio = need > 0 ? have / need : 0;
  const filled = Math.min(SEGMENTS, Math.round(ratio * SEGMENTS));
  const over = ratio > 1.005 ? Math.round((ratio - 1) * 100) : 0;
  const value = lv.cart.areaValue(wholeNumber(have), wholeNumber(need));

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
        <span id="area-label" className="font-medium text-muted">
          {lv.cart.area}
        </span>
        <span className="tabular font-medium">{value}</span>
      </div>
      <div
        role="progressbar"
        aria-labelledby="area-label"
        aria-valuemin={0}
        aria-valuemax={Math.round(need)}
        aria-valuenow={Math.round(Math.min(have, need))}
        aria-valuetext={over ? `${value}, ${lv.cart.areaOver(over)}` : value}
        className="bevel bevel-in grid gap-[3px] p-1.5"
        style={{ gridTemplateColumns: `repeat(${SEGMENTS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={`h-3 rounded-[2px] transition-colors duration-150 motion-reduce:transition-none ${
              i < filled ? "bg-accent" : "bg-line"
            }`}
            style={{ transitionDelay: `${i * 18}ms` }}
          />
        ))}
      </div>
      {over > 0 && <p className="mt-1.5 text-xs text-muted">{lv.cart.areaOver(over)}</p>}
    </div>
  );
}
