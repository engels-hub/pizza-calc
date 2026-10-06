"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { lv } from "@/content/lv";
import { filterPizzas, sortPizzas, type MenuSort } from "@/lib/filter";
import { fadeSlide } from "@/lib/motion";
import { useStore, type PizzeriaFilter } from "@/lib/store";
import { PIZZERIA_IDS, type Pizza } from "@/lib/types";
import { Segmented } from "../ui/Segmented";
import { IngredientPanel } from "./IngredientPanel";
import { MenuFilters } from "./MenuFilters";
import { PizzaRow } from "./PizzaRow";

const SORTS: MenuSort[] = ["menu", "price", "value"];

export function MenuBrowser({ pizzas }: { pizzas: Pizza[] }) {
  const pizzeria = useStore((s) => s.pizzeria);
  const setPizzeria = useStore((s) => s.setPizzeria);
  const query = useStore((s) => s.query);
  const ingredientFilters = useStore((s) => s.ingredientFilters);
  const tagFilters = useStore((s) => s.tagFilters);
  const clearFilters = useStore((s) => s.clearFilters);
  const size = useStore((s) => s.size);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<MenuSort>("menu");

  const visible = sortPizzas(filterPizzas(pizzas, { pizzeria, query, ingredientFilters, tagFilters }), sort, size);
  const filterCount = Object.keys(ingredientFilters).length + tagFilters.length + (query ? 1 : 0);
  const inScope = pizzeria === "all" ? pizzas : pizzas.filter((p) => p.pizzeriaId === pizzeria);

  return (
    <section aria-labelledby="menu-title" className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="menu-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
          {lv.menu.title}
        </h2>
        <Segmented<PizzeriaFilter>
          id="pizzeria"
          label={lv.menu.pizzeria}
          value={pizzeria}
          onChange={setPizzeria}
          options={[
            { value: "all", label: lv.menu.all },
            ...PIZZERIA_IDS.map((id) => ({ value: id, label: lv.pizzerias[id] })),
          ]}
        />
      </div>

      <MenuFilters filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen((o) => !o)} />

      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={fadeSlide}
          >
            <IngredientPanel pizzas={inScope} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 text-sm text-muted">
        <span aria-live="polite">
          {lv.menu.count(visible.length)}
          {filterCount > 0 && (
            <button type="button" onClick={clearFilters} className="ml-3 font-medium text-accent">
              {lv.menu.clearFilters}
            </button>
          )}
        </span>
        <label className="flex items-center gap-2">
          <span className="sr-only md:not-sr-only">{lv.menu.sort}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as MenuSort)}
            className="min-h-10 rounded-full border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-accent"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {lv.menu.sorts[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line p-6">
          <p className="font-medium">{lv.menu.emptyTitle}</p>
          <p className="text-sm text-muted">{lv.menu.emptyBody}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-10 rounded-full bg-ink px-4 text-sm font-medium text-bg transition-transform active:scale-[0.98]"
          >
            {lv.menu.clearFilters}
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((p) => (
              <PizzaRow key={p.id} pizza={p} size={size} showPizzeria={pizzeria === "all"} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
