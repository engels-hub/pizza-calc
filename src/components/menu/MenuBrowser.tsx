"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { lv } from "@/content/lv";
import { filterPizzas, soldInSize, sortPizzas, type MenuSort } from "@/lib/filter";
import { spring } from "@/lib/motion";
import { useStore, type PizzeriaFilter } from "@/lib/store";
import { PIZZERIA_IDS, type Pizza } from "@/lib/types";
import { Collapse } from "../ui/Collapse";
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
  const [listOpen, setListOpen] = useState(true);
  const [sort, setSort] = useState<MenuSort>("menu");

  const visible = sortPizzas(filterPizzas(pizzas, { pizzeria, size, query, ingredientFilters, tagFilters }), sort, size);
  const filterCount = Object.keys(ingredientFilters).length + Object.keys(tagFilters).length + (query ? 1 : 0);
  const inScope = pizzas.filter((p) => (pizzeria === "all" || p.pizzeriaId === pizzeria) && soldInSize(p, size));

  return (
    <section aria-labelledby="menu-title" className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="menu-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
          <button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            aria-expanded={listOpen}
            aria-controls="menu-list"
            title={listOpen ? lv.menu.collapse : lv.menu.expand}
            className="group flex min-h-11 items-center gap-2 text-left"
          >
            {lv.menu.title}
            <motion.span
              animate={{ rotate: listOpen ? 0 : -90 }}
              transition={spring}
              className="grid size-8 place-items-center rounded-full text-muted transition-colors group-hover:bg-sunken group-hover:text-ink"
              aria-hidden
            >
              <CaretDownIcon size={18} weight="bold" />
            </motion.span>
          </button>
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

      <Collapse open={listOpen} id="menu-list">
        <div className="flex flex-col gap-4">
          <MenuFilters filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen((o) => !o)} />

          <Collapse open={filtersOpen} id="ingredient-panel">
            <IngredientPanel pizzas={inScope} />
          </Collapse>

          <div className="flex items-center justify-between gap-3 text-sm text-muted">
            <span className="flex items-center gap-3">
              <span aria-live="polite">{lv.menu.count(visible.length)}</span>
              {filterCount > 0 && (
                <button type="button" onClick={clearFilters} className="min-h-10 font-medium text-accent">
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
              {inScope.length === 0 && pizzeria !== "all" ? (
                <>
                  <p className="font-medium">{lv.menu.noSize(lv.pizzerias[pizzeria], size)}</p>
                  <p className="text-sm text-muted">{lv.menu.noSizeBody}</p>
                  <button
                    type="button"
                    onClick={() => setPizzeria("all")}
                    className="min-h-10 rounded-full bg-ink px-4 text-sm font-medium text-bg transition-transform active:scale-[0.98]"
                  >
                    {lv.menu.all}
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium">{lv.menu.emptyTitle}</p>
                  <p className="text-sm text-muted">{lv.menu.emptyBody}</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-10 rounded-full bg-ink px-4 text-sm font-medium text-bg transition-transform active:scale-[0.98]"
                  >
                    {lv.menu.clearFilters}
                  </button>
                </>
              )}
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
        </div>
      </Collapse>
    </section>
  );
}
