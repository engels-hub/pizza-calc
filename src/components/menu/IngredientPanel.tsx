"use client";

import { lv } from "@/content/lv";
import { ingredientOptions } from "@/lib/filter";
import { useStore } from "@/lib/store";
import type { Pizza } from "@/lib/types";
import { Chip } from "../ui/Chip";

/** Every ingredient, grouped; each chip cycles include → exclude → off. */
export function IngredientPanel({ pizzas }: { pizzas: Pizza[] }) {
  const filters = useStore((s) => s.ingredientFilters);
  const cycleIngredient = useStore((s) => s.cycleIngredient);

  return (
    <div className="rounded-2xl bg-sunken/70 p-4">
      <p className="mb-4 text-sm text-muted">{lv.menu.ingredientHelp}</p>
      <div className="flex flex-col gap-4">
        {ingredientOptions(pizzas).map(({ group, items }) => (
          <div key={group}>
            <p className="mb-2 text-xs font-semibold text-muted">{lv.ingredientGroups[group]}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((o) => (
                <Chip
                  key={o.key}
                  small
                  active={!!filters[o.key]}
                  tone={filters[o.key]}
                  onClick={() => cycleIngredient(o.key)}
                  aria-pressed={!!filters[o.key]}
                >
                  {filters[o.key] === "exclude" && `${lv.menu.without} `}
                  {o.label}
                  <span className={`tabular text-[0.7rem] ${filters[o.key] ? "" : "text-muted"}`}>{o.count}</span>
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
