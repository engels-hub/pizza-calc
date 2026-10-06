"use client";

import { XIcon } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { lv } from "@/content/lv";
import type { CartLine } from "@/lib/discounts";
import { euro, variantLabel } from "@/lib/format";
import { ingredientDef, ingredientLabel } from "@/lib/ingredients";
import { spring } from "@/lib/motion";
import { useStore } from "@/lib/store";
import type { Pizza } from "@/lib/types";
import { SizeSelect } from "../ui/SizeSelect";
import { Stepper } from "../ui/Stepper";

export function CartLineItem({ line, pizza }: { line: CartLine; pizza?: Pizza }) {
  const active = useStore((s) => s.hovered === line.key);
  const setHovered = useStore((s) => s.setHovered);
  const setQty = useStore((s) => s.setQty);
  const setVariant = useStore((s) => s.setVariant);
  const reduce = useReducedMotion();
  const toppings = (pizza?.ingredients ?? []).filter((k) => ingredientDef(k).group !== "base");

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
        {pizza?.imageUrl && <Image src={pizza.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{line.name}</span>
        <span className="block truncate text-xs text-muted">{lv.pizzerias[line.pizzeriaId]}</span>
        {pizza && (
          <span className="mt-1.5 block">
            <SizeSelect
              variants={pizza.variants}
              value={line.key.slice(pizza.id.length + 1)}
              onChange={(v) => setVariant(line.key, pizza, v)}
              label={lv.cart.sizeOf(line.name)}
              withPrices
            />
          </span>
        )}
      </span>
      <span className="flex flex-col items-end gap-1">
        <Stepper
          size="sm"
          label={lv.cart.quantity(line.name)}
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
            aria-label={lv.summary.remove(line.name, variantLabel(line))}
            title={lv.summary.remove(line.name, variantLabel(line))}
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
