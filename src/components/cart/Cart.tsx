"use client";

import { TrashIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { lv } from "@/content/lv";
import { useStore } from "@/lib/store";
import type { Pizza } from "@/lib/types";
import type { StackUnit } from "../pizza3d/StackStage";
import { Dither } from "../ui/Dither";
import { AreaBar } from "./AreaBar";
import { CartLineItem } from "./CartLineItem";
import { Coverage } from "./Coverage";
import { ShareLink } from "./ShareLink";
import { SliceShare } from "./SliceShare";
import { TotalsBlock } from "./TotalsBlock";

// Three.js lives in its own client-only chunk, away from the Motion tree.
const StackStage = dynamic(() => import("../pizza3d/StackStage"), {
  ssr: false,
  loading: () => <div className="pizza-dot absolute inset-0 m-auto size-1/3 animate-pulse rounded-full opacity-40" />,
});

const MAX_STACK = 8;

export function Cart({ pizzas }: { pizzas: Pizza[] }) {
  const cart = useStore((s) => s.cart);
  const hovered = useStore((s) => s.hovered);
  const setHovered = useStore((s) => s.setHovered);
  const clearCart = useStore((s) => s.clearCart);

  const byId = new Map(pizzas.map((p) => [p.id, p]));
  const count = cart.reduce((n, l) => n + l.qty, 0);

  const units: StackUnit[] = [];
  for (const l of cart) {
    const pizza = byId.get(l.pizzaId);
    for (let i = 0; pizza && i < l.qty && units.length < MAX_STACK; i++) {
      units.push({ key: `${l.key}#${i}`, lineKey: l.key, pizza, diameter: l.diameterCm, shape: l.shape });
    }
  }

  return (
    <section
      aria-labelledby="cart-title"
      className="flex flex-col overflow-hidden rounded-3xl bg-sunken lg:max-h-[calc(100dvh-2rem)]"
    >
      <div className="flex items-center gap-3 px-5 pt-4">
        <h2 id="cart-title" className="text-xl font-semibold tracking-tight">
          {lv.cart.title}
        </h2>
        {count > 0 && <span className="text-sm text-muted">{lv.plural.pizzas(count)}</span>}
        {count > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm text-muted transition-colors hover:text-ink"
          >
            <TrashIcon size={16} />
            {lv.cart.clear}
          </button>
        )}
      </div>

      <div className="relative h-[38dvh] min-h-64 shrink-0 lg:h-[40dvh]" data-fly-target>
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
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-sm text-muted">{lv.cart.empty}</p>
        )}
        {count > MAX_STACK && (
          <p className="pointer-events-none absolute bottom-3 right-4 text-xs text-muted">
            {lv.cart.shownOf(MAX_STACK, count)}
          </p>
        )}
      </div>

      <div className="shrink-0 px-5 pb-3 pt-4">
        <AreaBar />
      </div>

      {count > 0 && (
        // On desktop the cart is sticky, so the lines and total scroll inside it.
        <div className="flex min-h-0 flex-col gap-3 px-3 pb-3 lg:overflow-y-auto">
          <div className="px-2">
            <Coverage />
          </div>
          <ul className="flex flex-col gap-1" onMouseLeave={() => setHovered(null)}>
            <AnimatePresence initial={false}>
              {cart.map((l, i) => (
                // Keyed by pizza + occurrence, not size, so switching size keeps the row (and focus).
                <CartLineItem
                  key={`${l.pizzaId}#${cart.slice(0, i).filter((x) => x.pizzaId === l.pizzaId).length}`}
                  line={l}
                  pizza={byId.get(l.pizzaId)}
                />
              ))}
            </AnimatePresence>
          </ul>

          <div id="totals" className="flex scroll-mt-6 flex-col gap-4 border-t border-line px-2 pt-4">
            <SliceShare withHint />
            <TotalsBlock />
            <ShareLink />
          </div>
        </div>
      )}
    </section>
  );
}
