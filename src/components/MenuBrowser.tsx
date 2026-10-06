"use client";

import {
  FireIcon,
  FunnelSimpleIcon,
  LeafIcon,
  MagnifyingGlassIcon,
  PlantIcon,
  PlusIcon,
  SparkleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { pizzaArea } from "@/lib/calc";
import { filterPizzas, ingredientOptions, preferredVariant, toppingLine } from "@/lib/filter";
import { euro, twoDecimals } from "@/lib/format";
import { GROUP_LABELS, ingredientDef } from "@/lib/ingredients";
import { useStore, type PizzeriaFilter } from "@/lib/store";
import { PIZZERIAS, type Pizza, type Variant } from "@/lib/types";
import { flyToTicket } from "./FlyLayer";
import { Segmented } from "./ui/Segmented";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

const TAGS = [
  { id: "vegetarian", label: "Veģetārās", icon: LeafIcon },
  { id: "vegan", label: "Vegānās", icon: PlantIcon },
  { id: "spicy", label: "Asās", icon: FireIcon },
  { id: "new", label: "Jaunumi", icon: SparkleIcon },
] as const;

type Sort = "menu" | "price" | "value";

export function MenuBrowser({ pizzas }: { pizzas: Pizza[] }) {
  const pizzeria = useStore((s) => s.pizzeria);
  const setPizzeria = useStore((s) => s.setPizzeria);
  const query = useStore((s) => s.query);
  const setQuery = useStore((s) => s.setQuery);
  const ingredientFilters = useStore((s) => s.ingredientFilters);
  const tagFilters = useStore((s) => s.tagFilters);
  const toggleTag = useStore((s) => s.toggleTag);
  const cycleIngredient = useStore((s) => s.cycleIngredient);
  const clearFilters = useStore((s) => s.clearFilters);
  const size = useStore((s) => s.size);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<Sort>("menu");

  const visible = useMemo(() => {
    const list = filterPizzas(pizzas, { pizzeria, query, ingredientFilters, tagFilters });
    if (sort === "menu") return list;
    const key = (p: Pizza) => {
      const v = preferredVariant(p, size);
      return sort === "price" ? v.price : v.price / pizzaArea(v.diameterCm);
    };
    return [...list].sort((a, b) => key(a) - key(b));
  }, [pizzas, pizzeria, query, ingredientFilters, tagFilters, sort, size]);

  const options = useMemo(
    () => ingredientOptions(pizzeria === "all" ? pizzas : pizzas.filter((p) => p.pizzeriaId === pizzeria)),
    [pizzas, pizzeria],
  );
  const activeIngredients = Object.entries(ingredientFilters);
  const filterCount = activeIngredients.length + tagFilters.length + (query ? 1 : 0);

  return (
    <section aria-labelledby="menu-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="menu-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
          Izvēlies picas
        </h2>
        <Segmented<PizzeriaFilter>
          id="pizzeria"
          label="Picērija"
          value={pizzeria}
          onChange={setPizzeria}
          options={[
            { value: "all", label: "Abas" },
            { value: "picu", label: "Picu darbnīca" },
            { value: "lulu", label: "LuLū" },
          ]}
        />
      </div>

      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 bg-bg/90 px-4 py-2 backdrop-blur-md md:mx-0 md:px-0">
        <div className="relative">
          <MagnifyingGlassIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <label htmlFor="search" className="sr-only">
            Meklēt picu vai sastāvdaļu
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Meklēt, piem. bekons"
            className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-base outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          <Chip active={filtersOpen || activeIngredients.length > 0} onClick={() => setFiltersOpen((o) => !o)}>
            <FunnelSimpleIcon size={16} />
            Sastāvdaļas{activeIngredients.length > 0 && <span className="font-mono">{activeIngredients.length}</span>}
          </Chip>
          {TAGS.map((t) => (
            <Chip key={t.id} active={tagFilters.includes(t.id)} onClick={() => toggleTag(t.id)}>
              <t.icon size={16} />
              {t.label}
            </Chip>
          ))}
          {activeIngredients.map(([key, state]) => (
            <Chip key={key} active tone={state} onClick={() => cycleIngredient(key)} aria-label={`Noņemt ${ingredientDef(key).label}`}>
              {state === "exclude" ? "bez " : ""}
              {ingredientDef(key).label.toLowerCase()}
              <XIcon size={14} />
            </Chip>
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-sunken/70 p-4"
          >
            <p className="mb-4 text-sm text-muted">
              Pieskaries vienreiz, lai pica to saturētu. Otrreiz, lai izslēgtu. Trešo reizi, lai noņemtu.
            </p>
            <div className="flex flex-col gap-4">
              {options.map(({ group, items }) => (
                <div key={group}>
                  <p className="mb-2 text-xs font-semibold text-muted">{GROUP_LABELS[group]}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((o) => (
                      <Chip
                        key={o.key}
                        small
                        active={!!ingredientFilters[o.key]}
                        tone={ingredientFilters[o.key]}
                        onClick={() => cycleIngredient(o.key)}
                        aria-pressed={!!ingredientFilters[o.key]}
                      >
                        {ingredientFilters[o.key] === "exclude" && "bez "}
                        {o.label}
                        <span className="font-mono text-[0.7rem] opacity-60">{o.count}</span>
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 text-sm text-muted">
        <span aria-live="polite">
          <span className="font-mono text-ink">{visible.length}</span> picas
          {filterCount > 0 && (
            <button type="button" onClick={clearFilters} className="ml-3 font-medium text-accent">
              Notīrīt filtrus
            </button>
          )}
        </span>
        <label className="flex items-center gap-2">
          <span className="sr-only md:not-sr-only">Kārtot</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="min-h-10 rounded-full border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="menu">Kā ēdienkartē</option>
            <option value="price">Lētākās</option>
            <option value="value">Izdevīgākās par cm²</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line p-6">
          <p className="font-medium">Nav picu ar šīm sastāvdaļām.</p>
          <p className="text-sm text-muted">Pamēģini noņemt kādu filtru vai izvēlēties abas picērijas.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-10 rounded-full bg-ink px-4 text-sm font-medium text-bg transition-transform active:scale-[0.98]"
          >
            Notīrīt filtrus
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

function Chip({
  active,
  tone,
  small,
  children,
  ...rest
}: {
  active?: boolean;
  tone?: "include" | "exclude";
  small?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const look = !active
    ? "border-line bg-surface text-ink hover:border-muted/40"
    : tone === "exclude"
      ? "border-ink/70 bg-surface text-ink line-through decoration-1"
      : "border-accent bg-accent text-accent-ink";
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-[transform,background-color,border-color,color] duration-150 active:scale-[0.97] ${
        small ? "min-h-9 px-3 text-[0.8rem]" : "min-h-10 px-3.5 text-sm"
      } ${look}`}
    >
      {children}
    </button>
  );
}

function PizzaRow({ pizza, size, showPizzeria }: { pizza: Pizza; size: number; showPizzeria: boolean }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const addToCart = useStore((s) => s.addToCart);
  const showPizza = useStore((s) => s.showPizza);
  const isShown = useStore((s) => s.showcaseId === pizza.id);
  const v = preferredVariant(pizza, size);

  const add = (variant: Variant, e: React.MouseEvent) => {
    addToCart({
      key: `${pizza.id}:${variant.id}`,
      pizzaId: pizza.id,
      pizzeriaId: pizza.pizzeriaId,
      name: pizza.name,
      variantLabel: variant.label,
      diameterCm: variant.diameterCm,
      unitPrice: variant.price,
    });
    flyToTicket(e.currentTarget.getBoundingClientRect(), pizza.imageUrl);
  };

  return (
    <motion.li
      layout={reduce ? false : "position"}
      initial={reduce ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
      transition={spring}
      className={`rounded-2xl transition-colors ${open || isShown ? "bg-surface shadow-soft" : "hover:bg-surface/70"}`}
    >
      <div className="flex items-center gap-3 p-2 pr-2 md:gap-4">
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            showPizza(pizza.id);
          }}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left md:gap-4"
        >
          <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sunken md:size-16">
            {pizza.imageUrl && (
              <Image src={pizza.imageUrl} alt="" fill sizes="64px" className="object-cover" loading="lazy" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-medium">{pizza.name}</span>
              {pizza.tags.includes("vegetarian") && <LeafIcon size={14} className="shrink-0 text-muted" aria-label="veģetāra" />}
              {pizza.tags.includes("spicy") && <FireIcon size={14} className="shrink-0 text-accent" aria-label="asa" />}
            </span>
            {showPizzeria && <span className="block text-xs font-medium text-muted">{PIZZERIAS[pizza.pizzeriaId].name}</span>}
            <span className="mt-0.5 line-clamp-1 text-sm text-muted md:line-clamp-2">{toppingLine(pizza)}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-right">
            <span className="tabular block font-mono text-[0.95rem] font-medium">{euro(v.price)}</span>
            <span className="block text-xs text-muted">{v.label}</span>
          </span>
          <button
            type="button"
            onClick={(e) => add(v, e)}
            aria-label={`Pievienot ${pizza.name} ${v.label}`}
            className="grid size-11 place-items-center rounded-full bg-accent text-accent-ink transition-transform duration-150 active:scale-[0.92]"
          >
            <PlusIcon size={18} weight="bold" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="px-3 pb-3 md:pl-[5.5rem]"
          >
            <p className="mb-3 text-sm leading-relaxed text-muted">{pizza.rawIngredients.join(", ")}</p>
            <div className="flex flex-wrap gap-2">
              {pizza.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={(e) => add(variant, e)}
                  className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-bg px-3.5 text-sm transition-[transform,border-color] hover:border-accent active:scale-[0.97]"
                >
                  <PlusIcon size={14} className="text-accent" weight="bold" />
                  {variant.label}
                  <span className="font-mono font-medium">{euro(variant.price)}</span>
                  <span className="hidden font-mono text-xs text-muted sm:inline">
                    {twoDecimals((variant.price / pizzaArea(variant.diameterCm)) * 100)} €/dm²
                  </span>
                </button>
              ))}
              <a
                href={pizza.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center px-2 text-sm font-medium text-accent"
              >
                Atvērt {PIZZERIAS[pizza.pizzeriaId].name}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
