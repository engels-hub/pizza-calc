"use client";

import { lv } from "@/content/lv";
import { euro } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PIZZERIA_IDS } from "@/lib/types";

/** Each pizzeria is a separate order, so show what goes to whom. */
export function PizzeriaSubtotals() {
  const cart = useStore((s) => s.cart);
  const rows = PIZZERIA_IDS.map((id) => {
    const lines = cart.filter((l) => l.pizzeriaId === id);
    return { id, count: lines.reduce((n, l) => n + l.qty, 0), sum: lines.reduce((n, l) => n + l.qty * l.unitPrice, 0) };
  }).filter((r) => r.count > 0);

  if (rows.length < 2) return null;
  return (
    <div className="mb-4 flex flex-col gap-1 text-sm">
      {rows.map((r) => (
        <div key={r.id} className="flex justify-between">
          <span>
            {lv.pizzerias[r.id]} <span className="text-muted">({r.count})</span>
          </span>
          <span className="tabular">{euro(r.sum)}</span>
        </div>
      ))}
    </div>
  );
}
