"use client";

import { CheckIcon, CopyIcon, ReceiptIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { piecesNeeded, pizzaArea, targetArea } from "@/lib/calc";
import { computeTotals, isPromoActive, togglePromo, type CustomDiscount, type Promo, type Totals } from "@/lib/discounts";
import { euro, picas, shortDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PIZZERIAS, type PizzeriaId } from "@/lib/types";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { Segmented } from "./ui/Segmented";
import { Stepper } from "./ui/Stepper";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

export function useTotals(promos: Promo[], today: string | null): Totals {
  const cart = useStore((s) => s.cart);
  const active = useStore((s) => s.activePromos);
  const custom = useStore((s) => s.custom);
  return useMemo(() => {
    const applied = promos.filter((p) => active.includes(p.id) && (!today || isPromoActive(p, today)));
    return computeTotals(cart, applied, custom);
  }, [cart, active, custom, promos, today]);
}

export function OrderTicket({ promos, today }: { promos: Promo[]; today: string | null }) {
  const cart = useStore((s) => s.cart);
  const setQty = useStore((s) => s.setQty);
  const clearCart = useStore((s) => s.clearCart);
  const totals = useTotals(promos, today);
  const reduce = useReducedMotion();

  const groups = (["picu", "lulu"] as PizzeriaId[])
    .map((id) => ({ id, lines: cart.filter((l) => l.pizzeriaId === id) }))
    .filter((g) => g.lines.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <ReceiptIcon size={22} className="text-muted" />
        <h2 className="text-xl font-semibold tracking-tight">Pasūtījums</h2>
        {cart.length > 0 && (
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

      <Coverage />

      {cart.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-muted">
          <p className="font-medium text-ink">Grozs ir tukšs.</p>
          <p className="mt-1">Pievieno picas no saraksta ar pogu +.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g) => (
            <div key={g.id}>
              <p className="mb-1.5 text-xs font-semibold text-muted">{PIZZERIAS[g.id].name}</p>
              <ul className="flex flex-col">
                <AnimatePresence initial={false}>
                  {g.lines.map((l) => (
                    <motion.li
                      key={l.key}
                      layout={reduce ? false : "position"}
                      initial={reduce ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16, transition: { duration: 0.12 } }}
                      transition={spring}
                      className="flex items-center gap-3 py-1.5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{l.name}</span>
                        <span className="block text-xs text-muted">
                          {l.variantLabel}, {euro(l.unitPrice)}
                        </span>
                      </span>
                      <Stepper size="sm" label={`${l.name} skaits`} value={l.qty} min={0} max={30} onChange={(q) => setQty(l.key, q)}>
                        <span className="tabular w-5 text-center font-mono text-sm">{l.qty}</span>
                      </Stepper>
                      <span className="tabular w-[4.5rem] text-right font-mono text-sm">{euro(l.unitPrice * l.qty)}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ))}
        </div>
      )}

      <DiscountPanel promos={promos} today={today} />

      <TotalsBlock totals={totals} />
    </div>
  );
}

function Coverage() {
  const cart = useStore((s) => s.cart);
  const people = useStore((s) => s.people);
  const rules = useStore((s) => s.rules);
  const size = useStore((s) => s.size);

  const need = targetArea(people, rules);
  const have = cart.reduce((s, l) => s + pizzaArea(l.diameterCm) * l.qty, 0);
  if (cart.length === 0) return null;

  const missing = need - have;
  const enough = missing <= pizzaArea(size) * 0.05;
  const more = enough ? 0 : piecesNeeded(missing, size);

  return (
    <motion.div
      layout="position"
      className={`flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-sm ${enough ? "bg-sunken" : "bg-accent-soft"}`}
    >
      {enough ? (
        <CheckIcon size={18} weight="bold" className="mt-px shrink-0 text-ink" />
      ) : (
        <WarningCircleIcon size={18} weight="bold" className="mt-px shrink-0 text-accent" />
      )}
      <span>
        {enough ? (
          <>
            Pietiek {people} cilvēkiem
            {have > need * 1.25 && <span className="text-muted">, paliks pāri</span>}.
          </>
        ) : (
          <>
            Vēl vajag apmēram{" "}
            <strong className="font-semibold">
              {more} {picas(more)} pa {size} cm
            </strong>
            .
          </>
        )}
      </span>
    </motion.div>
  );
}

function DiscountPanel({ promos, today }: { promos: Promo[]; today: string | null }) {
  const active = useStore((s) => s.activePromos);
  const setActive = useStore((s) => s.setActivePromos);
  const custom = useStore((s) => s.custom);
  const setCustom = useStore((s) => s.setCustom);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1400);
    } catch {
      /* clipboard blocked, the code is visible anyway */
    }
  };

  const kind = custom?.kind ?? "percent";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted">Atlaides</p>
      <ul className="flex flex-col gap-1.5">
        {promos.map((p) => {
          const live = !today || isPromoActive(p, today);
          const on = active.includes(p.id) && live;
          const expired = today && p.validTo && today > p.validTo;
          const when = p.validTo
            ? expired
              ? `beidzās ${shortDate(p.validTo)}`
              : today && p.validFrom && today < p.validFrom
                ? `no ${shortDate(p.validFrom)}`
                : `līdz ${shortDate(p.validTo)}`
            : null;
          return (
            <li key={p.id}>
              <div
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2 transition-colors ${
                  on ? "border-accent bg-accent-soft" : "border-line"
                } ${live ? "" : "opacity-45"}`}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  disabled={!live}
                  onClick={() => setActive(togglePromo(active, p, promos))}
                  className="flex min-h-10 min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-md border transition-colors ${
                      on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface"
                    }`}
                  >
                    {on && <CheckIcon size={12} weight="bold" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{p.title}</span>
                    <span className="block text-xs text-muted">
                      {PIZZERIAS[p.pizzeriaId].name}
                      {when && `, ${when}`}
                    </span>
                  </span>
                </button>
                {p.code && (
                  <button
                    type="button"
                    onClick={() => copy(p.code!)}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-sunken px-2.5 font-mono text-xs font-medium transition-transform active:scale-[0.96]"
                    aria-label={`Kopēt kodu ${p.code}`}
                  >
                    {p.code}
                    {copied === p.code ? <CheckIcon size={12} weight="bold" /> : <CopyIcon size={12} />}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="custom-discount" className="text-sm text-muted">
          Sava atlaide
        </label>
        <div className="ml-auto flex items-center gap-2">
          <input
            id="custom-discount"
            inputMode="decimal"
            placeholder="0"
            value={custom?.value ? String(custom.value).replace(".", ",") : ""}
            onChange={(e) => {
              const v = Number(e.target.value.replace(",", ".").replace(/[^\d.]/g, ""));
              setCustom(v > 0 ? ({ kind, value: v } as CustomDiscount) : null);
            }}
            className="tabular h-10 w-20 rounded-full border border-line bg-surface px-3 text-right font-mono text-sm outline-none focus:border-accent"
          />
          <Segmented
            id="custom-kind"
            label="Atlaides veids"
            value={kind}
            onChange={(k) => setCustom(custom ? ({ kind: k, value: custom.value } as CustomDiscount) : null)}
            options={[
              { value: "percent", label: "%" },
              { value: "fixed", label: "€" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function TotalsBlock({ totals }: { totals: Totals }) {
  const people = useStore((s) => s.people);
  const hasDiscount = totals.saved > 0;
  return (
    <div className="flex flex-col gap-1.5 border-t border-line pt-4">
      <div className="flex justify-between text-sm text-muted">
        <span>Bez atlaidēm</span>
        <span className={`tabular font-mono ${hasDiscount ? "line-through decoration-1" : ""}`}>{euro(totals.subtotal)}</span>
      </div>
      <AnimatePresence initial={false}>
        {totals.discounts.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-between text-sm"
          >
            <span className="truncate pr-3">{d.title}</span>
            <span className="tabular font-mono text-accent">−{euro(d.amount)}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-sm font-medium">Kopā</span>
        <AnimatedNumber value={totals.total} format={euro} className="font-mono text-3xl font-medium tracking-tighter" />
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>
          {totals.pizzaCount} {picas(totals.pizzaCount)}, {euro(totals.pizzaCount ? totals.total / people : 0)} uz cilvēku
        </span>
        {hasDiscount && <span className="font-medium text-ink">Ietaupi {euro(totals.saved)}</span>}
      </div>
    </div>
  );
}
