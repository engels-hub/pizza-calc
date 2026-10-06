"use client";

import { TrashIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo } from "react";
import { euro, picas } from "@/lib/format";
import { ingredientDef } from "@/lib/ingredients";
import { useStore } from "@/lib/store";
import { PIZZERIAS, type Pizza } from "@/lib/types";
import type { StackUnit } from "./pizza3d/StackStage";
import { Coverage } from "./Summary";
import { Dither } from "./ui/Dither";
import { Stepper } from "./ui/Stepper";

// Three.js lives in its own client-only chunk, away from the Motion tree.
const StackStage = dynamic(() => import("./pizza3d/StackStage"), {
  ssr: false,
  loading: () => <div className="pizza-dot absolute inset-0 m-auto size-1/3 animate-pulse rounded-full opacity-40" />,
});

const MAX_STACK = 8;
const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

export function Cart({ pizzas }: { pizzas: Pizza[] }) {
  const cart = useStore((s) => s.cart);
  const hovered = useStore((s) => s.hovered);
  const setHovered = useStore((s) => s.setHovered);
  const setQty = useStore((s) => s.setQty);
  const clearCart = useStore((s) => s.clearCart);
  const reduce = useReducedMotion();

  const byId = useMemo(() => new Map(pizzas.map((p) => [p.id, p])), [pizzas]);
  const count = cart.reduce((n, l) => n + l.qty, 0);

  const units = useMemo(() => {
    const out: StackUnit[] = [];
    for (const l of cart) {
      const pizza = byId.get(l.pizzaId);
      if (!pizza) continue;
      for (let i = 0; i < l.qty && out.length < MAX_STACK; i++) {
        out.push({ key: `${l.key}#${i}`, lineKey: l.key, pizza, diameter: l.diameterCm });
      }
    }
    return out;
  }, [cart, byId]);

  return (
    <section aria-labelledby="cart-title" className="flex flex-col overflow-hidden rounded-3xl bg-sunken">
      <div className="flex items-center gap-3 px-5 pt-4">
        <h2 id="cart-title" className="text-xl font-semibold tracking-tight">
          Jūsu picas
        </h2>
        {count > 0 && <span className="text-sm text-muted">{`${count} ${picas(count)}`}</span>}
        {count > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm text-muted transition-colors hover:text-ink"
          >
            <TrashIcon size={16} />
            Notīrīt
          </button>
        )}
      </div>

      <div className="relative h-[38dvh] min-h-64 lg:h-[44dvh]" data-fly-target>
        <Dither
          className="absolute inset-0"
          from="var(--sunken)"
          to="color-mix(in oklch, var(--accent) 24%, var(--sunken))"
          bands={7}
          cell={4}
        />
        <div className="relative size-full">
          <StackStage units={units} hovered={hovered} onHover={setHovered} />
        </div>
        {count === 0 && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-sm text-muted">
            Pievieno picas no saraksta, tās sakrausies šeit.
          </p>
        )}
        {count > MAX_STACK && (
          <p className="pointer-events-none absolute bottom-3 right-4 text-xs text-muted">
            Rādītas {MAX_STACK} no {count}
          </p>
        )}
      </div>

      {count > 0 && (
        <div className="flex flex-col gap-3 px-3 pb-3">
          <div className="px-2">
            <Coverage />
          </div>
          <ul className="flex flex-col gap-1" onMouseLeave={() => setHovered(null)}>
            <AnimatePresence initial={false}>
              {cart.map((l) => {
                const pizza = byId.get(l.pizzaId);
                const active = hovered === l.key;
                const toppings = (pizza?.ingredients ?? []).map(ingredientDef).filter((d) => d.group !== "base");
                return (
                  <motion.li
                    key={l.key}
                    layout={reduce ? false : "position"}
                    initial={reduce ? false : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={spring}
                    onMouseEnter={() => setHovered(l.key)}
                    onFocus={() => setHovered(l.key)}
                    className={`grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-2xl p-2 transition-colors ${active ? "bg-surface shadow-soft" : ""}`}
                  >
                    <span className="relative size-12 overflow-hidden rounded-xl bg-bg">
                      {pizza?.imageUrl && (
                        <Image src={pizza.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{l.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {PIZZERIAS[l.pizzeriaId].name}, {l.variantLabel}, {euro(l.unitPrice)}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <Stepper
                        size="sm"
                        label={`${l.name} skaits`}
                        value={l.qty}
                        min={0}
                        max={30}
                        onChange={(q) => setQty(l.key, q)}
                      >
                        <span className="tabular w-5 text-center text-sm font-medium">{l.qty}</span>
                      </Stepper>
                      <span className="tabular text-sm font-medium">{euro(l.unitPrice * l.qty)}</span>
                    </span>
                    {toppings.length > 0 && (
                      <span className="col-span-2 col-start-2 flex flex-wrap gap-1">
                        {toppings.map((d) => (
                          <span
                            key={d.key}
                            className={`rounded-full px-2 py-0.5 text-[0.7rem] transition-colors duration-200 ${
                              active ? "bg-accent text-accent-ink" : "bg-bg text-muted"
                            }`}
                          >
                            {d.label}
                          </span>
                        ))}
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </section>
  );
}
