"use client";

import { lv } from "@/content/lv";
import { euro, variantLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PIZZERIA_IDS } from "@/lib/types";

/** The order as a plain list, per pizzeria, since each pizzeria is a separate order. */
export function OrderLines() {
  const cart = useStore((s) => s.cart);
  const groups = PIZZERIA_IDS.map((id) => {
    const lines = cart.filter((l) => l.pizzeriaId === id);
    return { id, lines, sum: lines.reduce((n, l) => n + l.qty * l.unitPrice, 0) };
  }).filter((g) => g.lines.length > 0);

  if (groups.length === 0) return null;
  return (
    <div className="mb-4 flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g.id}>
          <div className="mb-1.5 flex justify-between text-xs font-semibold text-muted">
            <span>{lv.pizzerias[g.id]}</span>
            <span className="tabular">{euro(g.sum)}</span>
          </div>
          <ul className="flex flex-col gap-1 text-sm">
            {g.lines.map((l) => (
              <li key={l.key} className="flex items-baseline gap-2">
                <span className="tabular w-7 shrink-0 text-muted">{l.qty}×</span>
                <span className="min-w-0 flex-1 truncate">
                  {l.name} <span className="text-muted">{variantLabel(l)}</span>
                </span>
                <span className="tabular">{euro(l.qty * l.unitPrice)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
