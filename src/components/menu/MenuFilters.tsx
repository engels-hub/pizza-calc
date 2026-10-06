"use client";

import { FireIcon, FunnelSimpleIcon, LeafIcon, MagnifyingGlassIcon, PlantIcon, SparkleIcon, XIcon } from "@phosphor-icons/react";
import { lv } from "@/content/lv";
import { ingredientLabel } from "@/lib/ingredients";
import { useStore } from "@/lib/store";
import { Chip } from "../ui/Chip";

const TAGS = [
  { id: "vegetarian", Icon: LeafIcon },
  { id: "vegan", Icon: PlantIcon },
  { id: "spicy", Icon: FireIcon },
  { id: "new", Icon: SparkleIcon },
] as const;

/** Sticky search and quick filter chips above the list. */
export function MenuFilters({ filtersOpen, onToggleFilters }: { filtersOpen: boolean; onToggleFilters: () => void }) {
  const query = useStore((s) => s.query);
  const setQuery = useStore((s) => s.setQuery);
  const ingredientFilters = useStore((s) => s.ingredientFilters);
  const cycleIngredient = useStore((s) => s.cycleIngredient);
  const tagFilters = useStore((s) => s.tagFilters);
  const toggleTag = useStore((s) => s.toggleTag);
  const active = Object.entries(ingredientFilters);

  return (
    <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 bg-bg/90 px-4 py-2 backdrop-blur-md md:mx-0 md:px-0">
      <div className="relative">
        <MagnifyingGlassIcon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <label htmlFor="search" className="sr-only">
          {lv.menu.searchLabel}
        </label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lv.menu.searchPlaceholder}
          className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-base outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        <Chip active={filtersOpen || active.length > 0} onClick={onToggleFilters} aria-expanded={filtersOpen}>
          <FunnelSimpleIcon size={16} />
          {lv.menu.ingredients}
          {active.length > 0 && <span className="tabular">{active.length}</span>}
        </Chip>
        {TAGS.map(({ id, Icon }) => (
          <Chip key={id} active={tagFilters.includes(id)} onClick={() => toggleTag(id)} aria-pressed={tagFilters.includes(id)}>
            <Icon size={16} />
            {lv.tags[id]}
          </Chip>
        ))}
        {active.map(([key, state]) => (
          <Chip
            key={key}
            active
            tone={state}
            onClick={() => cycleIngredient(key)}
            aria-label={lv.menu.removeFilter(ingredientLabel(key))}
          >
            {state === "exclude" && `${lv.menu.without} `}
            {ingredientLabel(key).toLowerCase()}
            <XIcon size={14} />
          </Chip>
        ))}
      </div>
    </div>
  );
}
