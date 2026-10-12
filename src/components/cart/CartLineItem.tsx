"use client";

import { XIcon } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { lv } from "@/content/lv";
import { PROMOS } from "@/data/promos";
import { isPromoActive, type CartLine } from "@/lib/discounts";
import { euro, variantLabel } from "@/lib/format";
import { canBeHalf, halfPartners, halvesVariant, isHalvesId } from "@/lib/halves";
import { ingredientDef, ingredientLabel } from "@/lib/ingredients";
import { spring } from "@/lib/motion";
import { useStore } from "@/lib/store";
import type { Pizza } from "@/lib/types";
import { HalfSelect } from "../ui/HalfSelect";
import { SizeSelect } from "../ui/SizeSelect";
import { Stepper } from "../ui/Stepper";

export function CartLineItem({ line, pizzas }: { line: CartLine; pizzas: Pizza[] }) {
  const active = useStore((s) => s.hovered === line.key);
  const setHovered = useStore((s) => s.setHovered);
  const setQty = useStore((s) => s.setQty);
  const setVariant = useStore((s) => s.setVariant);
  const setHalves = useStore((s) => s.setHalves);
  // Deals at this pizzeria are on, and LuLū does not say whether they cover Pus-Pus.
  const dealOn = useStore((s) =>
    PROMOS.some((p) => p.pizzeriaId === line.pizzeriaId && s.activePromos.includes(p.id) && isPromoActive(p, s.today)),
  );
  const reduce = useReducedMotion();

  const pizza = pizzas.find((p) => p.id === line.pizzaId);
  const other = line.half ? pizzas.find((p) => p.id === line.half!.pizzaId) : undefined;
  const name = line.half ? lv.halves.name(line.name, line.half.name) : line.name;
  const partners = pizza && line.half ? halfPartners(pizza, pizzas) : [];
  // A Pus-Pus line can go back to a whole pizza; a whole line stays whole (it has no second half to offer).
  const variants =
    pizza && line.half && canBeHalf(pizza) && other ? [...pizza.variants, halvesVariant(pizza, other)] : pizza?.variants;
  const toppings = [...new Set([...(pizza?.ingredients ?? []), ...(other?.ingredients ?? [])])].filter(
    (k) => ingredientDef(k).group !== "base",
  );

  return (
    <motion.li
      layout={reduce ? false : "position"}
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={spring}
      onMouseEnter={() => setHovered(line.key)}
      onFocus={() => setHovered(line.key)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHovered(null);
      }}
      className={`grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-2xl p-2 transition-colors ${
        active ? "bg-surface shadow-soft" : ""
      }`}
    >
      <span className="relative size-12 overflow-hidden rounded-xl bg-bg">
        {pizza?.imageUrl && (
          <Image
            src={pizza.imageUrl}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
            style={other ? { clipPath: "inset(0 50% 0 0)" } : undefined}
          />
        )}
        {other?.imageUrl && (
          <Image
            src={other.imageUrl}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
            style={{ clipPath: "inset(0 0 0 50%)" }}
          />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium [overflow-wrap:anywhere]">{name}</span>
        <span className="block truncate text-xs text-muted">{lv.pizzerias[line.pizzeriaId]}</span>
        {pizza && variants && (
          <span className="mt-1.5 flex flex-wrap gap-2">
            <SizeSelect
              variants={variants}
              value={line.key.slice(pizza.id.length + 1)}
              onChange={(v) => {
                if (!isHalvesId(v.id)) setVariant(line.key, pizza, v);
              }}
              label={lv.cart.sizeOf(name)}
              withPrices
            />
            {line.half && (
              <HalfSelect
                partners={partners}
                value={line.half.pizzaId}
                onChange={(b) => setHalves(line.key, pizza, b)}
                label={lv.halves.otherOf(line.name)}
              />
            )}
          </span>
        )}
        {line.half && dealOn && <span className="mt-1 block text-xs text-muted">{lv.halves.dealNote}</span>}
      </span>
      <span className="flex flex-col items-end gap-1">
        <Stepper
          size="sm"
          label={lv.cart.quantity(name)}
          value={line.qty}
          min={0}
          max={30}
          onChange={(q) => setQty(line.key, q)}
        >
          <span className="tabular w-5 text-center text-sm font-medium">{line.qty}</span>
        </Stepper>
        <span className="flex items-center gap-1">
          <span className="tabular text-sm font-medium">{euro(line.unitPrice * line.qty)}</span>
          <button
            type="button"
            onClick={() => setQty(line.key, 0)}
            aria-label={lv.summary.remove(name, variantLabel(line))}
            title={lv.summary.remove(name, variantLabel(line))}
            className="-mr-1 grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-bg hover:text-accent active:scale-[0.94]"
          >
            <XIcon size={13} weight="bold" />
          </button>
        </span>
      </span>
      {toppings.length > 0 && (
        <span className="col-span-2 col-start-2 flex flex-wrap gap-1">
          {toppings.map((k) => (
            <span
              key={k}
              className={`rounded-full px-2 py-0.5 text-[0.7rem] transition-colors duration-200 ${
                active ? "bg-accent text-accent-ink" : "bg-bg text-muted"
              }`}
            >
              {ingredientLabel(k)}
            </span>
          ))}
        </span>
      )}
    </motion.li>
  );
}
