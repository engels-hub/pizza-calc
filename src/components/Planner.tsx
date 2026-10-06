"use client";

import { ArrowCounterClockwiseIcon, CaretDownIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { APPETITES, DEFAULT_RULES, basePizzas, exactPieces, piecesNeeded, targetArea } from "@/lib/calc";
import type { SizeOption } from "@/lib/filter";
import { cilveki, oneDecimal, picas, twoDecimals } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PIZZERIAS } from "@/lib/types";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { Segmented } from "./ui/Segmented";
import { Dither } from "./ui/Dither";
import { Stepper } from "./ui/Stepper";

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

export function Planner({ sizes }: { sizes: SizeOption[] }) {
  const people = useStore((s) => s.people);
  const setPeople = useStore((s) => s.setPeople);
  const rules = useStore((s) => s.rules);
  const size = useStore((s) => s.size);
  const setSize = useStore((s) => s.setSize);

  const area = targetArea(people, rules);
  const count = piecesNeeded(area, size);

  return (
    <section aria-label="Aprēķins" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-12">
      <div className="flex flex-col gap-7">
        <div>
          <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-5xl">Cik picu vajag?</h1>
          <p className="mt-3 max-w-[40ch] text-base leading-relaxed text-muted">
            Ievadi cilvēku skaitu, izvēlies izmēru un salīdzini Picu darbnīcas un LuLū cenas.
          </p>
        </div>

        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4">
          <div>
            <label htmlFor="people" className="text-sm font-medium text-muted">
              Cilvēku skaits
            </label>
            <div className="mt-2">
              <Stepper look="bevel" value={people} onChange={setPeople} min={1} max={60} label="Cilvēku skaits">
                <input
                  id="people"
                  inputMode="numeric"
                  value={people}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/\D/g, ""));
                    if (n) setPeople(n);
                  }}
                  className="tabular w-16 bg-transparent text-center font-pixel text-5xl leading-none outline-none"
                  aria-describedby="people-unit"
                />
              </Stepper>
              <span id="people-unit" className="sr-only">
                {cilveki(people)}
              </span>
            </div>
          </div>

          <div className="bevel bevel-in relative overflow-hidden px-4 py-3 text-right" aria-live="polite">
            <Dither
              className="absolute inset-0"
              shape="linear"
              bands={6}
              from="var(--surface)"
              to="color-mix(in oklch, var(--accent) 22%, var(--surface))"
            />
            <p className="relative text-sm font-medium text-muted">Jums vajag</p>
            <p className="relative mt-1.5 whitespace-nowrap font-pixel text-5xl leading-none sm:text-6xl">
              <AnimatedNumber value={count} format={(n) => String(Math.round(n))} />
              <span className="text-xl text-muted sm:text-2xl"> × {size} cm</span>
            </p>
          </div>
        </div>

        <PizzaRow count={count} size={size} />
      </div>

      <div className="flex flex-col gap-4">
        <SizePicker sizes={sizes} area={area} selected={size} onSelect={setSize} />
        <RulesPanel people={people} />
      </div>
    </section>
  );
}

/** Row of pizzas drawn to scale; they pop in and out as the count changes. */
function PizzaRow({ count, size }: { count: number; size: number }) {
  const reduce = useReducedMotion();
  const shown = Math.min(count, 18);
  const px = Math.round(12 + (size / 45) * 36);
  return (
    <div className="flex min-h-14 flex-wrap items-center gap-1.5" aria-hidden>
      <AnimatePresence initial={false} mode="popLayout">
        {Array.from({ length: shown }, (_, i) => (
          <motion.span
            key={`${size}-${i}`}
            layout
            initial={reduce ? false : { scale: 0, opacity: 0, rotate: -40 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ ...spring, delay: reduce ? 0 : Math.min(i, 10) * 0.025 }}
            className="pizza-dot rounded-full"
            style={{ width: px, height: px }}
          />
        ))}
      </AnimatePresence>
      {count > shown && <span className="ml-1 text-sm text-muted">+{count - shown}</span>}
    </div>
  );
}

