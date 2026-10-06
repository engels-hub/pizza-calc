"use client";

import { FireIcon, LeafIcon, PlusIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { lv } from "@/content/lv";
import { pricePer100cm2 } from "@/lib/calc";
import { preferredVariant, toppingLine } from "@/lib/filter";
import { euro, twoDecimals, variantLabel } from "@/lib/format";
import { fadeSlide, spring } from "@/lib/motion";
import { useStore } from "@/lib/store";
import type { Pizza, Variant } from "@/lib/types";
import { flyToTicket } from "../cart/FlyLayer";

export function PizzaRow({ pizza, size, showPizzeria }: { pizza: Pizza; size: number; showPizzeria: boolean }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const addPizza = useStore((s) => s.addPizza);
  const inCart = useStore((s) => s.cart.reduce((n, l) => (l.pizzaId === pizza.id ? n + l.qty : n), 0));
  const preferred = preferredVariant(pizza, size);
  const pizzeria = lv.pizzerias[pizza.pizzeriaId];

  const add = (variant: Variant, e: React.MouseEvent<HTMLElement>) => {
    addPizza(pizza, variant);
    flyToTicket(e.currentTarget.getBoundingClientRect(), pizza.imageUrl);
  };

  return (
    <motion.li
      layout={reduce ? false : "position"}
      initial={reduce ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
      transition={spring}
      className={`rounded-2xl transition-colors ${open ? "bg-surface shadow-soft" : "hover:bg-surface/70"}`}
    >
      <div className="flex items-center gap-3 p-2 md:gap-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left md:gap-4"
        >
          <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sunken md:size-16">
            {pizza.imageUrl && <Image src={pizza.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
            {inCart > 0 && (
              <span className="absolute right-1 top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 font-pixel text-xs leading-5 text-accent-ink">
                {inCart}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-medium">{pizza.name}</span>
              {pizza.tags.includes("vegetarian") && (
                <LeafIcon size={14} className="shrink-0 text-muted" aria-label={lv.menu.vegetarian} />
              )}
              {pizza.tags.includes("spicy") && (
                <FireIcon size={14} className="shrink-0 text-accent" aria-label={lv.menu.spicy} />
              )}
            </span>
            {showPizzeria && <span className="block text-xs font-medium text-muted">{pizzeria}</span>}
            <span className="mt-0.5 line-clamp-1 text-sm text-muted md:line-clamp-2">{toppingLine(pizza)}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-right">
            <span className="tabular block text-[0.95rem] font-medium">{euro(preferred.price)}</span>
            <span className="block text-xs text-muted">{variantLabel(preferred)}</span>
          </span>
          <button
            type="button"
            onClick={(e) => add(preferred, e)}
            aria-label={lv.menu.add(pizza.name, variantLabel(preferred))}
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
            transition={fadeSlide}
            className="px-3 pb-3 md:pl-[5.5rem]"
          >
            <p className="mb-3 text-sm leading-relaxed text-muted">{pizza.rawIngredients.join(", ")}</p>
            <div className="flex flex-wrap gap-2">
              {pizza.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={(e) => add(variant, e)}
                  aria-label={lv.menu.add(pizza.name, variantLabel(variant))}
                  className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-bg px-3.5 text-sm transition-[transform,border-color] hover:border-accent active:scale-[0.97]"
                >
                  <PlusIcon size={14} className="text-accent" weight="bold" />
                  {variantLabel(variant)}
                  <span className="tabular font-medium">{euro(variant.price)}</span>
                  <span className="tabular hidden text-xs text-muted sm:inline">
                    {lv.menu.perArea(twoDecimals(pricePer100cm2(variant.price, variant.diameterCm)))}
                  </span>
                </button>
              ))}
              <a
                href={pizza.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center px-2 text-sm font-medium text-accent"
              >
                {lv.menu.open(pizzeria)}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