function SizePicker({
  sizes,
  area,
  selected,
  onSelect,
}: {
  sizes: SizeOption[];
  area: number;
  selected: number;
  onSelect: (d: number) => void;
}) {
  const max = Math.max(...sizes.map((s) => s.diameter));
  return (
    <div>
      <p className="text-sm font-medium text-muted">Izmērs</p>
      <div
        className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
        role="radiogroup"
        aria-label="Izmērs"
      >
        {sizes.map((s) => {
          const exact = exactPieces(area, s.diameter);
          const n = piecesNeeded(area, s.diameter);
          const active = s.diameter === selected;
          const dot = 14 + (s.diameter / max) * 30;
          return (
            <button
              key={s.diameter}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(s.diameter)}
              className={`bevel flex min-w-0 items-center gap-3 p-3 text-left ${active ? "!bg-accent-soft" : ""}`}
            >
              <span className="grid size-11 shrink-0 place-items-center">
                <span className="pizza-dot rounded-full" style={{ width: dot, height: dot }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{s.diameter} cm</span>
                  <span className="font-pixel text-2xl leading-none">{n}×</span>
                </span>
                <span className="mt-1 block truncate text-xs text-muted">
                  {s.pizzerias.map((p) => PIZZERIAS[p].name.split(" ")[0]).join(", ")}
                  {Math.abs(exact - Math.round(exact)) > 0.05 && `, precīzi ${oneDecimal(exact)}`}
                </span>
                <span className="block truncate text-xs text-muted" title="Lētākā cena par 100 cm²">
                  no {twoDecimals(s.bestPer100)} €/dm²
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RulesPanel({ people }: { people: number }) {
  const [open, setOpen] = useState(false);
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const resetRules = useStore((s) => s.resetRules);
  const base = basePizzas(people, rules);
  const isDefault =
    rules.factor === DEFAULT_RULES.factor &&
    rules.offset === DEFAULT_RULES.offset &&
    rules.baseDiameter === DEFAULT_RULES.baseDiameter;

  const formula = useMemo(() => {
    const f = rules.factor === 1 ? "n" : `n × ${twoDecimals(rules.factor)}`;
    if (rules.offset === 0) return f;
    return rules.offset > 0 ? `${f} − ${rules.offset}` : `${f} + ${-rules.offset}`;
  }, [rules]);

  const appetite = APPETITES.find((a) => a.factor === rules.factor)?.id;

  return (
    <div className="rounded-2xl bg-sunken/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-12 w-full items-center gap-3 px-4 text-left"
      >
        <SlidersHorizontalIcon size={18} className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1 py-2">
          <span className="block text-sm font-medium">Aprēķina noteikums</span>
          <span className="block text-xs text-muted">
            {formula} picas pa {rules.baseDiameter} cm
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="text-muted">
          <CaretDownIcon size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 px-4 pb-4"
          >
            <p className="max-w-[52ch] text-sm leading-relaxed text-muted">
              Picu darbnīcas īkšķa likums: n cilvēkiem pasūti n − 1 picas pa 30 cm. Citi izmēri tiek pārrēķināti pēc
              laukuma.
            </p>

            <div className=" text-sm">
              {people} {cilveki(people)} → {formula.replace("n", String(people))} ={" "}
              <strong className="font-semibold text-accent">
                {oneDecimal(base)} {picas(Math.ceil(base))}
              </strong>{" "}
              pa {rules.baseDiameter} cm
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-muted">Izsalkums</p>
                <Segmented
                  id="appetite"
                  label="Izsalkums"
                  value={appetite ?? "custom"}
                  onChange={(id) => {
                    const a = APPETITES.find((x) => x.id === id);
                    if (a) setRules({ factor: a.factor });
                  }}
                  options={APPETITES.map((a) => ({ value: a.id, label: a.label }))}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-muted">Atņemt picas</p>
                <Stepper
                  size="sm"
                  label="Atņemt picas"
                  value={rules.offset}
                  min={-2}
                  max={3}
                  onChange={(offset) => setRules({ offset })}
                >
                  <span className="tabular w-10 text-center text-lg">{rules.offset}</span>
                </Stepper>
              </div>

              <div>
                <label htmlFor="factor" className="mb-2 flex justify-between text-sm font-medium text-muted">
                  Picas uz cilvēku
                  <span className=" text-ink">{twoDecimals(rules.factor)}</span>
                </label>
                <input
                  id="factor"
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  value={rules.factor}
                  onChange={(e) => setRules({ factor: Number(e.target.value) })}
                  className="h-11 w-full accent-[var(--accent)]"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-muted">Mēra izmērs</p>
                <Segmented
                  id="base"
                  label="Mēra izmērs"
                  value={rules.baseDiameter}
                  onChange={(baseDiameter) => setRules({ baseDiameter })}
                  options={[20, 23, 30, 45].map((d) => ({ value: d, label: `${d}` }))}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isDefault}
              onClick={resetRules}
              className="inline-flex min-h-10 items-center gap-2 self-start rounded-full px-1 text-sm font-medium text-accent transition-opacity disabled:opacity-40"
            >
              <ArrowCounterClockwiseIcon size={16} />
              Atiestatīt uz n − 1
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
